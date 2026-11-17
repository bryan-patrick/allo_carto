import type { ScrollViewProps } from 'react-native';

/**
 * Typing
 */
export interface CollectionsPageScrollProps {
	onScroll?: ScrollViewProps['onScroll'];
	onLayout?: ScrollViewProps['onLayout'];
	onContentSizeChange?: ScrollViewProps['onContentSizeChange'];
}
