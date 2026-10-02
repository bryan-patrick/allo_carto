import colors from '@/src/app/colors';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Pages from './Pages';

/**
 * Typing
 */
interface BookProps {
	children: ReactNode;
}

/**
 * Book component (story select)
 */
export default function Book({ children }: BookProps) {
	/**
	 * Render the component
	 */
	return (
		<View style={styles.bookContainer}>
			<View style={styles.book}>{children}</View>
			<Pages />
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	bookContainer: {
		marginHorizontal: 16,
		marginBottom: 8,
		borderColor: colors.dark.border,
		borderRadius: 5,
		borderTopRightRadius: 10,
		borderBottomRightRadius: 10,
		overflow: 'hidden',
	},
	book: {
		display: 'flex',
		flexDirection: 'row',
	},
});
