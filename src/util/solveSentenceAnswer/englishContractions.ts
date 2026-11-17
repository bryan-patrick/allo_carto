import { normalizeSentenceSpelling } from './sentenceSpelling';

/**
 * Full spellings for shortened English words, such as do not for don't.
 */
const englishContractions: Record<string, string> = {
	"can't": 'can not',
	cannot: 'can not',
	"won't": 'will not',
	"don't": 'do not',
	"doesn't": 'does not',
	"didn't": 'did not',
	"isn't": 'is not',
	"aren't": 'are not',
	"wasn't": 'was not',
	"weren't": 'were not',
	"hasn't": 'has not',
	"haven't": 'have not',
	"hadn't": 'had not',
	"couldn't": 'could not',
	"wouldn't": 'would not',
	"shouldn't": 'should not',
	"mustn't": 'must not',
	"it's": 'it is',
	"he's": 'he is',
	"she's": 'she is',
	"that's": 'that is',
	"there's": 'there is',
	"here's": 'here is',
	"what's": 'what is',
	"who's": 'who is',
	"i'm": 'i am',
	"you're": 'you are',
	"we're": 'we are',
	"they're": 'they are',
	"i've": 'i have',
	"you've": 'you have',
	"we've": 'we have',
	"they've": 'they have',
	"i'll": 'i will',
	"you'll": 'you will',
	"he'll": 'he will',
	"she'll": 'she will',
	"we'll": 'we will',
	"they'll": 'they will',
};

export const plainEnglishContractions = getPlainEnglishContractions();

/**
 * Builds a lookup for shortened English words that works without capitals or apostrophes.
 */
function getPlainEnglishContractions(): Map<string, string> {
	const contractions = new Map<string, string>();

	for (const [word, meaning] of Object.entries(englishContractions)) {
		const spelling = normalizeSentenceSpelling(word);

		contractions.set(spelling, meaning);
	}

	return contractions;
}
