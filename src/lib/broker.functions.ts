import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type CurateInput = {
  leadId: string;
  acao: "aprovar" | "reprovar";
  preco?: number;
  tags?: string[];
  temperatura?: string;
  motivo?: string;
};

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    return {
      profile,
      roles: (roles ?? []).map((r: { role: string }) => r.role),
      isAdmin: (roles ?? []).some((r: { role: string }) => r.role === "admin"),
    };
  });

// Marketplace: preview sem dados sensíveis (nome/telefone/email ocultos)
export const listMarketplace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("id, segmento, regiao, temperatura, campanha, tags, preco, created_at, nome, telefone, email")
      .eq("status", "aprovado")
      .is("buyer_id", null)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []).map((l) => ({
      id: l.id,
      segmento: l.segmento,
      regiao: l.regiao,
      temperatura: l.temperatura,
      campanha: l.campanha,
      tags: l.tags,
      preco: Number(l.preco ?? 0),
      created_at: l.created_at,
      preview_nome: l.nome ? `${l.nome.split(" ")[0]} ${"•".repeat(5)}` : "Contato disponível",
      preview_telefone: l.telefone ? `${l.telefone.slice(0, 5)}••••••` : null,
      preview_email: l.email ? `${l.email.slice(0, 2)}•••@${l.email.split("@")[1] ?? "•••"}` : null,
    }));
  });

export const purchaseLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { leadIds: string[] }) => {
    if (!Array.isArray(d?.leadIds) || d.leadIds.length === 0) throw new Error("Selecione ao menos um lead");
    return { leadIds: d.leadIds.slice(0, 100) };
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: leads, error: leadsErr } = await supabaseAdmin
      .from("leads")
      .select("id, preco, status, buyer_id")
      .in("id", data.leadIds)
      .eq("status", "aprovado")
      .is("buyer_id", null);
    if (leadsErr) throw new Error(leadsErr.message);
    if (!leads || leads.length === 0) throw new Error("Leads indisponíveis");

    const total = leads.reduce((s, l) => s + Number(l.preco ?? 0), 0);

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("saldo")
      .eq("id", userId)
      .maybeSingle();
    const saldo = Number(profile?.saldo ?? 0);
    if (saldo < total) throw new Error(`Saldo insuficiente. Necessário R$ ${total.toFixed(2)}`);

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        buyer_id: userId,
        tipo: leads.length > 1 ? "lote" : "individual",
        valor_total: total,
        status_pagamento: "pago",
        gateway: "saldo",
      })
      .select("id")
      .single();
    if (orderErr) throw new Error(orderErr.message);

    await supabaseAdmin.from("order_items").insert(
      leads.map((l) => ({ order_id: order.id, lead_id: l.id, preco_unitario: Number(l.preco ?? 0) })),
    );

    const { error: updErr } = await supabaseAdmin
      .from("leads")
      .update({ buyer_id: userId, status: "vendido" })
      .in(
        "id",
        leads.map((l) => l.id),
      )
      .is("buyer_id", null);
    if (updErr) throw new Error(updErr.message);

    await supabaseAdmin.from("profiles").update({ saldo: saldo - total }).eq("id", userId);
    await supabaseAdmin.from("invoices").insert({ order_id: order.id, buyer_id: userId, valor: total, status: "paga" });

    return { orderId: order.id, total, quantidade: leads.length };
  });

export const listMyLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("leads")
      .select("*")
      .eq("buyer_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getFinance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: orders }, { data: invoices }] = await Promise.all([
      supabase.from("profiles").select("saldo, nome, email").eq("id", userId).maybeSingle(),
      supabase.from("orders").select("*").eq("buyer_id", userId).order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").eq("buyer_id", userId).order("created_at", { ascending: false }),
    ]);
    return { saldo: Number(profile?.saldo ?? 0), profile, orders: orders ?? [], invoices: invoices ?? [] };
  });

/* ---------------- ADMIN ---------------- */

export const adminListLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { status?: string }) => ({ status: d?.status ?? "pendente" }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let q = context.supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(300);
    if (data.status !== "todos") q = q.eq("status", data.status);
    const { data: leads, error } = await q;
    if (error) throw new Error(error.message);
    return leads ?? [];
  });

export const adminCurateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: CurateInput) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const patch: Record<string, unknown> =
      data.acao === "aprovar"
        ? {
            status: "aprovado",
            preco: data.preco ?? 0,
            ...(data.tags ? { tags: data.tags } : {}),
            ...(data.temperatura ? { temperatura: data.temperatura } : {}),
          }
        : { status: "reprovado", motivo_reprovacao: data.motivo ?? "Sem motivo informado" };

    const { error } = await context.supabase.from("leads").update(patch).eq("id", data.leadId);
    if (error) throw new Error(error.message);

    await context.supabase.from("lead_audit").insert({
      lead_id: data.leadId,
      actor_id: context.userId,
      acao: data.acao,
      motivo: data.motivo ?? null,
    });
    return { ok: true };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const s = context.supabase;
    const count = async (status?: string) => {
      let q = s.from("leads").select("id", { count: "exact", head: true });
      if (status) q = q.eq("status", status);
      const { count: c } = await q;
      return c ?? 0;
    };
    const [total, pendentes, aprovados, reprovados, vendidos] = await Promise.all([
      count(),
      count("pendente"),
      count("aprovado"),
      count("reprovado"),
      count("vendido"),
    ]);
    const { data: orders } = await s.from("orders").select("valor_total");
    const receita = (orders ?? []).reduce((acc: number, o: { valor_total: number }) => acc + Number(o.valor_total), 0);
    return { total, pendentes, aprovados, reprovados, vendidos, receita };
  });

export const adminListSources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("lead_sources")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminCreateSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { nome: string }) => {
    if (!d?.nome?.trim()) throw new Error("Informe o nome da fonte");
    return { nome: d.nome.trim() };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: row, error } = await context.supabase
      .from("lead_sources")
      .insert({ nome: data.nome })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminToggleSource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; ativo: boolean }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("lead_sources")
      .update({ ativo: data.ativo })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminWebhookLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("webhook_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminAddBalance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string; valor: number }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: p } = await supabaseAdmin
      .from("profiles")
      .select("id, saldo")
      .eq("email", data.email)
      .maybeSingle();
    if (!p) throw new Error("Usuário não encontrado");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ saldo: Number(p.saldo) + Number(data.valor) })
      .eq("id", p.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, nome, email, saldo, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
