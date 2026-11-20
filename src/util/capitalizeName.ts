/**
 * Capitalizes the first letter of each word in a display name.
 */
export function capitalizeName(name: string): string {
	const words = name.split(' ');
	const capitalizedWords: string[] = [];

	for (const word of words) {
		const firstCharacter = word.charAt(0);
		const capitalizedFirstCharacter = firstCharacter.toUpperCase();
		const remainingText = word.slice(1);
		const capitalizedWord = `${capitalizedFirstCharacter}${remainingText}`;

		capitalizedWords.push(capitalizedWord);
	}

	return capitalizedWords.join(' ');
}
