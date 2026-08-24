# Lead Compass

Prompt — Sistema Broker de Leads

Contexto do Projeto

Construir uma plataforma broker de leads que recebe leads de fontes externas via API/webhook, passa por um processo de curadoria (aprovação/reprovação/qualificação), disponibiliza os leads aprovados em um marketplace para compra (individual ou em lote), e controla todo o financeiro (saldo de compradores, faturamento, pagamentos via gateway).

Stack: Lovable (React + Tailwind + Supabase — Postgres, Auth, Edge Functions, Storage) Gateway de pagamento: Stripe e/ou Mercado Pago Entrada de leads: integração via API/webhook (recebendo de plataformas externas)

1. Perfis de Usuário

Admin (curador): recebe, analisa e aprova/reprova leads; gerencia usuários, preços e financeiro geral.

Comprador (cliente): navega no marketplace, compra leads (avulso ou lote), acompanha saldo/faturas e histórico de compras.

Autenticação via Supabase Auth, com controle de acesso por role (admin / buyer).

2. Módulo: Recepção de Leads (Ingestão)

Endpoint de webhook (Supabase Edge Function) para receber leads de plataformas externas em tempo real.

Payload esperado (ajustável): nome, telefone, e-mail, origem/fonte, campanha, UTM, dados adicionais (JSON flexível).

Cada lead recebido entra automaticamente com status pendente (aguardando curadoria).

Log de todas as requisições recebidas (sucesso/erro), com reprocessamento manual em caso de falha.

Suporte a múltiplas origens/integrações simultâneas (identificação da fonte por token/chave de API único por integração).

3. Módulo: Curadoria (Dashboard do Admin)

Tela dedicada para o admin revisar os leads recebidos:

Listagem dos leads com status: pendente, aprovado, reprovado, vendido.

Filtros por origem, data, campanha, status.

Ação de aprovar/reprovar individualmente ou em lote (seleção múltipla).

Campo de motivo de reprovação (opcional, para histórico/qualidade).

Definição de preço do lead na aprovação (preço unitário e/ou preço em lote).

Possibilidade de "enriquecer" o lead com tags/categorias (ex: segmento, temperatura do lead, região).

4. Módulo: Marketplace (Área de Compra)

Tela voltada ao comprador:

Vitrine de leads aprovados e disponíveis (sem exibir dados sensíveis completos antes da compra — mostrar apenas preview: origem, segmento, região, data).

Compra individual (carrinho com 1 ou mais leads avulsos).

Compra em lote (pacotes pré-definidos ou seleção de quantidade por filtro/segmento).

Checkout integrado ao gateway de pagamento (Stripe/Mercado Pago).

Após pagamento confirmado, lead muda de status para vendido e sai do marketplace (ou fica indisponível para novos compradores).

Após a compra, o comprador tem acesso aos dados completos do lead (nome, telefone, e-mail etc.) na aba "Meus Leads".

5. Módulo: Financeiro

Para o comprador:

Extrato de compras (histórico de transações).

Faturas/recibos gerados automaticamente.

Status de pagamento (pago, pendente, falhou, reembolsado).

Para o admin:

Dashboard financeiro geral: faturamento total, leads vendidos x disponíveis, ticket médio, receita por período/origem.

Controle de repasses/comissões, se houver parceiros fornecendo leads.

Integração com webhooks do gateway (Stripe/Mercado Pago) para confirmar pagamentos automaticamente e atualizar status.

6. Estrutura de Dados Sugerida (Supabase/Postgres)

users            (id, nome, email, role, created_at)
lead_sources     (id, nome, api_key, created_at)
leads            (id, source_id, nome, telefone, email, dados_extra JSONB,
                  status [pendente|aprovado|reprovado|vendido],
                  preco, motivo_reprovacao, tags, created_at, updated_at)
orders           (id, buyer_id, tipo [individual|lote], valor_total,
                  status_pagamento, gateway, gateway_transaction_id, created_at)
order_items      (id, order_id, lead_id, preco_unitario)
invoices         (id, order_id, buyer_id, valor, status, url_pdf, created_at)

7. Telas do Dashboard (resumo de navegação)

Admin:

Visão geral (métricas gerais)

Curadoria de leads (fila pendente)

Leads aprovados/disponíveis

Financeiro (faturamento, comissões)

Configurações de integrações (webhooks/API keys)

Gestão de usuários/compradores

Comprador:

Marketplace (vitrine de leads)

Carrinho / checkout

Meus leads (comprados)

Financeiro (extrato, faturas)

Perfil/configurações

8. Requisitos Não Funcionais

Segurança: dados completos do lead só visíveis após compra confirmada.

Auditoria: log de quem aprovou/reprovou cada lead e quando.

Escalabilidade: suportar recebimento simultâneo de múltiplas integrações via webhook.

Responsividade: dashboard utilizável em desktop e mobile.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://prospectopia-prime.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7ee73567-9f20-4042-9da1-a601c5a6c11d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
