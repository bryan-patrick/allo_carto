import colors from '@/src/app/colors';
import { useUserProgress } from '@/src/db/useUserProgress';
import {
	userActivityDisplay,
	type UserActivity,
	type UserNotification,
} from '@/src/util/userActivity';
import { useEffect, useState } from 'react';
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

interface UserProgressRowProps {
	item: UserActivity;
	isNotification?: boolean;
	isDismissDisabled?: boolean;
	onDismiss?: () => void;
}

type UserProgressTab = 'notifications' | 'activity';

// Show saved notifications with dismiss buttons and keep the activity log in its own tab.
export default function UserProgressModal({ onRequestClose, visible }: UserProgressModalProps) {
	const { bottom } = useSafeAreaInsets();
	const { height: windowHeight } = useWindowDimensions();
	const {
		activity,
		notifications,
		dismissNotification,
		dismissAllNotifications,
		isUpdatingProgress,
		reloadProgress,
		status,
	} = useUserProgress();
	const [selectedTab, setSelectedTab] = useState<UserProgressTab>('notifications');
	const showNotifications = selectedTab === 'notifications';
	const sheetStyle = {
		height: windowHeight * 0.6,
		paddingBottom: Math.max(bottom, 16),
	};
	let emptyTitle = 'Your progress will show up here';
	let emptyDescription = "You don't have any progress yet. Try some flashcards!";
	let emptyIcon = 'history';
	let sectionLabel = 'activity';

	if (showNotifications) {
		emptyTitle = "You're all caught up";
		emptyDescription = 'New rewards and unlocks will appear here.';
		emptyIcon = 'raven';
		sectionLabel = 'notifications';
	}

	if (status === 'loading') {
		emptyTitle = `Loading your ${sectionLabel}…`;
		emptyDescription = 'Your saved events will appear here.';
	} else if (status === 'error') {
		emptyTitle = `Could not load your ${sectionLabel}`;
		emptyDescription = 'Try loading your saved progress again.';
	}

	const emptyState = (
		<View style={styles.emptyState}>
			<MaterialSymbol
				color={colors.dark.primary}
				name={emptyIcon}
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
	);

	useEffect(() => {
		if (visible) {
			setSelectedTab('notifications');
		}
	}, [visible]);

	function renderNotification({ item }: ListRenderItemInfo<UserNotification>) {
		return (
			<UserProgressRow
				item={item}
				isNotification
				isDismissDisabled={isUpdatingProgress}
				onDismiss={() => dismissNotification(item.id)}
			/>
		);
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
							accessibilityLabel="Close user progress"
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
					<View style={styles.tabs}>
						<Pressable
							accessibilityRole="tab"
							accessibilityState={{
								selected: showNotifications,
							}}
							onPress={() => setSelectedTab('notifications')}
							style={[styles.tab, showNotifications && styles.selectedTab]}
						>
							<Text style={[styles.tabText, showNotifications && styles.selectedTabText]}>
								Notifications
							</Text>
							{notifications.length > 0 && (
								<Text style={styles.notificationCount}>{notifications.length}</Text>
							)}
						</Pressable>
						<Pressable
							accessibilityRole="tab"
							accessibilityState={{
								selected: !showNotifications,
							}}
							onPress={() => setSelectedTab('activity')}
							style={[styles.tab, !showNotifications && styles.selectedTab]}
						>
							<Text style={[styles.tabText, !showNotifications && styles.selectedTabText]}>
								Activity
							</Text>
						</Pressable>
					</View>
					{showNotifications && notifications.length > 0 && (
						<View style={styles.notificationActions}>
							<Text style={styles.savedLabel}>Saved until dismissed</Text>
							<Pressable
								accessibilityRole="button"
								disabled={isUpdatingProgress}
								onPress={dismissAllNotifications}
								style={styles.dismissAllButton}
							>
								<Text style={styles.dismissAllText}>Dismiss all</Text>
							</Pressable>
						</View>
					)}
					{showNotifications ?
						<FlatList
							key="notifications"
							contentContainerStyle={styles.listContent}
							data={notifications}
							extraData={isUpdatingProgress}
							keyExtractor={getActivityKey}
							renderItem={renderNotification}
							style={styles.list}
							ListEmptyComponent={emptyState}
						/>
					:	<FlatList
							key="activity"
							contentContainerStyle={styles.listContent}
							data={activity}
							keyExtractor={getActivityKey}
							renderItem={renderActivity}
							style={styles.list}
							ListEmptyComponent={emptyState}
						/>
					}
				</View>
			</View>
		</Modal>
	);
}

