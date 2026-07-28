# Futebol de Botão

Jogo de futebol de botão para web e mobile. Física real (Matter.js), estética
retrô brasileira meados do século, controle de estilingue que funciona igual no
mouse e no toque. SvelteKit + TypeScript, com o jogo isolado num motor puro.

## Requisitos

- Node.js **20.11+** (recomendado 22 LTS)

## Rodar em desenvolvimento

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build e execução na VPS

O projeto usa `@sveltejs/adapter-node`, então o build gera um servidor Node:

```bash
npm install
npm run build
node build          # sobe o servidor (porta padrão 3000; use PORT=... para trocar)
```

## Scripts

| Script          | O que faz                                     |
| --------------- | --------------------------------------------- |
| `npm run dev`   | Servidor de desenvolvimento com hot reload    |
| `npm run build` | Build de produção (adapter-node)              |
| `npm run preview` | Pré-visualiza o build de produção           |
| `npm run check` | `svelte-kit sync` + `svelte-check` (tipos)    |
| `npm run format`| Formata com Prettier                          |
| `npm run lint`  | Checa a formatação                            |

## Estrutura (resumo)

```
src/lib/engine/     motor puro do jogo (física, regras, turnos, IA) — sem DOM/framework
src/lib/render/     renderer canvas + tema vintage (theme.ts)
src/lib/input/      controle de estilingue (pointer/touch)
src/lib/game/       GameClient: liga motor + render + input e roda o loop
src/lib/components/ componentes Svelte (Scoreboard, GameCanvas)
src/lib/styles/     app.css (estética da "moldura": placar, título, controles)
src/routes/         página e layout do SvelteKit
```

## Documentação

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — como o código está organizado e a regra de ouro.
- [`AGENTS.md`](./AGENTS.md) — contexto e instruções para quem (humano ou agente) for continuar.
- [`docs/ARQUITETURA.md`](./docs/ARQUITETURA.md) — o plano completo de escala (fases 1–4, PvP, assinatura).

## Estado atual

**Fase 0 concluída**: arquitetura em camadas montada e o protótipo migrado, com
visual e mecânica idênticos ao original. Validado com `svelte-check` e build de
produção (0 erros). Próximo passo: Fase 1 (contas + desafio diário) — ver `AGENTS.md`.
