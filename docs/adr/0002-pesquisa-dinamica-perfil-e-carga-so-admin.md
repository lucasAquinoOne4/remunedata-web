# ADR 0002 — Pesquisa dinâmica, perfil enriquecido e carga de dados só para admin

- **Status:** Aceito (2026-10)
- **Implementação:** `src/modules/remuneration/*`, `src/modules/dashboard/*`, `src/modules/admin/views/AdminLoadsView.vue`, `src/app/router/index.ts`

## Contexto
A busca exigia apertar um botão, usava um período fixo (2025/01) e listava um registro por pessoa por mês; o detalhe buscava o histórico por CPF mascarado. A tela de execuções (que dispara coleta) aparecia no menu para qualquer assinante.

## Decisão
- **Pesquisa dinâmica:** resultados enquanto digita (debounce de 250 ms, requisição anterior cancelada, `placeholderData` para não piscar), sugestões por teclado (`/suggest`), abas Todas/DF/Senado/Federal com contagem por fonte (as buscas rodam em paralelo), URL sincronizada e período padrão vindo de `/periods`. A busca só dispara com critério (nome de 2+ letras, cargo ou órgão). Contagens acima de 10.000 aparecem como "10.000+" (`total_capped`).
- **Perfil** (`/pessoa/:fonte/:id`): identidade completa, KPIs, evolução, composição proventos x descontos, comparação com pares (percentil), tabela mês a mês, cruzamento **probabilístico** com as outras fontes (badges Provável/Possível e aviso de homônimos), ficha federal e exportação do histórico em CSV.
- **Exportação** do resultado da busca (CSV até 5.000 e XLSX até 1.000 linhas) pelo endpoint `/remuneration/export`, recurso de assinante.
- **Dashboard** a partir de `/stats` (agregados cacheados no backend), com gráficos independentes.
- **Carga de dados só para admin:** o item de menu "Execuções" deixou de existir para os demais; a tela virou "Carga de dados" em `{ADMIN_PATH}/loads`, e o guard aplica `meta.isAdmin`. `isAdmin` vem de `VITE_ADMIN_EMAILS` (embutido no build): o admin precisa estar nessa lista no momento do build, e `VITE_ADMIN_PATH` precisa ser igual ao `ADMIN_PATH_PREFIX` do backend.

## Consequências
O guard do frontend é só conveniência de interface; a proteção real é do backend (rotas de execução e de carga exigem admin). Sem critério a busca não lista tudo (evita varrer a base).
