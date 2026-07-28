/**
 * Core domain types for the button-football match.
 * Pure data — no DOM, no framework, no rendering concerns.
 */

export type TeamId = 'red' | 'blue';

/** The match is either waiting for a shot ('aim') or letting bodies settle ('resolving'). */
export type MatchPhase = 'aim' | 'resolving';

export interface Vec2 {
	x: number;
	y: number;
}

/**
 * The network-ready unit of play: "team T flicks disc D with velocity V".
 * Designed early on purpose — this is what a client will one day send to the
 * authoritative server for online PvP.
 */
export interface ShotCommand {
	team: TeamId;
	discId: number;
	velocity: Vec2;
}

export interface DiscView {
	id: number;
	team: TeamId;
	keeper: boolean;
	position: Vec2;
	radius: number;
}

export interface BallView {
	position: Vec2;
	radius: number;
}

/** An immutable read-model of the match, produced for rendering and input. */
export interface MatchSnapshot {
	discs: DiscView[];
	ball: BallView;
	scoreRed: number;
	scoreBlue: number;
	activeTeam: TeamId;
	phase: MatchPhase;
}
