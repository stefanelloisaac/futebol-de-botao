# AGENTS.md — como continuar o projeto

Guia para quem for desenvolver (humano ou agente). Leia junto com
`docs/ARQUITETURA.md`.

## O que é

Jogo de futebol de botão, web + mobile, **offline-first**. SvelteKit + TypeScript.
O jogo vive num motor puro; a UI é a casca. Física real (Matter.js), estética
retrô, controle de estilingue (mouse/toque).

## Estado atual

**Fase 0 concluída:** arquitetura em camadas montada e o protótipo migrado (mesa,
moldura de madeira, discos, estilingue, IA simples, modos 1 e 2 jogadores). Já
roda. **Mas ainda não é um jogo:** cai direto na partida, sem tela inicial, sem
fim de jogo, sem fluxo. A Fase 1 resolve isso.

## Princípios inegociáveis

1. **Motor puro** — `src/lib/engine/` não importa Svelte, DOM, `window`,
   `document` nem rede. Nunca.
2. **Offline-first, tudo mockado, antes de back-end** — o produto inteiro é
   jogável e validado offline. Ranking, perfil, diária, histórico: tudo local,
   atrás de interfaces (`services/ports`), com adapters mock (`services/adapters/local`).
   **Proibido** back-end, HTTP, auth ou banco até a Fase 4 estar 100% (ver a
   "Definition of Done" em `docs/ARQUITETURA.md`).
3. **UI/jogo dependem de interfaces, não de implementações** — importe os ports
   pelo `services/container.ts`, nunca um adapter direto.

## Como rodar e validar

```bash
npm install
npm run dev      # desenvolvimento
npm run check    # SEMPRE antes de commitar (svelte-check + tipos)
npm run build    # produção (adapter-node → node build)
```

## Convenções de código

- **TypeScript strict**; evitar `any`.
- Arquivos: `PascalCase` para classes/componentes (`Match.ts`, `HomeScreen.svelte`);
  `camelCase` para módulos de funções.
- Tipos em `PascalCase`; valores de domínio como union de string.
- Booleanos com prefixo `is`/`has`/`can`.
- Linguagem ubíqua do jogo: `Pitch`, `Disc`, `Shot`, `Goal`, `Kickoff`, `Turn`,
  `Match`, `Screen`.
- Svelte 5 com runes (`$props`, `$state`, `$effect`, `{@render children()}`).
- Commits em pt-BR: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`.

---

## FASE ATUAL: Fase 1 — De mecânica a jogo

Objetivo: transformar a partida solta num jogo com porta de entrada, começo, meio
e fim. Tudo offline. Ao terminar a Fase 1, abrir o app cai numa **tela inicial**,
e uma partida **termina** com um vencedor e uma tela de resultado.

### 1.1 — Condição de vitória no motor (primeiro, é a base)

O `Match` hoje não tem fim. Adicionar:

- `MatchConfig` em `engine/`: `{ targetGoals: number }` (ex.: 3). Deixar aberto
  para futuras variações (tempo/turnos), mas começar por gols.
- Estado terminal: `MatchPhase` ganha `'finished'`; `Match` guarda `winner: TeamId | null`.
- Ao marcar gol: se `scoreRed` ou `scoreBlue` atingiu `targetGoals`, entra em
  `finished`, define `winner`, e **não** faz kickoff.
- Evento `onMatchEnd(winner: TeamId)` em `MatchEvents`.
- `Match` recebe `MatchConfig` no construtor; `restart()` reusa a config.
- Kickoff explícito no começo (deixar pronto pra um "apito inicial" na UI).

Arquivos: `engine/match/Match.ts`, `engine/types.ts` (MatchConfig, phase
`finished`, winner), `engine/index.ts` (exportar `MatchConfig`).
`GameClient`: ao receber `onMatchEnd`, parar de agendar IA e travar input; expor
o fim pra UI via callback `onMatchEnd`.

### 1.2 — Máquina de telas (o fluxo do produto)

Criar um estado de aplicação que controla qual tela aparece.

- `src/lib/app/screens.ts`:
  `export type Screen = 'home' | 'mode-select' | 'match' | 'result' | 'settings';`
- `src/lib/app/appState.svelte.ts`: store com runes — `screen`, `mode`
  (`'single' | 'local'`), `matchConfig`, `lastResult` (`{ winner, scoreRed, scoreBlue } | null`),
  e ações `goHome()`, `chooseMode(mode)`, `startMatch()`, `endMatch(result)`,
  `rematch()`, `openSettings()`.
- Transições: `home → mode-select → match → result`; de `result`, `rematch()`
  volta a `match` e `goHome()` volta a `home`.

### 1.3 — Telas (componentes)

Em `src/lib/components/screens/`:

- `HomeScreen.svelte` — identidade (logo/título grande), botão **Jogar**, acesso
  a **Configurações** e **Como jogar**. É a cara do produto ao abrir.
- `ModeSelectScreen.svelte` — **1 Jogador** (vs IA) e **2 Jogadores** (mesmo
  aparelho). Botão voltar.
- `MatchScreen.svelte` — o que hoje é a página: `Scoreboard` + `GameCanvas` +
  botão de **pausa**. Recebe `mode` e `matchConfig`.
- `PauseOverlay.svelte` — overlay: Continuar / Reiniciar / Sair pro menu.
- `ResultScreen.svelte` — placar final, "Vermelho venceu 3–1", botões **Revanche**
  e **Menu**. Aqui é onde, na Fase 3, o resultado é registrado no histórico/ranking
  (via os services — já deixar o gancho, mesmo que o mock ainda não exista).
- `SettingsScreen.svelte` — som on/off, vibração, nomes dos times. (Persistir via
  `SettingsService`/`StoragePort` quando a camada de serviços existir; na Fase 1
  pode ser estado em memória, mas já atrás de uma interface.)

### 1.4 — Shell / roteamento de telas

- `src/routes/+page.svelte` deixa de renderizar a partida direto e passa a
  renderizar um **Shell** que escolhe a tela conforme `appState.screen`.
- `src/lib/components/AppShell.svelte`: um `{#if}` por tela (ou um mapa
  tela→componente), com transições do Svelte entre elas.
