# Arquitetura do código

## A regra de ouro

O jogo vive num **motor puro** (`src/lib/engine/`) que não importa nada de
Svelte, do DOM, do navegador nem de rede. Todo o resto **consome** o motor.

> Se um arquivo dentro de `engine/` importar algo de Svelte, do DOM ou de rede,
> está errado.

Isso é o que permite o mesmo motor rodar no navegador, no mobile e, futuramente,
no servidor (PvP autoritativo) sem reescrever o jogo.

## Camadas e responsabilidades

| Camada             | Pasta                 | Responsabilidade                                              | Nunca faz                        |
| ------------------ | --------------------- | ------------------------------------------------------------ | -------------------------------- |
| Motor              | `src/lib/engine/`     | Física, regras, turnos, gols, IA, tipos                      | Desenhar, tocar DOM, falar rede  |
| Render             | `src/lib/render/`     | Ler o estado e desenhar (estética vintage)                   | Decidir regra de jogo            |
| Input              | `src/lib/input/`      | Pointer/toque → intenção; mapear coordenada tela↔mundo       | Regra de jogo, desenho           |
| Cola               | `src/lib/game/`       | `GameClient`: liga motor+render+input e roda o loop          | Regra (delega ao motor)          |
| UI                 | `src/lib/components/` | Componentes Svelte (placar, canvas)                          | Rodar a simulação                |
| Estilos            | `src/lib/styles/`     | `app.css`: estética da moldura (placar, título, controles)   | —                                |

## Mapa de arquivos do motor

```
engine/
├─ types.ts              tipos de domínio (TeamId, ShotCommand, MatchSnapshot, ...)
├─ constants.ts          geometria do campo e ajuste da física (fonte única)
├─ physics/world.ts      cria o mundo Matter.js: paredes, discos, bola, formações
├─ match/Match.ts        máquina de estados: turnos, gols, placar, settle, reset
├─ ai/simpleAi.ts        oponente simples (calcula um ShotCommand)
└─ index.ts              API pública do motor (só isto é importado de fora)
```

## Fluxo de uma jogada

1. `PointerController` traduz o gesto (puxar e soltar) num `ShotCommand`
   (`{ team, discId, velocity }`).
2. `GameClient` entrega o comando ao `Match` via `applyShot`.
3. `Match.step()` avança a física (Matter.js) e aplica as regras (gol, settle,
   troca de turno), emitindo eventos (`onGoal`, `onTurnReady`).
4. `PitchRenderer.draw()` lê o `MatchSnapshot` e desenha tudo no canvas.

O `ShotCommand` é, de propósito, a "unidade de rede": é o que um cliente vai
enviar ao servidor autoritativo quando o PvP online for implementado.

## Estética: fonte única

- **Campo (canvas):** `render/theme.ts` — paleta e cores dos times.
- **Moldura (HTML):** `styles/app.css` — as mesmas cores como variáveis CSS.

Ao mexer em cor/estilo, mantenha os dois em sincronia.
