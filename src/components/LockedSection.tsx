import colors from '@/src/app/colors';
import { formatUnlockCriterion, type UnlockCriteria } from '@/src/util/atlasCompletion';
import {
	Alert,
	Pressable,
	StyleSheet,
	Text,
	View,
	type StyleProp,
	type ViewStyle,
} from 'react-native';
import MaterialSymbol from './MaterialSymbol';

interface LockedSectionProps {
	circular?: boolean;
	color?: string;
	textColor?: string;
	unlockCriteria: UnlockCriteria[];
	style?: StyleProp<ViewStyle>;
	fontSizeOffset?: number;
}

/**
 * Locked content explains which puzzle or chapter to finish next.
 * Access opens automatically when those first gems are saved.
 */
export default function LockedSection({
	circular = false,
	color = colors.utility.cardBorder,
	textColor = colors.dark.text,
	unlockCriteria,
	style,
	fontSizeOffset = 0,
}: LockedSectionProps) {
	const nextRequirement = unlockCriteria.find(criterion => !criterion.isUnlocked);
	const description =
		nextRequirement ? formatUnlockCriterion(nextRequirement) : 'More story content is coming soon.';
	const borderStyle = {
		borderColor: color,
	};
	const titleStyle = {
		color: textColor,
		fontSize: 14 + fontSizeOffset,
	};
	const hintStyle = {
		color: textColor,
		fontSize: 12 + fontSizeOffset,
	};
	const circularLabelStyle = {
		color,
		fontSize: 12 + fontSizeOffset,
	};

	function showRequirements() {
		Alert.alert('Keep solving to continue', description);
	}

	if (circular) {
		return (
			<Pressable
				style={[styles.circularControl, style]}
				onPress={showRequirements}
				accessibilityLabel={`Locked. ${description}`}
				accessibilityHint="Show how to continue the story."
				accessibilityRole="button"
			>
				<View style={[styles.lockCircle, borderStyle]}>
					<MaterialSymbol
						name="lock"
						color={color}
						size={32}
					/>
				</View>
				<Text style={[styles.label, circularLabelStyle]}>Locked</Text>
			</Pressable>
		);
	}

	return (
		<View style={[styles.section, borderStyle, style]}>
			<MaterialSymbol
				color={color}
				size={24}
				name="lock"
			/>
			<Text style={[styles.label, titleStyle]}>Locked</Text>
			<Text style={[styles.hint, hintStyle]}>{description}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	circularControl: {
		alignItems: 'center',
		gap: 4,
	},
	lockCircle: {
		width: 72,
		height: 72,
		borderRadius: 36,
		borderWidth: 2,
		backgroundColor: `${colors.dark.background}CC`,
		alignItems: 'center',
		justifyContent: 'center',
	},
	label: {
		fontFamily: 'lexend-600',
		textAlign: 'center',
	},
	section: {
		alignItems: 'center',
		justifyContent: 'center',
		borderStyle: 'dashed',
		borderWidth: 1,
		padding: 12,
		gap: 6,
	},
	hint: {
		fontFamily: 'lexend-400',
		textAlign: 'center',
	},
});
