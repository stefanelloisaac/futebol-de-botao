import { describe, expect, it } from 'vitest';
import { FIELD } from '../../engine';
import { FieldViewport } from '../FieldViewport';

const portraitViewports = [
  [360, 740], [375, 812], [390, 844], [412, 915], [430, 932]
] as const;
const desktopViewports = [
  [1024, 768], [1280, 720], [1366, 768], [1440, 900], [1920, 1080], [2560, 1440]
] as const;

function expectPointClose(actual: { x: number; y: number }, expected: { x: number; y: number }): void {
  expect(actual.x).toBeCloseTo(expected.x, 10);
  expect(actual.y).toBeCloseTo(expected.y, 10);
}

describe('FieldViewport', () => {
  it.each([...portraitViewports, ...desktopViewports])(
    'preenche %dx%d e preserva a projeção inversa',
    (width, height) => {
      const viewport = new FieldViewport(FIELD);
      viewport.resize(width, height, 1);

      expectPointClose(viewport.toScreen({ x: 0, y: 0 }), { x: 0, y: 0 });
      expectPointClose(viewport.toScreen({ x: FIELD.width, y: FIELD.height }), { x: width, y: height });
      for (const point of [{ x: 0, y: 0 }, { x: 200, y: 330 }, { x: 399.9, y: 659.9 }]) {
        expectPointClose(viewport.toWorld(viewport.toScreen(point)), point);
      }
    }
  );

  it.each([1, 1.25, 1.5, 2, 2.5, 3])('mantém mundo CSS idêntico em DPR %f', (dpr) => {
    const viewport = new FieldViewport(FIELD);
    viewport.resize(375, 812, dpr);

    expectPointClose(viewport.toScreen({ x: 200, y: 330 }), { x: 187.5, y: 406 });
    expectPointClose(viewport.toWorld({ x: 187.5, y: 406 }), { x: 200, y: 330 });
    expect(viewport.backingWidth).toBe(Math.round(375 * dpr));
    expect(viewport.backingHeight).toBe(Math.round(812 * dpr));
  });

  it('permite câmera landscape sem rotacionar coordenadas da física', () => {
    const viewport = new FieldViewport(FIELD);
    viewport.resize(660, 400, 2, 'landscape');

    for (const point of [{ x: 0, y: 0 }, { x: 200, y: 330 }, { x: 400, y: 660 }]) {
      expectPointClose(viewport.toWorld(viewport.toScreen(point)), point);
    }
  });

  it('expõe matriz e inversa consistentes em portrait', () => {
    const viewport = new FieldViewport(FIELD);
    viewport.resize(400, 660, 2);
    expect(viewport.matrix).toEqual({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
    expect(viewport.inverseMatrix).toEqual({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
  });
});
