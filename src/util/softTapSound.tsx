import { createContext, useContext, type ReactNode } from 'react';
import { useSoundEffect } from './useSoundEffect';

type PlaySoftTap = () => Promise<boolean>;

interface SoftTapSoundProviderProps {
	children: ReactNode;
}

const SoftTapSoundContext = createContext<PlaySoftTap | null>(null);

// Keep the tap player available while flashcards open, change, and close.
export function SoftTapSoundProvider({ children }: SoftTapSoundProviderProps) {
	const playSoftTap = useSoundEffect('softTap');

	return <SoftTapSoundContext value={playSoftTap}>{children}</SoftTapSoundContext>;
}

// Play the shared soft tap without tying its lifetime to the current flashcard.
export function useSoftTapSound(): PlaySoftTap {
	const playSoftTap = useContext(SoftTapSoundContext);

	if (!playSoftTap) {
		throw new Error('Soft tap sounds need SoftTapSoundProvider.');
	}

	return playSoftTap;
}
