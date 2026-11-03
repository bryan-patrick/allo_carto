import type { ReactNode } from 'react';
import { View } from 'react-native';
import { bookStyles } from './bookStyles';

/*
 * Typing
 */
interface BookProps {
	children: ReactNode;
}

// Lay out the spine and cover inside one rounded book with a single shadow.
export default function Book({ children }: BookProps) {
	return <View style={bookStyles.book}>{children}</View>;
}
