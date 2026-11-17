import colors from '@/src/app/colors';
import { useSoftTapSound } from '@/src/util/softTapSound';
import NativeSegmentedControl, {
	type SegmentedControlProps,
} from '@react-native-segmented-control/segmented-control';
import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * This is an interesting issue.
 *
 * React native intersects its types with react's.
 *
 * This is an example of them not actually matching up.
 *
 * React native thinks that this isn't a React.component...
 */
const SegmentedControl = NativeSegmentedControl as unknown as ComponentType<SegmentedControlProps>;

/**
 * Typing
 */
export type CollectionsPage = 'stamps' | 'tips';

interface CollectionsPageMenuProps {
	selectedPage: CollectionsPage;
	onSelectPage: (page: CollectionsPage) => void;
}

interface CollectionsPageOption {
	page: CollectionsPage;
	label: string;
}

const pageOptions: CollectionsPageOption[] = [
	{
		page: 'stamps',
		label: 'Stamps',
	},
	{
		page: 'tips',
		label: 'Tips',
	},
];
const pageLabels = pageOptions.map(option => option.label);

/**
 * Lets the player switch between Stamps and Tips with a native segmented control.
 */
export default function CollectionsPageMenu({
	selectedPage,
	onSelectPage,
}: CollectionsPageMenuProps) {
	/**
	 * Tap sound and selected segment
	 */
	const playSoftTap = useSoftTapSound();
	const selectedIndex = pageOptions.findIndex(option => option.page === selectedPage);

	return (
		<View style={styles.menu}>
			<SegmentedControl
				accessibilityLabel="Collection pages"
				values={pageLabels}
				selectedIndex={selectedIndex}
				tintColor={colors.light.text}
				fontStyle={{ color: colors.dark.text }}
				onChange={event => {
					const selectedOption = pageOptions[event.nativeEvent.selectedSegmentIndex];

					if (!selectedOption) {
						return;
					}

					void playSoftTap();
					onSelectPage(selectedOption.page);
				}}
				style={styles.control}
			/>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	menu: {
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 8,
	},
	control: {
		width: '100%',
	},
});
