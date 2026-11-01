import colors from '@/src/app/colors';
import { useUserProgress } from '@/src/db/useUserProgress';
import { userActivityDisplay, type UserActivity } from '@/src/util/userActivity';
import {
	FlatList,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
	type ListRenderItemInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialSymbol from './MaterialSymbol';

/*
 * Typing
 */
interface UserProgressModalProps {
	onRequestClose: () => void;
	visible: boolean;
}

// Show the player's saved rewards, completed activities, and unlocks, newest first.
export default function UserProgressModal({ onRequestClose, visible }: UserProgressModalProps) {
	const { bottom } = useSafeAreaInsets();
	const { height: windowHeight } = useWindowDimensions();
	const { activity, reloadProgress, status } = useUserProgress();
	const sheetStyle = {
		height: windowHeight * 0.6,
		paddingBottom: Math.max(bottom, 16),
	};
	let emptyTitle = 'Your progress will show up here';
	let emptyDescription = "You don't have any progress yet. Try some flashcards!";

	if (status === 'loading') {
		emptyTitle = 'Loading your activity…';
		emptyDescription = 'Your saved events will appear here.';
	} else if (status === 'error') {
		emptyTitle = 'Could not load your activity';
		emptyDescription = 'Try loading your saved progress again.';
	}

	return (
		<Modal
			accessibilityViewIsModal
			animationType="slide"
			onRequestClose={onRequestClose}
			presentationStyle="overFullScreen"
			statusBarTranslucent
			transparent
			visible={visible}
		>
			<View style={styles.backdrop}>
				<View style={[styles.sheet, sheetStyle]}>
					<View style={styles.topBar}>
						<Text
							accessibilityRole="header"
							style={styles.title}
						>
							User Progress
						</Text>
						<Pressable
							accessibilityLabel="Close activity log"
							accessibilityRole="button"
							hitSlop={12}
							onPress={onRequestClose}
							style={styles.closeButton}
						>
							<MaterialSymbol
								color={colors.dark.text}
								name="close"
								size={22}
							/>
						</Pressable>
					</View>
					<FlatList
						contentContainerStyle={styles.listContent}
						data={activity}
						keyExtractor={getActivityKey}
						renderItem={renderActivity}
						style={styles.list}
						ListEmptyComponent={
							<View style={styles.emptyState}>
								<MaterialSymbol
									color={colors.dark.primary}
									name="history"
									size={36}
								/>
								<Text style={styles.emptyTitle}>{emptyTitle}</Text>
								<Text style={styles.emptyDescription}>{emptyDescription}</Text>
								{status === 'error' && (
									<Pressable
										accessibilityRole="button"
										onPress={reloadProgress}
										style={styles.retryButton}
									>
										<Text style={styles.retryText}>Try again</Text>
									</Pressable>
								)}
							</View>
						}
					/>
				</View>
			</View>
		</Modal>
	);
}

// Keep the same list row for each saved event when new activity is added.
function getActivityKey(activity: UserActivity): string {
	return activity.id.toString();
}

// Show the event's name, details, and the local date and time it happened.
function renderActivity({ item }: ListRenderItemInfo<UserActivity>) {
	const display = userActivityDisplay[item.type];
	const date = new Date(item.createdAt);
	const dateLabel = date.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
	const timeLabel = date.toLocaleTimeString(undefined, {
		hour: 'numeric',
		minute: '2-digit',
	});
	const timestamp = `${dateLabel} · ${timeLabel}`;

	return (
		<View
			accessible
			accessibilityLabel={`${display.title}. ${item.description}. ${timestamp}`}
			style={styles.activityRow}
		>
			<View style={styles.activityIcon}>
				<MaterialSymbol
					color={colors.dark.primary}
					name={display.icon}
					size={22}
				/>
			</View>
			<View style={styles.activityDetails}>
				<Text style={styles.activityTitle}>{display.title}</Text>
				<Text style={styles.activityDescription}>{item.description}</Text>
				<Text style={styles.timestamp}>{timestamp}</Text>
			</View>
		</View>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	backdrop: {
		backgroundColor: 'rgba(18, 18, 18, 0.8)',
		flex: 1,
		justifyContent: 'flex-end',
	},
	sheet: {
		backgroundColor: colors.light.secondary,
		borderColor: colors.light.goldenBorder,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		borderTopWidth: 1,
		overflow: 'hidden',
		paddingTop: 8,
	},
	topBar: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		minHeight: 44,
		paddingHorizontal: 16,
	},
	title: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 18,
	},
	closeButton: {
		alignItems: 'center',
		height: 36,
		justifyContent: 'center',
		width: 36,
	},
	subtitle: {
		color: colors.dark.primary,
		fontFamily: 'lexend-400',
		fontSize: 12,
		paddingHorizontal: 16,
		paddingBottom: 12,
	},
	list: {
		flex: 1,
		borderTopColor: colors.light.goldenBorder,
		borderTopWidth: 1,
	},
	listContent: {
		flexGrow: 1,
		paddingHorizontal: 16,
	},
	activityRow: {
		alignItems: 'flex-start',
		borderBottomColor: colors.light.goldenBorder,
		borderBottomWidth: StyleSheet.hairlineWidth,
		flexDirection: 'row',
		gap: 12,
		paddingVertical: 16,
	},
	activityIcon: {
		alignItems: 'center',
		backgroundColor: colors.light.primary,
		borderColor: colors.light.goldenBorder,
		borderRadius: 20,
		borderWidth: 1,
		height: 40,
		justifyContent: 'center',
		width: 40,
	},
	activityDetails: {
		flex: 1,
		gap: 4,
	},
	activityTitle: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 14,
		lineHeight: 20,
	},
	activityDescription: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 13,
		lineHeight: 19,
	},
	timestamp: {
		color: colors.dark.primary,
		fontFamily: 'lexend-400',
		fontSize: 11,
		lineHeight: 16,
	},
	emptyState: {
		alignItems: 'center',
		flex: 1,
		gap: 12,
		justifyContent: 'center',
		paddingHorizontal: 20,
		paddingVertical: 32,
	},
	emptyTitle: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 16,
		textAlign: 'center',
	},
	emptyDescription: {
		color: colors.dark.primary,
		fontFamily: 'lexend-400',
		fontSize: 13,
		lineHeight: 20,
		textAlign: 'center',
	},
	retryButton: {
		borderColor: colors.dark.primary,
		borderRadius: 20,
		borderWidth: 1,
		paddingHorizontal: 20,
		paddingVertical: 12,
	},
	retryText: {
		color: colors.dark.primary,
		fontFamily: 'lexend-600',
		fontSize: 13,
	},
});
