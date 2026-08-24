import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyLeads } from "@/lib/broker.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/painel/meus-leads")({
  component: MeusLeads,
});

type Lead = {
  id: string;
  nome: string | null;
  telefone: string | null;
  email: string | null;
  segmento: string | null;
  regiao: string | null;
  temperatura: string | null;
  campanha: string | null;
  tags: string[];
  preco: number | null;
  created_at: string;
};

function toCsv(rows: Lead[]) {
  const head = ["nome", "telefone", "email", "segmento", "regiao", "temperatura", "campanha", "tags", "preco"];
  const body = rows.map((l) =>
    [l.nome, l.telefone, l.email, l.segmento, l.regiao, l.temperatura, l.campanha, (l.tags ?? []).join("|"), l.preco]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(","),
  );
  return [head.join(","), ...body].join("\n");
}

function MeusLeads() {
  const fn = useServerFn(listMyLeads);
  const [filtro, setFiltro] = useState("");
  const { data = [], isLoading } = useQuery({ queryKey: ["meus-leads"], queryFn: () => fn({}) });

  const leads = useMemo(() => {
    const f = filtro.toLowerCase().trim();
    const rows = data as unknown as Lead[];
    if (!f) return rows;
    return rows.filter((l) =>
      [l.nome, l.email, l.telefone, l.segmento, l.regiao, l.campanha].join(" ").toLowerCase().includes(f),
    );
  }, [data, filtro]);

  function baixarCsv() {
    const blob = new Blob([toCsv(leads)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meus-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle>Meus leads ({leads.length})</CardTitle>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-56"
          />
          <Button variant="outline" onClick={baixarCsv} disabled={leads.length === 0}>
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : leads.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Você ainda não comprou leads. Visite o marketplace.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead>Região</TableHead>
                  <TableHead>Temperatura</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.nome ?? "—"}</TableCell>
                    <TableCell>{l.telefone ?? "—"}</TableCell>
                    <TableCell>{l.email ?? "—"}</TableCell>
                    <TableCell>{l.segmento ?? "—"}</TableCell>
                    <TableCell>{l.regiao ?? "—"}</TableCell>
                    <TableCell>
                      {l.temperatura ? <Badge variant="secondary">{l.temperatura}</Badge> : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {Number(l.preco ?? 0).toFixed(2)}
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
