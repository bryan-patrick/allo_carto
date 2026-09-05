import colors from '@/src/app/colors';
import ViewIndicator from '@/src/components/ViewIndicator';
import { render } from '@testing-library/react-native';

describe('<ViewIndicator />', () => {
	test('highlights the current selection view', async () => {
		const { getByText } = await render(
			<ViewIndicator
				views={['Story', 'Chapter', 'Deck']}
				currentViewIndex={1}
			/>,
		);

		expect(getByText('Story')).toHaveStyle({ color: colors.light.border });
		expect(getByText('Chapter')).toHaveStyle({ color: colors.light.goldenBorder });
		expect(getByText('Deck')).toHaveStyle({ color: colors.light.border });
	});
});
