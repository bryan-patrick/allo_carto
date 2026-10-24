import colors from '@/src/app/colors';
import LinkButton from '@/src/components/LinkButton';
import MaterialSymbol from '@/src/components/MaterialSymbol';
import { useUserProgress } from '@/src/db/useUserProgress';
import type { AtlasItem } from '@/src/util/atlasCompletion';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { getCompletionEntry } from './completionAnimations';

interface CompletionUnlocksProps {
	items: AtlasItem[];
	color: string;
}

interface UnlockChoiceProps {
	item: AtlasItem;
	color: string;
	index: number;
}

function UnlockChoice({ item, color, index }: UnlockChoiceProps) {
	const { progressById, isUpdatingProgress, unlockItem } = useUserProgress();
	const [isDeferred, setIsDeferred] = useState(false);
	const [isUnlocking, setIsUnlocking] = useState(false);
	const isUnlocked = Boolean(progressById[item.id]?.isUnlocked);

	async function handleUnlock() {
		if (isUpdatingProgress || isUnlocking) {
			return;
		}
		setIsUnlocking(true);
		const didUnlock = await unlockItem(item.id);
		setIsUnlocking(false);
		if (!didUnlock) {
			Alert.alert('Could not unlock yet', 'Please try again.');
		}
	}

	return (
		<Animated.View
			entering={getCompletionEntry(index + 1)}
			style={styles.choice}
		>
			<Text style={[styles.type, { color }]}>{item.type}</Text>
			<Text
				accessibilityRole="header"
				style={styles.title}
			>
				{item.title}
			</Text>
			{item.context && <Text style={styles.context}>{item.context}</Text>}
			{isUnlocked ?
				<View style={styles.unlocked}>
					<MaterialSymbol
						name="check_circle"
						size={24}
						color={color}
					/>
					<Text
						accessibilityLiveRegion="polite"
						style={[styles.status, { color }]}
					>
						Unlocked!
					</Text>
				</View>
			: isDeferred ?
				<Text style={styles.description}>
					Ready whenever you are. You can unlock this {item.type} later from its locked section.
				</Text>
			:	<>
					<Text style={styles.description}>
						You’ve met the requirements for this {item.type}. Would you like to unlock it?
					</Text>
					<View style={styles.actions}>
						<LinkButton
							handler={() => setIsDeferred(true)}
							disabled={isUpdatingProgress}
							useArrow={false}
							type="outline"
							showShadow={false}
							showInnerBorder={false}
							color={color}
							style={styles.button}
							accessibilityLabel={`Not yet: ${item.title}`}
						>
							Not yet
						</LinkButton>
						<LinkButton
							handler={handleUnlock}
							disabled={isUpdatingProgress}
							useArrow={false}
							color={color}
							style={styles.button}
							accessibilityLabel={`Unlock ${item.type}: ${item.title}`}
						>
							{isUnlocking ? 'Unlocking…' : `Unlock ${item.type}`}
						</LinkButton>
					</View>
				</>
			}
		</Animated.View>
	);
}

/** Every eligible item gets an explicit choice, with deferred items left available later. */
export default function CompletionUnlocks({ items, color }: CompletionUnlocksProps) {
	return (
		<View style={styles.list}>
			{items.map((item, index) => (
				<UnlockChoice
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
	list: { gap: 24 },
	choice: {
		alignItems: 'center',
		gap: 12,
		paddingVertical: 24,
		paddingHorizontal: 12,
		borderWidth: 1,
		borderRadius: 12,
		borderColor: colors.light.goldenBorder,
	},
	type: { fontFamily: 'lexend-600', fontSize: 12, textTransform: 'uppercase', textAlign: 'center' },
	title: {
		fontFamily: 'lexend-600',
		fontSize: 22,
		lineHeight: 28,
		textAlign: 'center',
		color: colors.dark.text,
	},
	context: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		lineHeight: 18,
		textAlign: 'center',
		color: colors.dark.text,
	},
	description: {
		fontFamily: 'lexend-400',
		fontSize: 14,
		lineHeight: 22,
		textAlign: 'center',
		color: colors.dark.text,
	},
	actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
	button: { flexGrow: 1, minWidth: 100 },
	unlocked: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	status: { fontFamily: 'lexend-600', fontSize: 16, textAlign: 'center' },
});
