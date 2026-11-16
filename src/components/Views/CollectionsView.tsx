import colors from '@/src/app/colors';
import BackgroundImage from '@/src/components/BackgroundImage';
import CollectionsPageMenu, {
	type CollectionsPage,
} from '@/src/components/Collections/CollectionsPageMenu';
import { collectionsPageStyles } from '@/src/components/Collections/collectionsPageStyles';
import LinkButton from '@/src/components/LinkButton';
import Loader from '@/src/components/Loader';
import { useUserProgress } from '@/src/db/useUserProgress';
import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import StampsView from './StampsView';
import TipsView from './TipsView';

const collectionsPageBackground = require('@/src/app/assets/images/collections/page-background.jpg');

/**
 * Shows the Stamps or Tips page.
 */
export default function CollectionsView() {
	/**
	 * Saved progress and page selection
	 */
	const { status, reloadProgress } = useUserProgress();
	const [selectedPage, setSelectedPage] = useState<CollectionsPage>('stamps');

	/**
	 * Initial page content
	 */
	let pageContent: ReactNode = <StampsView />;

	if (selectedPage === 'tips') {
		pageContent = <TipsView />;
	}

	if (status === 'loading') {
		pageContent = <Loader />;
	}

	if (status === 'error') {
		pageContent = (
			<View style={styles.notice}>
				<Text style={collectionsPageStyles.introduction}>
					Could not load your collections. Please try again.
				</Text>
				<LinkButton handler={reloadProgress}>Try again</LinkButton>
			</View>
		);
	}

	/**
	 * Render the page
	 */
	return (
		<BackgroundImage
			source={collectionsPageBackground}
			resizeMode="cover"
			style={styles.background}
		>
			<CollectionsPageMenu
				selectedPage={selectedPage}
				onSelectPage={setSelectedPage}
			/>
			{pageContent}
		</BackgroundImage>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	background: {
		flex: 1,
		backgroundColor: colors.light.secondary,
	},
	notice: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
		gap: 16,
	},
});
