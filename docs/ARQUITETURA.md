# Futebol de Botão — Plano de Arquitetura e Escala

Blueprint para transformar o protótipo em produto web + mobile, com partida diária, PvP em tempo real e assinatura — sem perder o que já foi feito e mantendo o projeto bem estruturado e fácil de manter.

---

## 1. Princípio central: o motor é puro e isolado

A decisão mais importante de toda a arquitetura. O jogo (regras, física, turnos, gols) vive num **motor de TypeScript puro**, que não importa nada de Svelte, do DOM, do navegador nem do servidor.

Tudo o mais **consome** o motor:

- o **navegador** roda o motor pra jogar local;
- o **celular** (Capacitor) roda o mesmo build web, então o mesmo motor;
- o **servidor** (Colyseus) roda o mesmo motor pra validar as jogadas do PvP.

Um motor, três lugares. É isso que evita reescrever o jogo várias vezes e é o que torna o tempo real viável com anti-trapaça.

Regra de ouro: **se um arquivo dentro de `engine/` importar algo de Svelte, do DOM ou de rede, está errado.**

---

## 2. Stack recomendada

| Camada | Escolha | Por quê |
|---|---|---|
| Linguagem | **TypeScript** (strict) | Base de um projeto robusto e bem tipado; nomenclatura e contratos claros |
| Web / UI | **SvelteKit** | Você já curte Svelte; dá rotas, SSR e endpoints de API prontos. O Svelte cuida só das telas |
| Física | **Matter.js** | Já funciona no protótipo; envolvido por tipos próprios pra ser trocável |
| Render | **Canvas 2D** (código próprio) | O visual vintage já está aqui; migra praticamente igual |
| Mobile | **Capacitor** | Embrulha o MESMO build web em app iOS/Android nativo |
| PWA | manifest + service worker | "Instalar na tela inicial" e notificação, grátis, antes do app de loja |
| Auth + Banco | **Supabase** (Postgres) | Contas, diária, ranking, histórico com pouco esforço |
| ORM (opcional) | **Drizzle** (TS-first) ou Prisma | Consultas tipadas se você não usar o client do Supabase direto |
| Tempo real PvP | **Colyseus** (Node) | Salas, matchmaking e sync de estado feitos pra jogo por turnos |
| Pagamento web | **Stripe** (Checkout + Portal) | Assinatura no navegador |
| Pagamento app | **RevenueCat** (IAP) | Apple/Google **exigem** compra no app pra bens digitais; RevenueCat unifica |
| Qualidade | ESLint + Prettier + Vitest | Padrão de código automático e testes no motor puro |
| Hospedagem web | Vercel / Netlify | Adapter do SvelteKit |
| Hospedagem servidor de jogo | Railway / Render / Fly.io | Colyseus precisa de processo Node **persistente** (serverless não segura WebSocket) |

---

## 3. Estrutura de pastas

### Fase inicial — um app SvelteKit, motor já isolado

```
futebol-de-botao/
├─ src/
│  ├─ lib/
│  │  ├─ engine/              # MOTOR PURO — sem DOM, sem Svelte, sem rede
│  │  │  ├─ entities/         # Disc.ts, Ball.ts, Team.ts, types.ts
│  │  │  ├─ physics/          # world.ts (setup Matter), collisions.ts
│  │  │  ├─ rules/            # turns.ts, scoring.ts, goal.ts
│  │  │  ├─ match/            # Match.ts (máquina de estados), MatchState.ts
│  │  │  ├─ commands/         # ShotCommand.ts  <- a unidade enviada na rede
│  │  │  ├─ constants.ts      # DISC_RADIUS, FIELD_W, atrito, etc.
│  │  │  └─ index.ts          # API pública do motor (só o que sai pra fora)
│  │  │
│  │  ├─ render/              # desenha o estado do motor no canvas
│  │  │  ├─ PitchRenderer.ts
│  │  │  ├─ theme.ts          # paleta/tokens vintage — FONTE ÚNICA da estética
│  │  │  ├─ drawField.ts  drawDisc.ts  drawBall.ts  drawAim.ts
│  │  │  └─ textures.ts       # geradores de feltro/madeira/grão
│  │  │
│  │  ├─ input/               # pointer -> intenções; mapeia tela -> mundo
│  │  │  └─ PointerController.ts
│  │  │
│  │  ├─ game/                # cola: o loop que junta engine + render + input
│  │  │  └─ GameClient.ts     # roda UMA partida local
│  │  │
│  │  ├─ components/          # UI Svelte: Scoreboard, GameCanvas, Menu, Paywall...
│  │  ├─ stores/              # svelte stores: sessão, estado de UI (NUNCA a simulação)
│  │  ├─ services/            # api.ts, auth.ts, realtime.ts, billing.ts
│  │  └─ styles/              # css global, fontes, tokens (espelham theme.ts)
│  │
│  ├─ routes/                 # páginas + endpoints do SvelteKit
│  │  ├─ +page.svelte         # home / jogar local
│  │  ├─ daily/               # desafio diário
│  │  ├─ play/[matchId]/      # partida online
│  │  ├─ (auth)/              # login / cadastro
│  │  └─ api/                 # daily, leaderboard, webhook do Stripe...
│  │
│  └─ app.html
│
├─ static/                    # fontes, ícones, manifest.webmanifest (PWA)
├─ tests/                     # ou *.test.ts ao lado dos arquivos
├─ .eslintrc  .prettierrc  tsconfig.json  vite.config.ts
└─ package.json
```

