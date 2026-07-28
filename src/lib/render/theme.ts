/**
 * The vintage Brazilian mid-century palette. This is the single source of truth
 * for the game's look; the global CSS mirrors these same values for the chrome.
 */
export const THEME = {
	felt: '#3d6b47',
	feltDark: '#2c5236',
	wood: '#7a4d2b',
	woodDark: '#5c3820',
	woodLight: '#9a6638',
	cream: '#f2e7cf',
	line: '#efe4c9',
	ink: '#2a231b',
	mustard: '#d9a441'
} as const;

/** Bevel colours per team: [highlight, base, shadow]. */
export const TEAM_COLORS: Record<'red' | 'blue', readonly [string, string, string]> = {
	red: ['#c94a42', '#b23a34', '#872822'],
	blue: ['#3d5c88', '#2f4b73', '#1e3350']
};
