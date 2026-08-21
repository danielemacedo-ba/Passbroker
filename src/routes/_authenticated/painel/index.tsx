import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMarketplace, purchaseLeads } from "@/lib/broker.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/painel/")({
  component: Marketplace,
});

function Marketplace() {
  const list = useServerFn(listMarketplace);
  const buy = useServerFn(purchaseLeads);
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [filtro, setFiltro] = useState("");

  const { data = [], isLoading } = useQuery({ queryKey: ["marketplace"], queryFn: () => list({}) });

  const comprar = useMutation({
    mutationFn: (leadIds: string[]) => buy({ data: { leadIds } }),
    onSuccess: (r) => {
      toast.success(`${r.quantidade} lead(s) comprados por R$ ${r.total.toFixed(2)}`);
      setSelected([]);
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const leads = useMemo(() => {
    const f = filtro.toLowerCase().trim();
    if (!f) return data;
    return data.filter((l) =>
      [l.segmento, l.regiao, l.campanha, l.temperatura, ...(l.tags ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(f),
    );
  }, [data, filtro]);

  const total = leads.filter((l) => selected.includes(l.id)).reduce((s, l) => s + l.preco, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketplace de leads</h1>
          <p className="text-sm text-muted-foreground">
            Dados de contato ficam ocultos até a compra. {leads.length} leads disponíveis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Filtrar por segmento, região, tag..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-64"
          />
          <Button
            disabled={selected.length === 0 || comprar.isPending}
            onClick={() => comprar.mutate(selected)}
          >
            Comprar {selected.length > 0 ? `${selected.length} · R$ ${total.toFixed(2)}` : ""}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhum lead aprovado disponível no momento.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leads.map((l) => (
            <Card key={l.id} className={selected.includes(l.id) ? "ring-2 ring-primary" : ""}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <CardTitle className="text-base">{l.segmento ?? "Sem segmento"}</CardTitle>
                <Checkbox
                  checked={selected.includes(l.id)}
                  onCheckedChange={(c) =>
                    setSelected((s) => (c ? [...s, l.id] : s.filter((i) => i !== l.id)))
                  }
                />
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-1.5">
                  {l.temperatura && <Badge>{l.temperatura}</Badge>}
                  {l.regiao && <Badge variant="secondary">{l.regiao}</Badge>}
                  {(l.tags ?? []).map((t) => (
                    <Badge key={t} variant="outline">
                      {t}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-1 text-muted-foreground">
                  <p>Contato: {l.preview_nome}</p>
                  <p>Telefone: {l.preview_telefone ?? "—"}</p>
                  <p>E-mail: {l.preview_email ?? "—"}</p>
                  {l.campanha && <p>Campanha: {l.campanha}</p>}
                </div>
                <p className="text-lg font-semibold text-foreground">R$ {l.preco.toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
