import GettingStartedPage from './GettingStartedPage';

// Welcome the player to learning French with Léo and Poe.
export default function WelcomePage() {
	return (
		<GettingStartedPage
			title="Hello!"
			imageSource={require('@/src/app/assets/images/getting-started/welcome.png')}
			imageLabel="Léo the cat resting on an Allô Carto box beside Poe the raven holding a flashcard"
			description="Welcome to Allô Carto, a story driven flashcard language learning app inspired by the unlikely friendship of a cat and a raven."
		/>
	);
}
