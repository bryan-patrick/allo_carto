import DeckPassageView from '@/src/components/DeckPassageView';
import { makeMockCardDeck } from '@/src/components/CardDeck/mockCardDeck';
import { emptyDeckWordProgressCounts } from '@/src/db/queries/getDeckWordProgressCounts';
import { fireEvent, render } from '@testing-library/react-native';

describe('<DeckPassageView />', () => {
	test('shows exempt text while ordinary unseen vocabulary stays hidden', async () => {
		const deck = makeMockCardDeck({
			passage: [
				{ text: 'Wallace', unlockExempt: true },
				{ text: '« hello »', wordId: 'hello', unlockExempt: true },
				{ text: 'pluie', wordId: 'rain', after: '.' },
			],
		});
		const { getByText, queryByText } = await render(
			<DeckPassageView
				deck={deck}
				wordProgressCounts={emptyDeckWordProgressCounts}
				wordProgressKeyByWordId={{}}
			/>,
		);

		expect(getByText('Wallace')).toBeTruthy();
		expect(getByText('« hello »')).toBeTruthy();
		expect(queryByText('pluie')).toBeNull();
		expect(getByText('?')).toBeTruthy();
		await fireEvent.press(getByText('Unseen'));
		expect(getByText('Wallace')).toHaveStyle({ opacity: 1 });
	});
});
