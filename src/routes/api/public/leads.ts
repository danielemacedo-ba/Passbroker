import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const payloadSchema = z.object({
  nome: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().optional(),
  campanha: z.string().optional(),
  segmento: z.string().optional(),
  regiao: z.string().optional(),
  temperatura: z.enum(["frio", "morno", "quente"]).optional(),
  tags: z.array(z.string()).optional(),
  dados_extra: z.record(z.any()).optional(),
});

export const Route = createFileRoute("/api/public/leads")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = request.headers.get("x-api-key") ?? "";
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (!apiKey) return Response.json({ error: "x-api-key ausente" }, { status: 401 });

        const { data: source } = await supabaseAdmin
          .from("lead_sources")
          .select("id, ativo")
          .eq("api_key", apiKey)
          .maybeSingle();

        if (!source || !source.ativo) {
          return Response.json({ error: "API key inválida ou inativa" }, { status: 401 });
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          await supabaseAdmin
            .from("webhook_logs")
            .insert({ source_id: source.id, sucesso: false, erro: "JSON inválido" });
          return Response.json({ error: "JSON inválido" }, { status: 400 });
        }

        const parsed = payloadSchema.safeParse(raw);
        if (!parsed.success) {
          await supabaseAdmin.from("webhook_logs").insert({
            source_id: source.id,
            payload: raw as never,
            sucesso: false,
            erro: parsed.error.message.slice(0, 500),
          });
          return Response.json({ error: "Payload inválido" }, { status: 400 });
        }

        const p = parsed.data;
        if (!p.telefone && !p.email) {
          await supabaseAdmin.from("webhook_logs").insert({
            source_id: source.id,
            payload: raw as never,
            sucesso: false,
            erro: "telefone ou email obrigatório",
          });
          return Response.json({ error: "telefone ou email obrigatório" }, { status: 400 });
        }

        const { data: lead, error } = await supabaseAdmin
          .from("leads")
          .insert({
            source_id: source.id,
            nome: p.nome ?? null,
            telefone: p.telefone ?? null,
            email: p.email ?? null,
            campanha: p.campanha ?? null,
            segmento: p.segmento ?? null,
            regiao: p.regiao ?? null,
            temperatura: p.temperatura ?? null,
            tags: p.tags ?? [],
            dados_extra: (p.dados_extra ?? {}) as never,
            status: "pendente",
          })
          .select("id")
          .single();

        await supabaseAdmin.from("webhook_logs").insert({
          source_id: source.id,
          payload: raw as never,
          sucesso: !error,
          erro: error?.message ?? null,
          lead_id: lead?.id ?? null,
        });

        if (error) return Response.json({ error: "Falha ao gravar lead" }, { status: 500 });
        return Response.json({ ok: true, lead_id: lead.id }, { status: 201 });
      },
    },
  },
});
