import { createContext, useContext, type ReactNode } from 'react';
import { useSoundEffect } from './useSoundEffect';

/**
 * Typing
 */
type PlaySoftTap = () => Promise<boolean>;

interface SoftTapSoundProviderProps {
	children: ReactNode;
}

/**
 * Soft tap sound context
 */
const SoftTapSoundContext = createContext<PlaySoftTap | null>(null);

/**
 * Context wrapper
 */
export function SoftTapSoundProvider({ children }: SoftTapSoundProviderProps) {
	const playSoftTap = useSoundEffect('softTap');

	return <SoftTapSoundContext value={playSoftTap}>{children}</SoftTapSoundContext>;
}

/**
 * Custom hook for the tap sound
 */
export function useSoftTapSound(): PlaySoftTap {
	const playSoftTap = useContext(SoftTapSoundContext);

	if (!playSoftTap) {
		throw new Error('Soft tap sounds need SoftTapSoundProvider.');
	}

	return playSoftTap;
}
