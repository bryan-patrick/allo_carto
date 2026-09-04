import LockedSection from '@/src/components/LockedSection';
import { render } from '@testing-library/react-native';

describe('<LockedSection />', () => {
	test('shows each requirement and crosses out the ones already met', async () => {
		const { getByText } = await render(
			<LockedSection
				color="#123456"
				unlockCriteria={[
					{
						title: 'First chapter',
						requiredPercentage: 25,
						isUnlocked: true,
					},
					{
						title: 'Second chapter',
						requiredPercentage: 50,
						isUnlocked: false,
					},
				]}
			/>,
		);

		expect(getByText('Complete the following to unlock:')).toBeTruthy();
		expect(getByText('First chapter')).toHaveStyle({
			textDecorationLine: 'line-through',
		});
		expect(getByText('Second chapter')).not.toHaveStyle({
			textDecorationLine: 'line-through',
		});
	});
});
