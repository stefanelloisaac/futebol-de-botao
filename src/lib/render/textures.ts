import { FIELD } from '../engine';
import { THEME } from './theme';

/**
 * Pre-renders the felt surface (base green + fine noise) to an offscreen canvas
 * once, so the per-frame draw is a single cheap image blit.
 */
export function createFeltTexture(): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = FIELD.width;
	canvas.height = FIELD.height;
	const ctx = canvas.getContext('2d');
	if (!ctx) return canvas;

	ctx.fillStyle = THEME.felt;
	ctx.fillRect(0, 0, FIELD.width, FIELD.height);

	for (let i = 0; i < 9000; i++) {
		const x = Math.random() * FIELD.width;
		const y = Math.random() * FIELD.height;
		const a = Math.random() * 0.06;
		ctx.fillStyle = Math.random() < 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a * 0.7})`;
		ctx.fillRect(x, y, 1.4, 1.4);
	}
	return canvas;
}
