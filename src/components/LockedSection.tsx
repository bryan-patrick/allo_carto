import colors from '@/src/app/colors';
import type { UnlockCriteria } from '@/src/util/atlasCompletion';
import { StyleSheet, Text, View } from 'react-native';
import MaterialSymbol from './MaterialSymbol';

interface LockedSectionProps {
	color?: string;
	unlockCriteria: UnlockCriteria[];
}

/**
 * Explains how to unlock a story, chapter, or deck.
 */
export default function LockedSection({
	color = colors.utility.cardBorder,
	unlockCriteria,
}: LockedSectionProps) {
	return (
		<View style={[styles.section, { borderColor: color }]}>
			<MaterialSymbol
				color={color}
				size={24}
				name="lock"
			/>
			<View style={styles.criteria}>
				<Text style={styles.criteriaTitle}>Complete the following to unlock:</Text>
				{unlockCriteria.map(({ title, isUnlocked, requiredPercentage }, index) => (
					<Text
						key={`${title}-${index}`}
						style={[styles.criteriaText, isUnlocked && styles.criteriaMet]}
					>
						• Reach {requiredPercentage}% in{' '}
						<Text style={isUnlocked && styles.criteriaMet}>{title}</Text>.
					</Text>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	section: {
		alignItems: 'center',
		justifyContent: 'center',
		borderStyle: 'dashed',
		borderWidth: 1,
		paddingVertical: 6,
		paddingHorizontal: 6,
	},
	criteria: {
		marginVertical: 8,
		gap: 4,
	},
	criteriaTitle: {
		textAlign: 'center',
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
});
