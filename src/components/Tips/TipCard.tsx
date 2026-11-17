import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { useSoftTapSound } from '@/src/util/softTapSound';
import { useButtonWiggle } from '@/src/util/useButtonWiggle';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { FrenchTip, TipProgress } from './tipTypes';

const postcardBackground = require('@/src/app/assets/images/postcard-parts/background.jpg');

/**
 * Typing
 */
interface TipCardProps {
	progress: TipProgress;
	onSelectTip: (tip: FrenchTip) => void;
}

/**
 * These are the tip list items that show up in the Tips view's lists.
 */
export default function TipCard({ progress, onSelectTip }: TipCardProps) {
	/**
	 * Tap sound and saved tip progress
	 */
	const playSoftTap = useSoftTapSound();
	const { tip, isDiscovered, isXPRewardReadyToClaim } = progress;
	const claimBadgeAnimatedStyle = useButtonWiggle(isXPRewardReadyToClaim);
	const accessibilityState = {
		disabled: !isDiscovered,
	};

	/**
	 * Initial values and screen reader descriptions
	 */
	let title = '???';
	let accessibilityLabel = 'Undiscovered tip.';
	let accessibilityHint: string | undefined;

	if (isDiscovered) {
		title = tip.title;
		accessibilityLabel = `${title}. XP claimed.`;
		accessibilityHint = 'Open this French tip.';
	}

	if (isXPRewardReadyToClaim) {
		accessibilityLabel = `${title}. XP ready to claim.`;
	}

	/**
	 * Render them
	 */
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			accessibilityHint={accessibilityHint}
			accessibilityState={accessibilityState}
			disabled={!isDiscovered}
			onPress={() => onSelectTip(tip)}
			onPressIn={playSoftTap}
			style={!isDiscovered && styles.undiscoveredCard}
		>
			<BackgroundImage
				source={postcardBackground}
				imageStyle={styles.paperImage}
				style={styles.card}
			>
				<View style={styles.titleRow}>
					<Text style={styles.title}>{title}</Text>
					{isXPRewardReadyToClaim && (
						<Animated.View style={[styles.claimBadge, claimBadgeAnimatedStyle]}>
							<Text style={styles.claimBadgeText}>Claim!</Text>
						</Animated.View>
					)}
				</View>
				<MaterialSymbol
					name="lightbulb_2"
					size={28}
					color={colors.dark.primary}
				/>
			</BackgroundImage>
		</Pressable>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	undiscoveredCard: {
		opacity: 0.45,
	},
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
		padding: 16,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.light.goldenBorder,
		backgroundColor: colors.light.background,
	},
	paperImage: {
		borderRadius: 8,
	},
	titleRow: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		gap: 8,
	},
	title: {
		flexShrink: 1,
		fontFamily: 'lexend-600',
		fontSize: 16,
		color: colors.dark.text,
	},
	claimBadge: {
		alignSelf: 'flex-start',
		backgroundColor: colors.dark.primary,
		borderRadius: 4,
		paddingHorizontal: 7,
		paddingVertical: 2,
	},
	claimBadgeText: {
		color: colors.light.text,
		fontFamily: 'lexend-600',
		fontSize: 12,
	},
});
