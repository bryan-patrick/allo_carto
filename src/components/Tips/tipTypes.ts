/**
 * Tip content and collection progress
 */
export interface FrenchTip {
	id: string;
	title: string;
	description: string;
}

export interface TipProgress {
	tip: FrenchTip;
	isDiscovered: boolean;
	isXPRewardReadyToClaim: boolean;
}
