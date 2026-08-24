import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFinance } from "@/lib/broker.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/painel/financeiro")({
  component: Financeiro,
});

function Financeiro() {
  const fn = useServerFn(getFinance);
  const { data, isLoading } = useQuery({ queryKey: ["financeiro"], queryFn: () => fn({}) });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  const orders = data?.orders ?? [];
  const invoices = data?.invoices ?? [];
  const gasto = orders.reduce((s: number, o: { valor_total: number }) => s + Number(o.valor_total), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Saldo disponível</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            R$ {Number(data?.saldo ?? 0).toFixed(2)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total investido</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">R$ {gasto.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{orders.length}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum pedido ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell>{new Date(o.created_at).toLocaleString("pt-BR")}</TableCell>
                    <TableCell>{o.tipo}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{o.status_pagamento}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {Number(o.valor_total).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Faturas</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma fatura emitida.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((i: any) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-mono text-xs">{i.numero}</TableCell>
                    <TableCell>{new Date(i.created_at).toLocaleString("pt-BR")}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{i.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">R$ {Number(i.valor).toFixed(2)}</TableCell>
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
