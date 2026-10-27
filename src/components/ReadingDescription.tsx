import ReadingLink, { type ReadingLinkProps } from '@/src/components/ReadingLink';

/**
 * We keep story descriptions and their reading link together where they are still used.
 */
export default function ReadingDescription({ showDescription = true, ...props }: ReadingLinkProps) {
	return (
		<ReadingLink
			{...props}
			showDescription={showDescription}
		/>
	);
}
