# Futebol de Botão — Arquitetura e Roadmap

Documento-mestre do projeto. Define os princípios inegociáveis, a arquitetura e o
roadmap. Leia este arquivo e o `AGENTS.md` antes de mexer em qualquer coisa.

---

## 1. Filosofia — as duas regras de ouro

### Regra 1 — O motor é puro

O jogo (física, regras, turnos, gols) vive em `src/lib/engine/` e **não importa
nada** de Svelte, DOM, `window`, `document` ou rede. Todo o resto consome o motor.

> Se um arquivo em `engine/` importar Svelte, DOM ou rede, está errado.

### Regra 2 — Offline-first, tudo mockado, antes de qualquer back-end

**O produto inteiro é construído, jogável e validado _offline_ primeiro.** Tudo o
que um dia virá de um servidor — ranking, perfil, desafio diário, histórico,
estatísticas — existe **agora**, mockado localmente, atrás de interfaces.

> **Nenhuma linha de back-end, HTTP, autenticação ou banco de dados enquanto o
> produto offline não estiver impecável.** Quando estiver, ligar o back-end é
> só implementar os mesmos contratos — sem tocar no jogo nem na UI.

Isso não é preguiça: é o que garante um produto validável de ponta a ponta cedo,
e uma migração pro online sem retrabalho.

---

## 2. O que "offline-first" significa aqui

- **Tudo funciona sem internet.** Abrir, jogar, ver ranking, ver perfil, jogar a
  diária, ver histórico — 100% local, sem nenhuma chamada de rede.
- **Todo dado externo é mockado atrás de uma interface** (ver seção 4). O ranking
  tem oponentes fictícios e as tuas pontuações locais; a diária é gerada por uma
  _seed determinística do dia_ (sem servidor); o perfil e o histórico ficam no
  dispositivo.
- **A régua é alta:** o app tem que ser um jogo completo e polido só com o offline.
  Se der pra tirar um print e alguém dizer "isso é um jogo pronto", passou. Ranking,
  telas, som, fluxo — tudo validado ao extremo antes de pensar em servidor.
- **Persistência local** via `localStorage`/IndexedDB, sempre atrás da interface
  `StoragePort` — nunca acessada direto pela UI ou pelo jogo.

---

## 3. Arquitetura em camadas

| Camada    | Pasta                    | Responsabilidade                                            | Nunca faz                         |
| --------- | ------------------------ | ---------------------------------------------------------- | --------------------------------- |
| Motor     | `src/lib/engine/`        | Física, regras, turnos, gols, condição de vitória, IA      | Desenhar, DOM, rede               |
| Render    | `src/lib/render/`        | Ler o estado e desenhar a mesa (estética vintage)          | Regra de jogo                     |
| Input     | `src/lib/input/`         | Pointer/toque → intenção; mapear coordenadas               | Regra, desenho                    |
| Cola      | `src/lib/game/`          | `GameClient`: liga motor+render+input e roda o loop        | Regra (delega ao motor)           |
| Serviços  | `src/lib/services/`      | Contratos (ports) + implementações mock/local (adapters)   | Regra de jogo, desenho            |
| App/Telas | `src/lib/app/`, `components/screens/` | Máquina de telas, navegação, fluxo do produto | Simulação da partida              |
| UI        | `src/lib/components/`    | Componentes Svelte (placar, canvas, telas)                 | Rodar a simulação                 |
| Estilos   | `src/lib/styles/`        | Estética da moldura e das telas                            | —                                 |

---

## 4. Camada de serviços — Ports & Adapters (o coração do offline-first)

Tudo que "parece back-end" é definido como **interface** (port) e implementado
**localmente** (adapter). A UI e o jogo dependem só das interfaces.

```
src/lib/services/
├─ ports/                       # SÓ interfaces (contratos). Sem implementação.
│  ├─ StoragePort.ts            # get/set/list/remove — abstrai onde persiste
│  ├─ RankingService.ts         # topN, submitScore, playerRank
│  ├─ DailyChallengeService.ts  # getToday (seed determinística), submitResult
│  ├─ ProfileService.ts         # perfil local (nome, avatar, preferências)
│  ├─ MatchHistoryService.ts    # registra e lê partidas
│  ├─ StatsService.ts           # vitórias, gols, sequência, etc.
│  └─ SettingsService.ts        # som, vibração, nomes dos times, tema
│
├─ adapters/local/              # implementações OFFLINE — as que rodam HOJE
│  ├─ LocalStorageAdapter.ts    # StoragePort via localStorage/IndexedDB
│  ├─ MockRankingService.ts     # leaderboard local: bots fictícios + scores do jogador
│  ├─ LocalDailyChallengeService.ts  # seed do dia = hash(data); igual pra todos, sem servidor
│  ├─ LocalProfileService.ts
│  ├─ LocalMatchHistoryService.ts
│  ├─ LocalStatsService.ts
│  └─ LocalSettingsService.ts
│
├─ adapters/remote/             # VAZIO por enquanto. Só na Fase 5 (back-end).
│
└─ container.ts                 # injeção de dependência: decide quais adapters usar
```

**Regras da camada:**

1. A UI/jogo importam os **ports** através do `container`, nunca os adapters direto.
2. Trocar mock por back-end = criar `adapters/remote/*` e mudar **só** o `container.ts`.
   Nenhuma tela ou regra de jogo muda.
