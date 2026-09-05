import colors from '@/src/app/colors';
import ViewIndicator from '@/src/components/ViewIndicator';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

describe('<ViewIndicator />', () => {
	test('highlights the current selection view', async () => {
		const { getByText } = await render(
			<SafeAreaProvider
				initialMetrics={{
					frame: { x: 0, y: 0, width: 390, height: 844 },
					insets: { top: 47, right: 0, bottom: 34, left: 0 },
				}}
			>
				<ViewIndicator
					views={['Story', 'Chapter', 'Deck']}
					currentViewIndex={1}
				/>
			</SafeAreaProvider>,
		);

		expect(getByText('Story')).toHaveStyle({ color: colors.light.border });
		expect(getByText('Chapter')).toHaveStyle({ color: colors.light.goldenBorder });
		expect(getByText('Deck')).toHaveStyle({ color: colors.light.border });
	});
});
