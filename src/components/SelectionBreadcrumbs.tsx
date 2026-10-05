import ViewIndicator from './ViewIndicator';

/**
 * Typing
 */
interface SelectionBreadcrumbsProps {
	currentViewIndex: number;
}

/**
 * Header breadcrumbs
 */
export default function SelectionBreadcrumbs({ currentViewIndex }: SelectionBreadcrumbsProps) {
	return (
		<ViewIndicator
			currentViewIndex={currentViewIndex}
			respectSafeArea={false}
			views={['Story', 'Chapter', 'Deck']}
		/>
	);
}
