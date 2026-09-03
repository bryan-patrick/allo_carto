import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Typing
 */
interface BookProps {
	children: ReactNode;
}

/**
 * Book component (chapter select)
 */
export default function Book({ children }: BookProps) {
	/**
	 * Render the component
	 */
	return <View style={styles.book}>{children}</View>;
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	book: {
		borderRadius: 4,
		borderTopRightRadius: 12,
		borderBottomRightRadius: 12,
		overflow: 'hidden',
		display: 'flex',
		flexDirection: 'row',
		marginHorizontal: 16,
		marginBottom: 8,
	},
});
