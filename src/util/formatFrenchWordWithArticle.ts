export default function formatFrenchWordWithArticle({
	article,
	word,
}: {
	article?: string;
	word: string;
}) {
	if (!article) {
		return word;
	}

	if (article.endsWith("'")) {
		return `${article}${word}`;
	}

	return `${article} ${word}`;
}
