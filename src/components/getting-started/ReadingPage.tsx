import GettingStartedPage from './GettingStartedPage';

// Introduce the word meanings and audio controls in the reading view.
export default function ReadingPage() {
	return (
		<GettingStartedPage
			title="Read words out loud"
			imageSource={require('@/src/app/assets/images/getting-started/story.png')}
			imageLabel="Reading view with a word, the speaker, and playback controls circled"
			description="Listen to any word, paragraph, chapter, or story with text to speech."
		/>
	);
}
