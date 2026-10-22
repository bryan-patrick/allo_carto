import { useAppSettings } from '@/src/settings/useAppSettings';
import { Text } from 'react-native';
import type { Word } from '../CardDeck/cardDeckTypes';
import { sharedWordCardStyles } from './sharedWordCardStyles';

type WordPronunciationProps = Pick<Word, 'pronunciation' | 'ipaPronunciation'>;

export default function WordPronunciation({
	pronunciation,
	ipaPronunciation,
}: WordPronunciationProps) {
	const { settings } = useAppSettings();
	let displayedPronunciation = `(${pronunciation})`;
	let pronunciationStyle = sharedWordCardStyles.readablePronunciation;

	if (settings.pronunciationFormat === 'ipa') {
		displayedPronunciation = `[${ipaPronunciation}]`;
		pronunciationStyle = sharedWordCardStyles.ipaPronunciation;
	}

	return <Text style={pronunciationStyle}>{displayedPronunciation}</Text>;
}
