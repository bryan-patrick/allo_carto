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
	const {
		metaRowStyle,
		metaTextStyle,
		metaDataStyle,
		chapterProgressBarContainer,
		chapterProgressBar,
	} = styles;

	/**
	 * Render the component
	 */
	return (
		<View>
			<View style={metaRowStyle}>
				<Text style={metaTextStyle}>Progress</Text>
				<View style={chapterProgressBarContainer}>
					<View
						style={[
							chapterProgressBar,
							{ backgroundColor: progressColor, width: `${displayProgressPercent}%` },
						]}
					/>
					<View
						style={[
							chapterProgressBar,
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
				<Text style={metaDataStyle}>{displayProgressPercent}%</Text>
			</View>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	metaRowStyle: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		gap: 8,
	},
	metaTextStyle: {
		color: colors.dark.text,
		fontSize: 14,
		fontFamily: 'lexend-400',
	},
	metaDataStyle: {
		color: colors.dark.text,
		fontFamily: 'lexend-600',
		fontSize: 14,
	},
	chapterProgressBarContainer: {
		display: 'flex',
		flexDirection: 'row',
		overflow: 'hidden',
		alignContent: 'center',
		alignItems: 'center',
		flex: 1,
	},
	chapterProgressBar: {
		height: 8,
		borderRadius: 4,
	},
});
