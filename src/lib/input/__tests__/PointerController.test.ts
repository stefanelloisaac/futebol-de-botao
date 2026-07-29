// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { PointerController } from '../PointerController';
import { FieldViewport } from '../../render/FieldViewport';
import { FIELD } from '../../engine';

function pointer(type: string, pointerId: number, x: number, y: number): PointerEvent {
  return new PointerEvent(type, { bubbles: true, pointerId, clientX: x, clientY: y });
}

function setup(width = 800, height = 330) {
  const canvas = document.createElement('canvas');
  Object.defineProperty(canvas, 'getBoundingClientRect', {
    value: () => ({ left: 30, top: 40, width, height })
  });
  canvas.setPointerCapture = vi.fn();
  canvas.releasePointerCapture = vi.fn();
  canvas.hasPointerCapture = vi.fn(() => true);
  const viewport = new FieldViewport(FIELD);
  viewport.resize(width, height, 2);
  const onShoot = vi.fn();
  const controller = new PointerController(canvas, viewport, {
    getSnapshot: () => ({
      discs: [{ id: 1, team: 'red', keeper: false, position: { x: 200, y: 500 }, radius: 15 }],
      ball: { position: { x: 200, y: 330 }, radius: 8.5 },
      scoreRed: 0, scoreBlue: 0, activeTeam: 'red', phase: 'aim', winner: null
    }),
    isHumanTurn: () => true,
    onShoot
  });
  return { canvas, controller, onShoot, viewport };
}

function dispatchAtWorld(
  canvas: HTMLCanvasElement,
  viewport: FieldViewport,
  type: string,
  pointerId: number,
  world: { x: number; y: number }
): void {
  const css = viewport.toScreen(world);
  canvas.dispatchEvent(pointer(type, pointerId, css.x + 30, css.y + 40));
}

describe('PointerController', () => {
  it('mapeia o centro visual do disco pela mesma projeção de render', () => {
    const { canvas, controller } = setup();
    canvas.dispatchEvent(pointer('pointerdown', 1, 430, 290));
    expect(controller.getAim()).toMatchObject({ cx: 200, cy: 500 });
    controller.destroy();
  });

  it.each([
    { x: 0, y: 0 },
    { x: FIELD.width, y: 0 },
    { x: 0, y: FIELD.height },
    { x: FIELD.width, y: FIELD.height }
  ])('inverte as bordas do canvas sem offsets para %o', (world) => {
    const { canvas, controller, viewport } = setup();
    dispatchAtWorld(canvas, viewport, 'pointerdown', 1, { x: 200, y: 500 });
    dispatchAtWorld(canvas, viewport, 'pointermove', 1, world);
    expect(controller.getAim()).toMatchObject({ cx: world.x, cy: world.y });
    controller.destroy();
  });

  it('mantém o mapeamento após resize para landscape', () => {
    const { canvas, controller, viewport } = setup();
    viewport.resize(660, 400, 2, 'landscape');
    dispatchAtWorld(canvas, viewport, 'pointerdown', 1, { x: 200, y: 500 });
    expect(controller.getAim()).toMatchObject({ cx: 200, cy: 500 });
    controller.destroy();
  });

  it('mantém o gesto capturado quando o pointer sai da área e chuta uma vez', () => {
    const { canvas, controller, onShoot, viewport } = setup();
    dispatchAtWorld(canvas, viewport, 'pointerdown', 7, { x: 200, y: 500 });
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(7);

    // Eventos capturados continuam chegando mesmo com coordenadas fora do rect.
    canvas.dispatchEvent(pointer('pointermove', 7, -500, -600));
    const aim = controller.getAim();
    expect(aim?.cx).toBeLessThan(0);
    expect(aim?.cy).toBeLessThan(0);
    canvas.dispatchEvent(pointer('pointerup', 7, -500, -600));

    expect(onShoot).toHaveBeenCalledTimes(1);
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(7);
    controller.destroy();
  });

  it('aceita apenas o pointer que iniciou a gesture e cancel limpa sem chute', () => {
    const { canvas, controller, onShoot, viewport } = setup();
    dispatchAtWorld(canvas, viewport, 'pointerdown', 1, { x: 200, y: 500 });
    dispatchAtWorld(canvas, viewport, 'pointermove', 2, { x: 0, y: 0 });
    expect(controller.getAim()).toMatchObject({ cx: 200, cy: 500 });
    canvas.dispatchEvent(pointer('pointercancel', 1, 30, 40));
    expect(controller.getAim()).toBeNull();
    expect(onShoot).not.toHaveBeenCalled();
    controller.destroy();
  });

  it('lostpointercapture limpa a seleção sem chute', () => {
    const { canvas, controller, onShoot, viewport } = setup();
    dispatchAtWorld(canvas, viewport, 'pointerdown', 1, { x: 200, y: 500 });
    canvas.dispatchEvent(new PointerEvent('lostpointercapture', { pointerId: 1 }));
    expect(controller.getAim()).toBeNull();
    expect(onShoot).not.toHaveBeenCalled();
    controller.destroy();
  });
});
