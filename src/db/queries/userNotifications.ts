import type { UserNotification, UserNotificationType } from '@/src/util/userActivity';
import type { SQLiteDatabase } from 'expo-sqlite';

interface UserNotificationsOptions {
	database: SQLiteDatabase;
	userId: string;
}

interface SaveUserNotificationOptions extends UserNotificationsOptions {
	type: UserNotificationType;
	description: string;
	createdAt: number;
}

interface DismissUserNotificationOptions extends UserNotificationsOptions {
	notificationId: number;
}

interface DismissAllUserNotificationsOptions extends UserNotificationsOptions {
	latestNotificationId: number;
}

const statements = {
	getNotifications: `
		SELECT id, type, description, createdAt FROM userNotifications
		WHERE userId = ? ORDER BY id DESC;
	`,
	saveNotification: `
		INSERT INTO userNotifications (userId, type, description, createdAt)
		VALUES (?, ?, ?, ?);
	`,
	dismissNotification: 'DELETE FROM userNotifications WHERE userId = ? AND id = ?;',
	dismissAllNotifications: 'DELETE FROM userNotifications WHERE userId = ? AND id <= ?;',
};

// Load every undismissed notification with the newest first.
export async function getUserNotifications({
	database,
	userId,
}: UserNotificationsOptions): Promise<UserNotification[]> {
	return database.getAllAsync<UserNotification>(statements.getNotifications, userId);
}

// Save the notification with the progress change that earned it.
export async function saveUserNotification({
	database,
	userId,
	type,
	description,
	createdAt,
}: SaveUserNotificationOptions): Promise<void> {
	await database.runAsync(statements.saveNotification, userId, type, description, createdAt);
}

// Remove one notification without changing the player's activity log.
export async function dismissUserNotification({
	database,
	userId,
	notificationId,
}: DismissUserNotificationOptions): Promise<void> {
	await database.runAsync(statements.dismissNotification, userId, notificationId);
}

// Clear the listed notifications while keeping any that arrived after the player tapped.
export async function dismissAllUserNotifications({
	database,
	userId,
	latestNotificationId,
}: DismissAllUserNotificationsOptions): Promise<void> {
	await database.runAsync(statements.dismissAllNotifications, userId, latestNotificationId);
}