### Evolução — monorepo (quando o servidor precisar do motor)

Porque o `engine/` não importa nada de framework, extrair vira "mover a pasta + criar um package.json". Quase sem dor.

```
futebol-de-botao/            # workspace pnpm
├─ packages/
│  └─ engine/                # o mesmo motor, agora um pacote @fdb/engine
├─ apps/
│  ├─ web/                   # o SvelteKit (importa @fdb/engine)
│  └─ server/                # servidor Colyseus (importa @fdb/engine)
```

> Recomendação prática: **comece no app único** com a fronteira do `engine/` bem respeitada. Só migre pro monorepo na fase do PvP. Você ganha a organização sem o peso do monorepo cedo demais.

---

## 4. Camadas e responsabilidades

| Camada | Responsabilidade | Nunca faz |
|---|---|---|
| `engine/` | Regras, física, turnos, gols, estado da partida | Desenhar, tocar no DOM, falar com rede |
| `render/` | Ler o estado e desenhar (a estética vintage vive aqui) | Decidir regra de jogo |
| `input/` | Pointer/toque -> intenções; mapear coordenada tela↔mundo | Regra de jogo, desenho |
| `game/` | O loop que amarra engine + render + input numa partida local | Regra (delega ao engine) |
| UI (Svelte) | Telas, placar, botões, navegação, auth, paywall | Rodar a simulação |
| `services/` | API, auth, cliente de tempo real, pagamento | Regra de jogo |

O motor **emite eventos** (`goalScored`, `turnEnded`, `matchEnded`) e a UI/render **assinam**. Assim a simulação não sabe que a UI existe — desacoplamento que facilita testar e trocar peças.

---

## 5. De onde vai cada pedaço do protótipo (migração sem perder nada)

Você não vai reescrever — vai reorganizar. Mapa direto:

| No protótipo (arquivo único) | Vai para |
|---|---|
| setup do Matter (engine, paredes), discos, bola | `engine/physics/world.ts` + `engine/entities/*` |
| objeto `G`, `checkGoal`, `settle`, troca de turno | `engine/rules/*` + `engine/match/Match.ts` |
| handlers de pointer, `toLogical` | `input/PointerController.ts` |
| todos os `draw*`, feltro, madeira, cores | `render/*` + `render/theme.ts` |
| chrome HTML/CSS (placar, botões, título, "GOL!") | `components/*.svelte` + `styles/` |
| a função `loop()` | `game/GameClient.ts` |
| a IA do azul | `engine/ai/` (também pura, testável) |

O visual fica **idêntico** porque o código de desenho e o `theme` migram verbatim. É recorte e cola organizado, não redesenho.

---

## 6. Padrões de código e nomenclatura

- **TypeScript strict**, `any` proibido (banir no ESLint).
- **Arquivos:** `PascalCase` quando exportam uma classe/componente principal (`Disc.ts`, `Scoreboard.svelte`); `camelCase` para módulos de funções (`scoring.ts`, `drawDisc.ts`).
- **Tipos:** `PascalCase` (`MatchState`, `ShotCommand`, `TeamId`). Sem prefixo `I` em interface (estilo TS moderno).
- **Valores de domínio:** union de strings, não enum solto — `type TeamId = 'red' | 'blue'`.
- **Funções/variáveis:** `camelCase`. **Constantes reais:** `UPPER_SNAKE` (`DISC_RADIUS`) ou um objeto `config` congelado.
- **Booleanos:** prefixo `is`/`has`/`can` (`isSettled`, `hasScored`, `canShoot`).
- **Linguagem ubíqua:** use o vocabulário do jogo no código todo — `Pitch`, `Disc`, `Flick`/`Shot`, `Goal`, `Kickoff`, `Turn`, `Match`. O código lê como o jogo (DDD-lite) e isso salva a manutenção.
- **Um módulo = uma responsabilidade.** `index.ts` (barrel) por módulo expõe só a superfície pública.
- **ESLint + Prettier** com hook de pre-commit (husky + lint-staged) — padrão aplicado sozinho.
- **Testes (Vitest) no motor puro:** placar, troca de turno, detecção de gol, limite de força. Motor puro = trivial de testar = segurança pra refatorar.

