import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useUserProgress } from '../../db/useUserProgress';
import colors from '../colors';
import { resetDB } from '../../db/interface';

export default function Settings() {
	const { reloadProgress } = useUserProgress();

	/**
	 * State
	 */
	const [isResettingDB, setIsResettingDB] = useState(false);

	/**
	 * Reset the local DB, then rebuild the seed data.
	 */
	async function handleResetDB() {
		setIsResettingDB(true);

		try {
			await impactAsync(ImpactFeedbackStyle.Heavy);
			await resetDB();
			await reloadProgress();

			Alert.alert('DB reset', 'The local database has been reset.');
		} catch (error) {
			console.error('Failed to reset the DB:', error);

			Alert.alert('Reset failed', 'Could not reset the local database.');
		} finally {
			setIsResettingDB(false);
		}
	}

	function confirmResetDB() {
		Alert.alert('Reset DB?', 'This will clear local progress and rebuild the seeded data.', [
			{
				text: 'Cancel',
				style: 'cancel',
			},
			{
				text: 'Reset DB',
				style: 'destructive',
				onPress: handleResetDB,
			},
		]);
	}

	return (
		<View style={styles.container}>
			<Pressable
				style={styles.pressable}
				onPress={() => impactAsync(ImpactFeedbackStyle.Light)}
			>
				<Text style={styles.text}>Light</Text>
			</Pressable>
			<Pressable
				style={styles.pressable}
				onPress={() => impactAsync(ImpactFeedbackStyle.Medium)}
			>
				<Text style={styles.text}>Medium</Text>
			</Pressable>
			<Pressable
				style={styles.pressable}
				onPress={() => impactAsync(ImpactFeedbackStyle.Heavy)}
			>
				<Text style={styles.text}>Heavy</Text>
			</Pressable>
			<Pressable
				style={styles.pressable}
				onPress={() => impactAsync(ImpactFeedbackStyle.Rigid)}
			>
				<Text style={styles.text}>Rigid</Text>
			</Pressable>
			<Pressable
				style={styles.pressable}
				onPress={() => impactAsync(ImpactFeedbackStyle.Soft)}
			>
				<Text style={styles.text}>Soft</Text>
			</Pressable>
			<View style={styles.debugSection}>
				<Text style={styles.heading}>Debug</Text>
				<Pressable
					disabled={isResettingDB}
					style={[
						styles.pressable,
						styles.resetPressable,
						isResettingDB && styles.disabledPressable,
					]}
					onPress={confirmResetDB}
				>
					<Text style={styles.text}>{isResettingDB ? 'Resetting DB...' : 'Reset DB'}</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		height: '100%',
		gap: 8,
	},
	pressable: {
		padding: 32,
		margin: 4,
		borderWidth: 2,
		borderColor: '#FFAABB',
	},
	text: {
		color: '#ffffff',
	},
	debugSection: {
		alignItems: 'center',
		gap: 8,
		marginTop: 24,
	},
	heading: {
		color: colors.light.text,
		fontFamily: 'lexend-700',
		fontSize: 20,
	},
	resetPressable: {
		borderColor: colors.light.danger,
	},
	disabledPressable: {
		opacity: 0.6,
	},
});
