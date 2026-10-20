# ADR 0001 — Seletor de fonte e redefinição de senha

- **Status:** Aceito (2026-10)
- **Implementação:** `src/modules/remuneration/*`, `src/modules/auth/views/ResetPasswordView.vue`, `src/app/router/index.ts`

## Contexto
O backend passou a ter duas fontes (`?fonte=DF|SENADO`, ver ADR 0003 do backend). O fluxo de recuperação de senha apontava para `/auth/reset-password`, rota que não existia, e o guard de rotas redireciona ao dashboard qualquer usuário logado que abra `/auth/*`.

## Decisão
- **Fonte na URL:** `fonte` fica na query string (compartilhável) e é preservada ao limpar filtros. Trocar de fonte limpa cargo e órgão (as listas são diferentes por fonte) e dispara nova busca. Os filtros distintos vêm de `/remuneration/distinct-filters?fonte=`.
- **Detalhe do Senado:** não há CPF; o registro é localizado por nome + competência + fonte.
- **Reset de senha:** nova tela `ResetPasswordView` (nova senha e confirmação, mínimo de 8 caracteres). O link de recuperação do Supabase abre uma sessão temporária; por isso a rota `reset-password` é **exceção** no guard que manda usuários logados ao dashboard. Sem a exceção a tela nunca apareceria.
- **API relativa em produção:** o build de produção usa `VITE_API_URL=/api/v1` (mesma origem do Nginx da EC2). O `.env` versionado do dono aponta para a API dele e não deve ser usado nesse deploy.

## Alternativas descartadas
`fonte` só como estado local (perde link compartilhável); endpoints e telas separados por fonte.

## Consequências
A URL é o contrato de navegação. As redirect URLs do Supabase precisam incluir o domínio de produção e `http://localhost:5173/**`.
