import type { ViewStyle } from 'react-native';

/**
 * A small, sharp shadow for surfaces with fully opaque backgrounds
 */
export const solidSurfaceShadow: ViewStyle = {
	shadowColor: '#000000',
	shadowOffset: {
		width: 0,
		height: 1,
	},
	shadowOpacity: 0.8,
	shadowRadius: 0,
	elevation: 1,
};