- Manter uma única rota por enquanto (SPA-like); deep-linking por rota fica pra depois.

### 1.5 — Esqueleto da camada de serviços (preparar o terreno)

Mesmo que o conteúdo (ranking/diária) seja da Fase 3, criar já os contratos e o
container, pra tudo nascer atrás de interface:

- `src/lib/services/ports/SettingsService.ts` e `StoragePort.ts` (começar por esses).
- `src/lib/services/adapters/local/LocalStorageAdapter.ts`,
  `LocalSettingsService.ts`.
- `src/lib/services/container.ts` expondo instâncias (hoje, as locais).
- UI usa `container.settings`, nunca o adapter direto.

### Checklist de saída da Fase 1

- [ ] Abrir o app cai na `HomeScreen`, não na mesa.
- [ ] Menu → modo → partida funciona.
- [ ] A partida **termina** ao atingir `targetGoals`, com vencedor.
- [ ] `ResultScreen` mostra o placar e vencedor, com Revanche e Menu.
- [ ] Pausa funciona (Continuar / Reiniciar / Menu).
- [ ] Configurações abrem e alteram algo (ex.: som on/off) atrás de uma interface.
- [ ] `npm run check` passa (0 erros).
- [ ] Nada de DOM/rede em `engine/`; nada de back-end em lugar nenhum.

---

## O que NÃO fazer (até a Fase 5)

- Nada de `fetch`, HTTP, WebSocket, autenticação, banco de dados ou qualquer
  chamada de rede.
- Nada de "isso vai vir do servidor depois" numa tela. Se aparece pro usuário,
  funciona **de verdade, offline**, mesmo que mockado.
- Não acessar `localStorage`/IndexedDB direto na UI — sempre via `StoragePort`.
- Não quebrar a regra do motor puro por "conveniência".

## Ordem das fases (resumo)

1. **Jogo** (shell + fim de partida) ← você está aqui
2. **Identidade + game feel** (marca, som, transições, PWA)
3. **Conteúdo/retenção offline** (diária, ranking, perfil, stats — mockados)
4. **Validação extrema offline** (testes, QA em device, Capacitor, performance)
5. **Back-end e online** (trocar mocks por reais; PvP autoritativo)
6. **Monetização**

Detalhes completos e a "Definition of Done" do offline em `docs/ARQUITETURA.md`.
