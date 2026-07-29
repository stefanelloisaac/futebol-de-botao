import type { Vec2 } from '../engine';

export interface FieldSize {
  width: number;
  height: number;
}

/**
 * Single source of truth for the fill projection between logical field units,
 * CSS pixels and canvas backing pixels. `fill` intentionally stretches each
 * axis independently so the logical field always occupies the whole canvas.
 */
export type ViewportOrientation = 'portrait' | 'landscape';
export type ViewportFit = 'fill' | 'contain';

export interface ViewportMatrix {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

/**
 * Single source of truth for logical field <-> CSS pixel projection. DPR is
 * restricted to the backing buffer/context; pointer coordinates stay in CSS.
 * Landscape is represented as a camera transform, never by rotating physics.
 */
export class FieldViewport {
  cssWidth = 1;
  cssHeight = 1;
  dpr = 1;
  scaleX = 1;
  scaleY = 1;
  orientation: ViewportOrientation = 'portrait';
  fit: ViewportFit = 'fill';

  constructor(private readonly field: FieldSize) {}

  get backingWidth(): number {
    return Math.round(this.cssWidth * this.dpr);
  }

  get backingHeight(): number {
    return Math.round(this.cssHeight * this.dpr);
  }

  resize(
    cssWidth: number,
    cssHeight: number,
    dpr = 1,
    orientation: ViewportOrientation = this.orientation,
    fit: ViewportFit = this.fit
  ): void {
    this.cssWidth = Math.max(1, cssWidth);
    this.cssHeight = Math.max(1, cssHeight);
    this.dpr = Math.max(1, dpr);
    this.orientation = orientation;
    this.fit = fit;

    const worldWidth = orientation === 'portrait' ? this.field.width : this.field.height;
    const worldHeight = orientation === 'portrait' ? this.field.height : this.field.width;
    const fillX = this.cssWidth / worldWidth;
    const fillY = this.cssHeight / worldHeight;
    const scale = fit === 'contain' ? Math.min(fillX, fillY) : null;
    this.scaleX = scale ?? fillX;
    this.scaleY = scale ?? fillY;
  }

  /** World -> CSS affine matrix; DPR is deliberately excluded. */
  get matrix(): ViewportMatrix {
    if (this.orientation === 'landscape') {
      return { a: 0, b: this.scaleY, c: -this.scaleX, d: 0, e: this.field.height * this.scaleX, f: 0 };
    }
    return { a: this.scaleX, b: 0, c: 0, d: this.scaleY, e: 0, f: 0 };
  }

  /** CSS -> world inverse affine matrix; DPR is deliberately excluded. */
  get inverseMatrix(): ViewportMatrix {
    if (this.orientation === 'landscape') {
      return { a: 0, b: -1 / this.scaleX, c: 1 / this.scaleY, d: 0, e: 0, f: this.field.height };
    }
    return { a: 1 / this.scaleX, b: 0, c: 0, d: 1 / this.scaleY, e: 0, f: 0 };
  }

  /** CSS-pixel screen -> logical world inverse. */
  toWorld(point: Vec2): Vec2 {
    const m = this.inverseMatrix;
    return { x: m.a * point.x + m.c * point.y + m.e, y: m.b * point.x + m.d * point.y + m.f };
  }

  /** Logical world -> CSS-pixel screen projection. */
  toScreen(point: Vec2): Vec2 {
    const m = this.matrix;
    return { x: m.a * point.x + m.c * point.y + m.e, y: m.b * point.x + m.d * point.y + m.f };
  }

  applyWorldTransform(ctx: CanvasRenderingContext2D): void {
    const m = this.matrix;
    ctx.setTransform(this.dpr * m.a, this.dpr * m.b, this.dpr * m.c, this.dpr * m.d, this.dpr * m.e, this.dpr * m.f);
  }
}
