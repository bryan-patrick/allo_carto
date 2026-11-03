import GettingStartedPage from './GettingStartedPage';

// Explain how the word buttons fill in a flashcard's answer.
export default function MappedWordsPage() {
	return (
		<GettingStartedPage
			title="It's a fun challenge"
			imageSource={require('@/src/app/assets/images/getting-started/mapped-words.png')}
			imageLabel="English word buttons with an article and a meaning selected"
			description="Flashcards and puzzles start out easy and get harder. Stories and decks will gradually become longer and more challenging."
		/>
	);
}
