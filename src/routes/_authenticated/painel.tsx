import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMe } from "@/lib/broker.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/painel")({
  component: PainelLayout,
});

function PainelLayout() {
  const me = useServerFn(getMe);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["me"], queryFn: () => me({}) });

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const links = [
    { to: "/painel", label: "Marketplace", exact: true },
    { to: "/painel/meus-leads", label: "Meus leads" },
    { to: "/painel/financeiro", label: "Financeiro" },
    ...(data?.isAdmin ? [{ to: "/painel/admin", label: "Administração" }] : []),
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
          <Link to="/painel" className="text-lg font-bold tracking-tight">
            LeadBroker
          </Link>
          <nav className="flex flex-1 flex-wrap gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.exact ?? false }}
                activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              Saldo R$ {Number(data?.profile?.saldo ?? 0).toFixed(2)}
            </Badge>
            <Button variant="outline" size="sm" onClick={sair}>
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
