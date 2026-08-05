import { useContext } from 'react';
import { UserProgressContext } from './userProgressContext';

/**
 * Get user progress state
 */
export function useUserProgress() {
	return useContext(UserProgressContext);
}
