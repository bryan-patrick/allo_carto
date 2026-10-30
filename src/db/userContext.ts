/*
 * The context for handling user data
 */
import { createContext } from 'react';
import { UserRow } from './queries/getMonHomme';

/*
 * Init User state
 */
interface UserContextValue extends UserRow {
	selectStory: (storyId: string) => Promise<boolean>;
}

export const initialUserState: UserContextValue = {
	id: '',
	name: '',
	isMonHomme: 0,
	selectStory: async () => false,
};

export const UserContext = createContext<UserContextValue | null>(initialUserState);
