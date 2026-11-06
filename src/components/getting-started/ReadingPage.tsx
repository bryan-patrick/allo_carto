import GettingStartedPage from './GettingStartedPage';

const description = `Listen to any word, paragraph, chapter, or story with text to speech.
			
The rewind button is especially useful!`;

// Introduce the word meanings and audio controls in the reading view.
export default function ReadingPage() {
	return (
		<GettingStartedPage
			title="Hear words out loud."
			imageSource={require('@/src/app/assets/images/getting-started/story.png')}
			imageLabel="Reading view with a word, the speaker, and playback controls circled"
			description={description}
		/>
	);
}