// Keep the same list row for each saved event when new activity is added.
function getActivityKey(activity: UserActivity): string {
	return activity.id.toString();
}

// Keep the existing activity rows separate from dismissible notifications.
function renderActivity({ item }: ListRenderItemInfo<UserActivity>) {
	return <UserProgressRow item={item} />;
}

// Show an event's details and time, with a dismiss button for saved notifications.
function UserProgressRow({
	item,
	isNotification = false,
	isDismissDisabled = false,
	onDismiss,
}: UserProgressRowProps) {
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
		<View style={styles.activityRow}>
			<View style={styles.activityIcon}>
				<MaterialSymbol
					color={colors.dark.primary}
					name={isNotification ? 'raven' : display.icon}
					size={22}
				/>
			</View>
			<View
				accessible
				accessibilityLabel={`${display.title}. ${item.description}. ${timestamp}`}
				style={styles.activityDetails}
			>
				<Text style={styles.activityTitle}>{display.title}</Text>
				<Text style={styles.activityDescription}>{item.description}</Text>
				<Text style={styles.timestamp}>{timestamp}</Text>
			</View>
			{onDismiss && (
				<Pressable
					accessibilityHint="Keeps the event in your Activity tab"
					accessibilityLabel={`Dismiss ${display.title}: ${item.description}`}
					accessibilityRole="button"
					disabled={isDismissDisabled}
					onPress={onDismiss}
					style={styles.dismissButton}
				>
					<MaterialSymbol
						color={colors.dark.primary}
						name="close"
						size={20}
					/>
				</Pressable>
			)}
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
	tabs: {
		flexDirection: 'row',
		gap: 8,
		paddingHorizontal: 16,
		paddingTop: 8,
	},
	tab: {
		alignItems: 'center',
		borderBottomColor: 'transparent',
		borderBottomWidth: 3,
		flex: 1,
		flexDirection: 'row',
		gap: 6,
		justifyContent: 'center',
		minHeight: 48,
		paddingHorizontal: 4,
	},
	selectedTab: {
		borderBottomColor: colors.dark.primary,
	},
	tabText: {
		color: colors.dark.primary,
		fontFamily: 'lexend-400',
		fontSize: 13,
	},
	selectedTabText: {
		fontFamily: 'lexend-600',
	},
	notificationCount: {
		backgroundColor: colors.dark.primary,
		borderRadius: 10,
		color: colors.light.text,
		fontFamily: 'lexend-600',
		fontSize: 10,
		minWidth: 20,
		overflow: 'hidden',
		paddingHorizontal: 5,
		paddingVertical: 3,
		textAlign: 'center',
	},
	notificationActions: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
	},
	savedLabel: {
		color: colors.dark.primary,
		flex: 1,
		fontFamily: 'lexend-400',
		fontSize: 11,
	},
	dismissAllButton: {
		justifyContent: 'center',
		minHeight: 44,
		paddingLeft: 12,
	},
	dismissAllText: {
		color: colors.dark.primary,
		fontFamily: 'lexend-600',
		fontSize: 12,
	},
	dismissButton: {
		alignItems: 'center',
		height: 44,
		justifyContent: 'center',
		marginRight: -8,
		marginTop: -8,
		width: 44,
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
