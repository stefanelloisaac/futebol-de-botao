# AGENTS.md — contexto para continuar o projeto

Este arquivo orienta quem for continuar o desenvolvimento (humano ou agente).

## O que é

Jogo de futebol de botão, web + mobile. SvelteKit + TypeScript. O jogo (física,
regras) vive num motor puro; a UI Svelte é só a casca. Detalhes em
`ARCHITECTURE.md`; o plano de produto/escala completo em `docs/ARQUITETURA.md`.

## Estado atual

**Fase 0 concluída e validada** (`svelte-check` e build de produção: 0 erros):

- Arquitetura em camadas montada (`engine`, `render`, `input`, `game`,
  `components`, `styles`).
- Protótipo migrado com visual e mecânica idênticos: campo de feltro, moldura de
  madeira, discos com bisel, estilingue, IA simples, modos 1 e 2 jogadores.

## Como rodar e validar

```bash
npm install
npm run dev      # desenvolvimento
npm run check    # SEMPRE rodar antes de commitar (svelte-check + tipos)
npm run build    # produção (adapter-node → node build)
```

## A regra de ouro (não quebrar)

`src/lib/engine/` é puro: **proibido** importar Svelte, DOM, `window`,
`document` ou qualquer coisa de rede ali dentro. É o que garante rodar o mesmo
motor no cliente e, depois, no servidor.

## Convenções de código

- **TypeScript strict**; evitar `any`.
- Arquivos: `PascalCase` para classes/componentes (`Match.ts`, `Scoreboard.svelte`);
  `camelCase` para módulos de funções (`simpleAi.ts`, `world.ts`).
- Tipos em `PascalCase`; valores de domínio como union de string
  (`type TeamId = 'red' | 'blue'`).
- Booleanos com prefixo `is`/`has`/`can`.
- **Linguagem ubíqua** do jogo no código: `Pitch`, `Disc`, `Shot`, `Goal`,
  `Kickoff`, `Turn`, `Match`.
- Svelte 5 com runes (`$props`, `$state`, `$effect`, `{@render children()}`).
- Commits em pt-BR no padrão `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.

## Onde mexer para cada tipo de tarefa

- Regra/física/turno/gol → `engine/` (e teste puro, sem UI).
- Aparência do campo → `render/` (`theme.ts` para cores).
- Aparência da moldura (placar, título, botões) → `styles/app.css` e os componentes.
- Controle/gesto → `input/PointerController.ts`.
- Orquestração do loop/IA → `game/GameClient.ts`.

## Próximos passos (roadmap resumido)

Detalhes completos em `docs/ARQUITETURA.md`.

- **Fase 1 — Contas + desafio diário:** Supabase (auth + Postgres). Diária semeada
  (seed do dia gerado no servidor), envio de score, ranking, histórico. Endpoints
  do SvelteKit em `src/routes/api/`.
- **Fase 2 — Mobile:** Capacitor embrulha o mesmo build; push (lembrete da diária).
- **Fase 3 — PvP em tempo real:** extrair `engine/` para um pacote; servidor
  Colyseus importa o motor; modelo **autoritativo por comando** (o cliente envia
  o `ShotCommand`, o servidor simula e devolve o resultado).
- **Fase 4 — Assinatura:** Stripe (web) + RevenueCat (app); gate por entitlement
  checado no servidor.

## Decisões-chave já tomadas (não retrabalhar à toa)

1. Motor puro e isolado (regra de ouro).
2. `ShotCommand` é a unidade de rede — já modelado pensando no PvP autoritativo.
3. Fonte única de estética: `render/theme.ts` (canvas) e `styles/app.css` (HTML)
   compartilham as mesmas cores.
4. API pública do motor pequena e por eventos (`engine/index.ts`).

## Checklist antes de commitar

- [ ] `npm run check` passou (0 erros).
- [ ] Nada de DOM/Svelte/rede entrou em `engine/`.
- [ ] Cores novas replicadas em `theme.ts` **e** `app.css`, se aplicável.