---

## 7. Tempo real / PvP — arquitetura

Futebol de botão é **por turnos**, então é MUITO mais simples que jogo de ação: nada de netcode de 60fps nem rollback.

Modelo **autoritativo por comando**:

1. É a sua vez. Você mira e solta -> o cliente monta um `ShotCommand` (qual disco + vetor de impulso, com força já limitada).
2. Envia só esse comando (poucos bytes) ao servidor via WebSocket.
3. O **servidor** roda o MESMO motor, valida (é a sua vez? disco é seu? força dentro do limite?) e simula.
4. O servidor devolve o resultado (estado/trajetória) -> os dois clientes animam igual.

Ganhos: anti-trapaça de graça (a força e a vez são validadas no servidor), tráfego mínimo, e nenhuma necessidade de determinismo idêntico entre plataformas — porque quem manda no resultado é o servidor.

- **Transporte:** WebSocket via **Colyseus** — dá salas, matchmaking, sync de estado por schema e reconexão prontos.
- **Convidar um amigo:** sala com código de convite; o `matchId` vira a rota `play/[matchId]`.
- **Projete o `ShotCommand` já agora**, mesmo antes de ter servidor. É a "unidade de rede" e retrofitar isso depois dói. Definir cedo é barato.

---

## 8. Partida diária

Não precisa de tempo real. É um **setup semeado** (seed) gerado no servidor, igual pra todo mundo naquele dia:

- endpoint gera/retorna o seed do dia;
- o cliente monta a partida a partir do seed (mesmo motor);
- envia o resultado; servidor grava e monta o **ranking** diário.
- Precisa só de: API (endpoints do SvelteKit) + Postgres (Supabase). Guarde `daily_challenges`, `scores`, `users`, `matches`.

---

## 9. Assinatura / pagamento

- **Web:** Stripe Checkout + Customer Portal; webhook grava a assinatura no seu banco.
- **App (iOS/Android):** compra no app é **obrigatória** pra bens digitais (Apple/Google levam a comissão). **RevenueCat** unifica o IAP das duas lojas e sincroniza o "direito de acesso" (entitlement) com o seu backend.
- **Gate no servidor:** quem pode jogar PvP ilimitado / diárias extras / cosméticos é decidido por checagem de entitlement **no backend**, nunca só no cliente.

---

## 10. Roadmap em fases

**Fase 0 — Scaffold e migração (mantendo o visual).**
Criar SvelteKit + TS, configurar ESLint/Prettier/Vitest, portar o protótipo para as camadas, rodar o hotseat local + IA idêntico ao de hoje. Adicionar manifest PWA.
*Entrega: mesmo jogo, com estrutura de verdade, já publicável como página web.*

**Fase 1 — Contas e desafio diário.**
Supabase (auth + Postgres). Diária semeada, envio de score, ranking, histórico de partidas.

**Fase 2 — Mobile.**
Capacitor embrulha o build. Testar toque, adicionar push (lembrete da diária). Publicar em TestFlight / Play interno.

**Fase 3 — PvP em tempo real.**
Extrair o motor pra `packages/engine`. Subir o Colyseus importando o motor, jogadas autoritativas, salas + matchmaking + convite de amigo, reconexão.

**Fase 4 — Monetização.**
Stripe (web) + RevenueCat (app). Travar recursos premium por entitlement checado no servidor.

---

## 11. Decisões pra tomar cedo (baratas agora, caras depois)

1. **Motor puro e isolado** desde a fase 0 — é a fundação de tudo.
2. **Modelo autoritativo por servidor** decidido já, e o **`ShotCommand`** desenhado como unidade de rede desde o começo.
3. **Fonte única de estética** (`theme.ts`) que o CSS da web e o canvas compartilham — nada de cor espalhada em dois lugares.
4. **API pública do motor pequena e por eventos** — a UI assina, não cutuca as entranhas.
5. **TypeScript strict + lint no pre-commit** desde o primeiro commit — padrão nasce junto com o projeto, não é remendado depois.
