import { useContext } from 'react';
import { UserContext } from './userContext';

/**
 * We use hooks for other context in the app so
 * we're just continuing that pattern.
 */
export function useUserContext() {
	return useContext(UserContext);
}
