import colors from '@/src/app/colors';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Typing
 */
interface ChapterMetaProps {
	progressPercent: number;
	progressColor: string;
}

/**
 * Chapter meta component, currently only renders progress.
 */
export default function ChapterMeta({
	progressPercent,
	progressColor = '#08433f',
}: ChapterMetaProps) {
	const displayProgressPercent = Math.floor(progressPercent);

	/**
	 * Render the component
	 */
	return (
		<View>
			<View style={styles.metaRow}>
				<Text style={styles.metaText}>Progress</Text>
				<View style={styles.progressBarContainer}>
					<View
						style={[
							styles.progressBar,
							{
								backgroundColor: progressColor,
								width: `${displayProgressPercent}%`,
							},
						]}
					/>
					<View
						style={[
							styles.progressBar,
							{
								backgroundColor: `${progressColor}20`,
								width: '100%',
								borderWidth: 1,
								borderColor: colors.dark.border,
								position: 'absolute',
								opacity: 0.4,
							},
						]}
					/>
				</View>
				<Text style={styles.metaData}>{displayProgressPercent}%</Text>
			</View>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	metaRow: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		gap: 8,
	},
	metaText: {
		color: colors.dark.text,
		fontSize: 14,
		fontFamily: 'lexend-400',
	},
	progressBarContainer: {
		display: 'flex',
		flexDirection: 'row',
		overflow: 'hidden',
		alignContent: 'center',
		alignItems: 'center',
		flex: 1,
	},
	progressBar: {
		height: 8,
		borderRadius: 4,
	},
	metaData: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 14,
	},
});
