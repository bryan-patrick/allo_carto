// masked-view 0.3.2 uses NativeMethods, which React Native's strict types removed.
// Its runtime component extends React.Component and accepts these view props.
declare module '@react-native-masked-view/masked-view' {
	import { Component, type ReactElement } from 'react';
	import type { ViewProps } from 'react-native';

	export interface MaskedViewProps extends ViewProps {
		maskElement: ReactElement;
		androidRenderingMode?: 'software' | 'hardware';
	}

	export default class MaskedView extends Component<MaskedViewProps> {}
}
