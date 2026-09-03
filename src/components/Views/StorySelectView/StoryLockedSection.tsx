import colors from '@/src/app/colors';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import type { UnlockCriteria } from '@/src/util/atlasCompletion';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Typing
 */
interface StoryLockedSectionProps {
	color: string;
	unlockCriteria: UnlockCriteria[];
}

/**
 * StoryLockedSection component
 */
export default function StoryLockedSection({ color, unlockCriteria }: StoryLockedSectionProps) {
	return (
		<View style={[styles.section, { borderColor: color }]}>
			<MaterialSymbol
				color={color}
				size={24}
				name="lock"
			/>
			<View style={styles.criteria}>
				<Text style={styles.criteriatitle}>Complete the following to unlock:</Text>
				{unlockCriteria.map(({ title, isUnlocked, requiredPercentage }, index) => (
					<Text
						key={`${title}-${index}`}
						style={[styles.criteriaText, isUnlocked && styles.criteriaMet]}
					>
						• Reach {requiredPercentage}% in{' '}
						<Text style={[styles.criteriaReq, isUnlocked && styles.criteriaMet]}>{title}</Text>.
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
	section: {
		display: 'flex',
		justifyContent: 'center',
		alignContent: 'center',
		alignItems: 'center',
		borderStyle: 'dashed',
		borderWidth: 1,
		paddingVertical: 6,
		paddingHorizontal: 6,
		borderColor: colors.utility.cardBorder,
	},
	criteria: {
		marginVertical: 8,
		gap: 4,
	},
	criteriatitle: {
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
	criteriaReq: {},
});
