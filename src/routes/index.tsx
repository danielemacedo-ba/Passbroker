import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LeadBroker — Compre leads qualificados e curados" },
      {
        name: "description",
        content:
          "Marketplace de leads curados: ingestão automática por webhook, curadoria humana, compra individual ou em lote e controle financeiro completo.",
      },
      { property: "og:title", content: "LeadBroker — Marketplace de leads qualificados" },
      {
        property: "og:description",
        content:
          "Leads curados, preview sem dados sensíveis, compra em lote e extrato financeiro num só painel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const recursos = [
  {
    title: "Ingestão automática",
    desc: "Receba leads de qualquer fonte via webhook autenticado por API key, com log de cada requisição.",
  },
  {
    title: "Curadoria humana",
    desc: "Aprove, reprove, precifique e etiquete cada lead antes de publicá-lo no marketplace.",
  },
  {
    title: "Marketplace protegido",
    desc: "Compradores veem o preview do lead com dados sensíveis mascarados até a compra.",
  },
  {
    title: "Financeiro integrado",
    desc: "Saldo em carteira, pedidos, faturas e histórico completo de investimento.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-lg font-bold tracking-tight">LeadBroker</span>
          <Link to="/auth">
            <Button size="sm">Entrar</Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Leads qualificados, curados e prontos para vender
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Centralize a captação, a curadoria e a venda de leads em uma única plataforma — com
            controle de qualidade, precificação e financeiro.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/auth">
              <Button size="lg">Criar conta grátis</Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">
                Acessar painel
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:grid-cols-2">
            {recursos.map((r) => (
              <Card key={r.title}>
                <CardHeader>
                  <CardTitle className="text-lg">{r.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{r.desc}</CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} LeadBroker
        </div>
      </footer>
    </div>
  );
}
