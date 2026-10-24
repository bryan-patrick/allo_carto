import LinkButton from '@/src/components/LinkButton';
import { fireEvent } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import { Text } from 'react-native';

jest.mock('@/src/util/useSoundEffect', () => ({
	useSoundEffect: () => jest.fn(),
}));

function ChapterScreen() {
	return <Text>Chapter destination</Text>;
}

describe('<LinkButton />', () => {
	test('navigates to a screen with its params and runs the press handlers', async () => {
		const handler = jest.fn();
		const onPress = jest.fn();
		const result = await renderRouter({
			index: () => (
				<LinkButton
					screen="/(routes)/ChapterSelect"
					params={{ storyId: 'story-one' }}
					handler={handler}
					onPress={onPress}
				>
					Start story
				</LinkButton>
			),
			'(routes)/ChapterSelect': ChapterScreen,
		});

		await fireEvent.press(result.getByText('Start story'));

		expect(result.getByText('Chapter destination')).toBeTruthy();
		expect(result.getSearchParams()).toEqual({ storyId: 'story-one' });
		expect(handler).toHaveBeenCalledTimes(1);
		expect(onPress).toHaveBeenCalledTimes(1);
	});
});
