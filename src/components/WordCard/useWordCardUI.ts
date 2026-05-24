import { useContext } from 'react';
import { WordCardUIContext } from './wordCardContext';

/**
 * Just staying consistent since we use a hook for our other context
 */
export function useWordCardUI() {
	return useContext(WordCardUIContext);
}
