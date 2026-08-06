import type { DeckRankCounts } from '@/src/db/queries/getDeckRankCounts';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import colors from '../../app/colors';
import type { CardDeck } from '../CardDeck/cardDeckTypes';

interface DeckBoxHeroProps {
	deck: CardDeck;
	rankCounts: DeckRankCounts;
}

/**
 * DeckBoxHero component
 */
export default function DeckBoxHero({ deck, rankCounts }: DeckBoxHeroProps) {
	const { CEFR, image } = deck;
	const badgeIconSize = 14;
	const CEFRGradientLight: readonly [string, string] = [
		colors.light.CEFR[CEFR[0]],
		colors.light.CEFR[CEFR.at(-1)!],
	];

	const {
		CEFRGradientStyle,
		CEFRLabelStyle,
		CEFRTextStyle,
		imageContainerStyle,
		imageStyle,
		badgeContainerStyle,
		badgeCountContainerStyle,
		badgeCountTextStyle,
	} = styles;

	return (
		<View>
			{/**
			 * CEFR Bar
			 */}
			<LinearGradient
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 0 }}
				colors={CEFRGradientLight}
				style={CEFRGradientStyle}
			>
				<Text style={CEFRLabelStyle}>CEFR</Text>
				<Text style={CEFRTextStyle}>{CEFR.join(' - ')}</Text>
			</LinearGradient>
			{/**
			 * Deck Image
			 */}
			<View style={imageContainerStyle}>
				<ImageBackground
					source={image}
					style={imageStyle}
				/>
			</View>
			{/**
			 * Rank Counts
			 */}
			<LinearGradient
				style={[badgeContainerStyle]}
				colors={[deck.colors.dark.secondary, deck.colors.dark.primary]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 0 }}
			>
				<View style={badgeCountContainerStyle}>
					<Text style={badgeCountTextStyle}>{rankCounts.unseen}</Text>
					<MaterialIcons
						color={colors.light.text}
						size={badgeIconSize}
						name="visibility-off"
					/>
				</View>
				<View style={badgeCountContainerStyle}>
					<Text style={badgeCountTextStyle}>{rankCounts.fnew}</Text>
					<MaterialIcons
						color={colors.light.text}
						size={badgeIconSize}
						name="fiber-new"
					/>
				</View>
				<View style={badgeCountContainerStyle}>
					<Text style={badgeCountTextStyle}>{rankCounts.bronze}</Text>
					<MaterialIcons
						color={colors.light.text}
						size={badgeIconSize}
						name="stars"
					/>
				</View>
				<View style={badgeCountContainerStyle}>
					<Text style={badgeCountTextStyle}>{rankCounts.silver}</Text>
					<MaterialIcons
						color={colors.light.text}
						size={badgeIconSize}
						name="military-tech"
					/>
				</View>
				<View style={badgeCountContainerStyle}>
					<Text style={badgeCountTextStyle}>{rankCounts.gold}</Text>
					<MaterialIcons
						color={colors.light.text}
						size={badgeIconSize}
						name="emoji-events"
					/>
				</View>
				<View style={badgeCountContainerStyle}>
					<Text style={badgeCountTextStyle}>{rankCounts.diamond}</Text>
					<MaterialIcons
						color={colors.light.text}
						size={badgeIconSize}
						name="diamond"
					/>
				</View>
			</LinearGradient>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	CEFRGradientStyle: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignSelf: 'flex-start',
		overflow: 'hidden',
		width: '100%',
		paddingHorizontal: 16,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: colors.light.border,
	},
	CEFRLabelStyle: {
		fontSize: 12,
		fontFamily: 'lexend-400',
	},
	CEFRTextStyle: {
		fontFamily: 'lexend-400',
		fontSize: 12,
		color: colors.dark.text,
	},
	imageContainerStyle: {},
	imageStyle: {
		display: 'flex',
		justifyContent: 'flex-end',
		height: 120,
	},
	badgeContainerStyle: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		paddingVertical: 1,
		borderColor: colors.light.border,
	},
	badgeCountContainerStyle: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
	},
	badgeCountTextStyle: {
		fontFamily: 'azeret-mono-600',
		color: colors.light.text,
		fontSize: 12,
	},
});
