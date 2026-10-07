import colors from '@/src/app/colors';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import type { UnlockedAtlasItem } from '@/src/util/atlasCompletion';
import type { ProgressType } from '@/src/util/progression';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { getCompletionEntry } from './completionAnimations';

interface CompletionUnlocksProps {
	items: UnlockedAtlasItem[];
	color: string;
}

interface UnlockRowProps {
	item: UnlockedAtlasItem;
	color: string;
	index: number;
}

const itemMetadata: Record<ProgressType, { label: string; icon: string }> = {
	story: { label: 'Story', icon: 'auto_stories' },
	chapter: { label: 'Chapter', icon: 'menu_book' },
	deck: { label: 'Deck', icon: 'cards_star' },
};

/**
 * Show the content type and its location so similarly named unlocks are easy to identify.
 */
function UnlockRow({ item, color, index }: UnlockRowProps) {
	const metadata = itemMetadata[item.type];
	const entering = getCompletionEntry(index + 1);
	const accentStyle = { color };
	let accessibilityLabel = `${metadata.label} unlocked: ${item.title}.`;

	if (item.context) {
		accessibilityLabel += ` ${item.context}.`;
	}

	return (
		<Animated.View
			entering={entering}
			accessible
			accessibilityLabel={accessibilityLabel}
			style={styles.row}
		>
			<View style={styles.icon}>
				<MaterialSymbol
					name={metadata.icon}
					size={24}
					color={color}
				/>
			</View>
			<View style={styles.details}>
				<Text style={[styles.type, accentStyle]}>{metadata.label}</Text>
				<Text style={styles.title}>{item.title}</Text>
				{item.context && <Text style={styles.context}>{item.context}</Text>}
			</View>
			<MaterialSymbol
				name="lock_open"
				size={20}
				color={colors.dark.success}
			/>
		</Animated.View>
	);
}

/**
 * List every story, chapter, and deck newly accessible during this session.
 */
export default function CompletionUnlocks({ items, color }: CompletionUnlocksProps) {
	return (
		<View>
			{items.map((item, index) => (
				<UnlockRow
					key={item.id}
					item={item}
					color={color}
					index={index}
				/>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		gap: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.light.goldenBorder,
	},
	icon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: colors.light.success,
		alignItems: 'center',
		justifyContent: 'center',
	},
	details: { flex: 1, gap: 4 },
	type: {
		fontFamily: 'lexend-600',
		fontSize: 14,
	},
	title: {
		fontFamily: 'lexend-600',
		fontSize: 14,
		color: colors.dark.text,
	},
	context: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		lineHeight: 18,
		color: colors.dark.text,
	},
});
