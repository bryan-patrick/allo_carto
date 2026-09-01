import colors from '@/src/app/colors';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import type { UnlockCriteria } from '@/src/util/atlasCompletion';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Typing
 */
interface ChapterLockedButtonProps {
	color: string;
	unlockCriteria: UnlockCriteria[];
}

/**
 * ChapterLockedButton component
 */
export default function ChapterLockedButton({ color, unlockCriteria }: ChapterLockedButtonProps) {
	return (
		<View style={[styles.buttonContainer, { borderColor: color }]}>
			<View style={[styles.lockContainer, { backgroundColor: color }]}>
				<View style={styles.lockFlexContainer}>
					<MaterialSymbol
						color={'#E0D1B7'}
						size={16}
						name="lock"
					/>
				</View>
			</View>
			<View style={styles.criteriaContainer}>
				<Text style={styles.reqTitle}>Complete the following to unlock:</Text>
				{unlockCriteria.map(({ title, isUnlocked, requiredPercentage }, index) => (
					<Text
						key={`${title}-${index}`}
						style={[styles.criteriaText, isUnlocked && styles.criteriaMet]}
					>
						• Reach {requiredPercentage}% in{' '}
						<Text style={[styles.criteriaTitle, isUnlocked && styles.criteriaMet]}>{title}</Text>.
					</Text>
				))}
			</View>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	buttonContainer: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 0,
		borderRadius: 12,
		overflow: 'hidden',
	},
	lockContainer: {
		height: '100%',
		borderColor: '#E0D1B7',
		borderRightWidth: 0,
		borderRadius: 10,
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
	},
	lockFlexContainer: {
		flexGrow: 1,
		display: 'flex',
		justifyContent: 'center',
		paddingHorizontal: 4,
	},
	criteriaContainer: {
		padding: 4,
		borderWidth: 2,
		borderLeftWidth: 0,
		borderRadius: 12,
		borderTopLeftRadius: 0,
		borderBottomLeftRadius: 0,
		borderStyle: 'dashed',
		borderColor: colors.dark.border,
		gap: 8,
	},
	reqTitle: {
		fontFamily: 'lexend-600',
		fontSize: 14,
	},
	criteriaText: {
		fontFamily: 'lexend-400',
		fontSize: 14,
	},
	criteriaMet: {
		textDecorationLine: 'line-through',
	},
	criteriaTitle: {
		fontFamily: 'lexend-600',
	},
});
