import type { CardRarity } from '@/src/components/CardDeck/cardDeckTypes';
import type { ImageSourcePropType } from 'react-native';

/**
 * Flashcards and puzzle cards share the same backgrounds for each rarity.
 */
export const cardBackgrounds: Record<CardRarity, ImageSourcePropType> = {
	Common: require('@/src/app/assets/images/card-bgs/card-bg-common.jpg'),
	Rare: require('@/src/app/assets/images/card-bgs/card-bg-rare.jpg'),
	Epic: require('@/src/app/assets/images/card-bgs/card-bg-epic.jpg'),
	Legendary: require('@/src/app/assets/images/card-bgs/card-bg-legendary.jpg'),
};
