import { useContext } from 'react';
import { UserProgressContext } from './userProgressContext';

/**
 * Get the in-memory userProgress state
 */
export function useUserProgress() {
	return useContext(UserProgressContext);
}
