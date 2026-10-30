import type { ImageSourcePropType } from 'react-native';

// Include PNGs in collection folders so new artwork needs no manual image list.
const collectionImages = require.context(
	'../app/assets/images/collections',
	true,
	/^\.\/[^/]+\/[^/]+\.png$/,
);
const collectionImagePaths = new Set(collectionImages.keys());

/*
 * Find a word's artwork in its collection folder using a lowercase filename with hyphens and no accents.
 * Leave missing artwork empty so the stamp can show its usual placeholder.
 */
export function getCollectionStampImage(
	collectionId: string,
	frenchWord: string,
): ImageSourcePropType | undefined {
	const separatedAccents = frenchWord.normalize('NFD');
	const wordWithoutAccents = separatedAccents.replace(/[\u0300-\u036f]/g, '');
	const lowercaseWord = wordWithoutAccents.toLowerCase();
	const hyphenatedWord = lowercaseWord.replace(/[^a-z0-9]+/g, '-');
	const imageName = hyphenatedWord.replace(/^-+|-+$/g, '');
	const imagePath = `./${collectionId}/${imageName}.png`;

	if (!collectionImagePaths.has(imagePath)) {
		return undefined;
	}

	return collectionImages<ImageSourcePropType>(imagePath);
}
