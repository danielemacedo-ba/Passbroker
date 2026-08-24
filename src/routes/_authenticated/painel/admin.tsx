import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  adminAddBalance,
  adminCreateSource,
  adminCurateLead,
  adminListLeads,
  adminListSources,
  adminListUsers,
  adminStats,
  adminToggleSource,
  adminWebhookLogs,
} from "@/lib/broker.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/painel/admin")({
  component: Admin,
});

function Admin() {
  return (
    <div className="space-y-6">
      <Stats />
      <Tabs defaultValue="curadoria">
        <TabsList className="flex-wrap">
          <TabsTrigger value="curadoria">Curadoria</TabsTrigger>
          <TabsTrigger value="fontes">Fontes / API</TabsTrigger>
          <TabsTrigger value="logs">Logs webhook</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
        </TabsList>
        <TabsContent value="curadoria" className="mt-4">
          <Curadoria />
        </TabsContent>
        <TabsContent value="fontes" className="mt-4">
          <Fontes />
        </TabsContent>
        <TabsContent value="logs" className="mt-4">
          <Logs />
        </TabsContent>
        <TabsContent value="usuarios" className="mt-4">
          <Usuarios />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stats() {
  const fn = useServerFn(adminStats);
  const { data } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn({}) });
  const cards = [
    { label: "Total", value: data?.total ?? 0 },
    { label: "Pendentes", value: data?.pendentes ?? 0 },
    { label: "Aprovados", value: data?.aprovados ?? 0 },
    { label: "Vendidos", value: data?.vendidos ?? 0 },
    { label: "Receita", value: `R$ ${Number(data?.receita ?? 0).toFixed(2)}` },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">{c.label}</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-bold">{c.value}</CardContent>
        </Card>
      ))}
    </div>
  );
}

function Curadoria() {
  const list = useServerFn(adminListLeads);
  const curate = useServerFn(adminCurateLead);
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("pendente");
  const [precos, setPrecos] = useState<Record<string, string>>({});

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-leads", status],
    queryFn: () => list({ data: { status } }),
  });

  const acao = useMutation({
    mutationFn: (v: { leadId: string; acao: "aprovar" | "reprovar"; preco?: number; motivo?: string }) =>
      curate({ data: v }),
    onSuccess: () => {
      toast.success("Lead atualizado");
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtros = ["pendente", "aprovado", "reprovado", "vendido", "todos"];

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center gap-2">
        <CardTitle className="mr-auto">Curadoria de leads</CardTitle>
        {filtros.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={status === f ? "default" : "outline"}
            onClick={() => setStatus(f)}
          >
            {f}
          </Button>
        ))}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum lead com status "{status}".</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contato</TableHead>
                  <TableHead>Segmento / Região</TableHead>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-72 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((l: any) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <div className="font-medium">{l.nome ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {l.telefone ?? "—"} · {l.email ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {l.segmento ?? "—"} / {l.regiao ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">{l.campanha ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{l.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Input
                          className="w-24"
                          placeholder="Preço"
                          inputMode="decimal"
                          value={precos[l.id] ?? (l.preco ? String(l.preco) : "")}
                          onChange={(e) => setPrecos((p) => ({ ...p, [l.id]: e.target.value }))}
                        />
                        <Button
                          size="sm"
                          disabled={acao.isPending}
                          onClick={() =>
                            acao.mutate({
                              leadId: l.id,
                              acao: "aprovar",
                              preco: Number((precos[l.id] ?? l.preco ?? "0").toString().replace(",", ".")),
                            })
                          }
                        >
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={acao.isPending}
                          onClick={() =>
                            acao.mutate({ leadId: l.id, acao: "reprovar", motivo: "Reprovado na curadoria" })
                          }
                        >
                          Reprovar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Fontes() {
  const list = useServerFn(adminListSources);
  const create = useServerFn(adminCreateSource);
  const toggle = useServerFn(adminToggleSource);
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");

  const { data = [] } = useQuery({ queryKey: ["admin-sources"], queryFn: () => list({}) });

  const criar = useMutation({
    mutationFn: () => create({ data: { nome } }),
    onSuccess: () => {
      setNome("");
      toast.success("Fonte criada");
      queryClient.invalidateQueries({ queryKey: ["admin-sources"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const alternar = useMutation({
    mutationFn: (v: { id: string; ativo: boolean }) => toggle({ data: v }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-sources"] }),
  });

  const endpoint =
    typeof window !== "undefined" ? `${window.location.origin}/api/public/leads` : "/api/public/leads";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Endpoint de ingestão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <code className="block rounded bg-muted px-3 py-2 font-mono text-xs">POST {endpoint}</code>
          <p className="text-muted-foreground">
            Envie o header <code>x-api-key</code> com a chave da fonte e um JSON com nome, telefone,
            email, campanha, segmento, regiao e tags.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>Fontes</CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Nome da fonte"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-56"
            />
            <Button onClick={() => criar.mutate()} disabled={!nome.trim() || criar.isPending}>
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma fonte cadastrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>API key</TableHead>
                  <TableHead>Ativa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.nome}</TableCell>
                    <TableCell>
                      <button
                        className="font-mono text-xs underline-offset-2 hover:underline"
                        onClick={() => {
                          navigator.clipboard.writeText(s.api_key);
                          toast.success("API key copiada");
                        }}
                      >
                        {s.api_key}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={s.ativo}
                        onCheckedChange={(v) => alternar.mutate({ id: s.id, ativo: v })}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Logs() {
  const fn = useServerFn(adminWebhookLogs);
  const { data = [] } = useQuery({ queryKey: ["admin-logs"], queryFn: () => fn({}) });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs de webhook</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma requisição recebida ainda.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Erro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell>{new Date(l.created_at).toLocaleString("pt-BR")}</TableCell>
                  <TableCell>
                    <Badge variant={l.sucesso ? "secondary" : "destructive"}>
                      {l.sucesso ? "ok" : "falha"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{l.erro ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function Usuarios() {
  const list = useServerFn(adminListUsers);
  const add = useServerFn(adminAddBalance);
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [valor, setValor] = useState("");

  const { data = [] } = useQuery({ queryKey: ["admin-users"], queryFn: () => list({}) });

  const creditar = useMutation({
    mutationFn: () => add({ data: { email, valor: Number(valor.replace(",", ".")) } }),
    onSuccess: () => {
      setEmail("");
      setValor("");
      toast.success("Saldo creditado");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle>Usuários</CardTitle>
        <div className="flex gap-2">
          <Input
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-56"
          />
          <Input
            placeholder="Valor"
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-28"
          />
          <Button onClick={() => creditar.mutate()} disabled={!email || !valor || creditar.isPending}>
            Creditar saldo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((u: any) => (
              <TableRow key={u.id}>
                <TableCell>{u.nome ?? "—"}</TableCell>
                <TableCell>{u.email ?? "—"}</TableCell>
                <TableCell className="text-right">R$ {Number(u.saldo).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
