import colors from '@/src/app/colors';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Pages from './Pages';

const bookTopRightRadius = 8;

/*
 * Typing
 */
interface BookProps {
	children: ReactNode;
}

/*
 * Book component (story select)
 */
export default function Book({ children }: BookProps) {
	/*
	 * Render the component
	 */
	return (
		<View style={styles.bookContainer}>
			<View style={styles.book}>
				{children}
				{/* Draw the border above the artwork so it follows the rounded corner. */}
				<View
					accessible={false}
					pointerEvents="none"
					style={styles.bookBorder}
				/>
			</View>
			<Pages />
		</View>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	bookContainer: {
		marginHorizontal: 16,
		borderColor: colors.dark.border,
		borderRadius: 5,
		borderTopRightRadius: bookTopRightRadius,
		borderBottomRightRadius: 10,
		overflow: 'hidden',
	},
	book: {
		display: 'flex',
		flexDirection: 'row',
	},
	bookBorder: {
		...StyleSheet.absoluteFill,
		borderTopWidth: 1,
		borderRightWidth: 1,
		borderColor: colors.light.border,
		borderTopLeftRadius: 5,
		borderTopRightRadius: bookTopRightRadius,
	},
});
