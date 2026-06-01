/**
 * The context for handling user data
 */
import { createContext } from 'react';
import { UserRow } from './queries/getMonHomme';

/**
 * Init User state
 */
export const initialUserState: UserRow = {
	id: '',
	name: '',
	isMonHomme: 0,
};

export const UserContext = createContext<UserRow | null>(initialUserState);