3. Os mocks têm que ser **críveis e completos** — ranking com nomes e pontuações
   plausíveis, diária consistente por dia, histórico real do que foi jogado. Nada
   de "TODO: virá do servidor". Se está na tela, funciona de verdade offline.

Exemplo de contrato:

```ts
// ports/RankingService.ts
export interface RankingEntry {
	playerId: string;
	name: string;
	score: number;
	rank: number;
}

export interface RankingService {
	topN(limit: number): Promise<RankingEntry[]>;
	submitScore(score: number): Promise<void>;
	playerRank(): Promise<RankingEntry | null>;
}
```

O `MockRankingService` implementa isso com bots fictícios + as pontuações locais
do jogador, ordenando tudo. Pra UI, é indistinguível de um ranking "de verdade".

---

## 5. Roadmap

Ordem inegociável: **primeiro vira jogo, depois vira produto polido, depois é
validado ao extremo — tudo offline. Só então, back-end.**

### Fase 1 — De mecânica a jogo (shell + fluxo)

Transformar a partida solta num jogo com porta de entrada, começo, meio e fim.
Detalhamento em tarefas no `AGENTS.md`.

- Máquina de telas: `home → mode-select → match → result` (+ `pause`, `settings`).
- Tela inicial com identidade e botão **Jogar** (clima antes de cair na mesa).
- **Condição de vitória** no motor (ex.: primeiro a N gols) — a partida agora
  **termina**, com apito final e vencedor.
- Tela de resultado ("Vermelho venceu 3–1") com **Revanche** e **Menu**.
- Seleção de modo como tela (1 jogador / 2 jogadores), não botão no rodapé.
- Pausa e configurações básicas.

### Fase 2 — Identidade e game feel

Fazer parecer um produto, não um protótipo.

- Marca: logo, ícone, splash, paleta e tipografia coerentes entre todas as telas.
- **Som e feedback** (tacada, colisão, gol, torcida, apito) — maior salto de
  "game feel" por esforço. Vibração no mobile.
- Transições entre telas, microanimações, tela de carregamento.
- PWA: instalável, ícone na home, tela cheia, funciona 100% offline.

### Fase 3 — Conteúdo e retenção (tudo local/mock)

Motivos pra voltar ao jogo — sem nenhum servidor.

- **Desafio diário**: `LocalDailyChallengeService` com seed determinística do dia
  (todos pegam o mesmo desafio; validado localmente).
- **Ranking** (mock): `MockRankingService` com leaderboard local crível.
- **Perfil** e **estatísticas** locais (vitórias, gols, sequências, histórico).
- Níveis de dificuldade da IA; torneio/campeonato offline.

### Fase 4 — Validação extrema offline (o "definition of done" do produto offline)

Antes de sequer pensar em back-end, o offline tem que estar impecável.

- **Testes:** unitários no motor (placar, turnos, gol, vitória, IA); testes de
  fluxo das telas; casos de borda (empate, reinício, pausa no meio da tacada).
- **QA em dispositivos reais** (Android/iOS via navegador e via PWA/Capacitor).
- **Performance** (60fps na mesa até em aparelho fraco), **acessibilidade**,
  responsivo em todas as telas.
- Empacotamento **mobile via Capacitor** — ainda 100% offline.
- Critério de saída: dá pra publicar como um jogo offline completo e ninguém
  sente falta de nada. Só aqui a Fase 5 é destravada.

### Fase 5 — Back-end e online (só depois da Fase 4)

Trocar os mocks por implementações reais, sem mexer no jogo/UI.

- `adapters/remote/*` implementando os mesmos ports (ranking, perfil, diária).
- Autenticação e sincronização.
- **PvP em tempo real**: o motor já está pronto (modelo autoritativo por
  `ShotCommand`); servidor roda o mesmo motor e valida as jogadas.

### Fase 6 — Monetização

Assinatura, cosméticos — só quando já for um jogo que as pessoas querem jogar.

---

## 6. Modelo de dados (mockado localmente na Fase 3)

Formato local; quando o back-end entrar, os mesmos formatos viajam pela rede.

- **Profile**: `{ id, name, createdAt, preferences }`
- **MatchRecord**: `{ id, mode, config, scoreRed, scoreBlue, winner, playedAt }`
- **Stats** (derivado do histórico): `{ played, won, goalsFor, goalsAgainst, streak }`
- **RankingEntry**: `{ playerId, name, score, rank }` (mock: bots + jogador local)
- **DailyChallenge**: `{ date, seed, config }` (seed = hash determinística da data)

Tudo persistido via `StoragePort` (adapter local). Chaves hierárquicas, ex.:
`profile`, `matches:<id>`, `daily:<date>`, `settings`.

---

## 7. Definition of Done — quando o offline está "ideal"

Só se pensa em back-end quando **todos** estes forem verdade:

- [ ] Abre numa tela inicial com identidade; nada de cair direto na mesa.
- [ ] Fluxo completo: menu → modo → partida com fim → resultado → revanche/menu.
- [ ] Partida termina por condição de vitória, com apito e vencedor.
- [ ] Ranking, perfil, diária, histórico e estatísticas **funcionam offline**,
      críveis, atrás das interfaces (nenhum "TODO servidor" na tela).
- [ ] Som e feedback presentes; transições entre telas.
- [ ] PWA instalável, tela cheia, offline.
- [ ] Testado em dispositivos reais; 60fps; responsivo; sem bugs de fluxo.
- [ ] Testes automatizados no motor e nos fluxos principais passando.

Enquanto qualquer item acima estiver aberto, **back-end está proibido.**
