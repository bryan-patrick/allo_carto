import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../app/colors';
import LinkButton from './LinkButton';

/**
 * Typing
 */
interface CardProps {
	title: string;
	SVGElement?: ReactNode;
	description?: string;
	screen: string;
	linkText: string;
}

/**
 * LinkCard Component
 */
export default function LinkCard({ title, SVGElement, description, screen, linkText }: CardProps) {
	/**
	 * Different headings for when using an SVG or not
	 */
	let heading = <Text style={styles.title}>{title}</Text>;

	if (SVGElement) {
		heading = (
			<View style={styles.headingRow}>
				<View style={styles.headingColumn}>
					<Text style={styles.title}>{title}</Text>
					{description && <Text style={styles.description}>{description}</Text>}
				</View>
				<View style={styles.headingColumn}>{SVGElement}</View>
			</View>
		);
	}

	/**
	 * Render the LinkCard
	 */
	return (
		<View style={styles.card}>
			{heading}
			<LinkButton
				screen={screen}
				params={{ href: '/' }}
			>
				{linkText}
			</LinkButton>
		</View>
	);
}

/**
 * Styles
 */
const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.light.background,
		padding: 16,
		borderRadius: 8,
		gap: 16,
	},
	title: {
		fontSize: 20,
		fontFamily: 'lexend-600',
		color: colors.dark.text,
	},
	headingRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 12,
	},
	headingColumn: {
		gap: 12,
		flexShrink: 1,
	},
	description: {
		color: colors.dark.text,
		fontFamily: 'lexend-400',
		fontSize: 16,
	},
});
