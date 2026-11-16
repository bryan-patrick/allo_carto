import { useUserProgress } from '@/src/db/useUserProgress';
import { useEffect } from 'react';

/**
 * Saves a tip as discovered when its modal opens.
 */
export function useTipDiscovery(tipId: string, visible: boolean): void {
	/**
	 * Saved progress
	 */
	const { tips, discoverTip, isUpdatingProgress, status } = useUserProgress();

	const isTipDiscovered = tips.some(progress => {
		return progress.tip.id === tipId && progress.isDiscovered;
	});

	/**
	 * Wait for any current save so we don't explode in red text.
	 */
	useEffect(() => {
		if (!visible || isTipDiscovered || isUpdatingProgress || status !== 'ready') {
			return;
		}

		void discoverTip(tipId);
	}, [discoverTip, isTipDiscovered, isUpdatingProgress, status, tipId, visible]);
}
