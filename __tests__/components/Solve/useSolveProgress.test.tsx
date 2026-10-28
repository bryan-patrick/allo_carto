import Settings from '@/src/app/(tabs)/settings';
import { useSolveProgress } from '@/src/components/Solve/useSolveProgress';
import {
	appSettingsStorageKey,
	defaultAppSettings,
	readAppSettings,
} from '@/src/settings/appSettings';
import { AppSettingsProvider } from '@/src/settings/appSettingsContext';
import { useAppSettings } from '@/src/settings/useAppSettings';
import type { ProgressById } from '@/src/util/progression';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import Storage from 'expo-sqlite/kv-store';

let mockSavedSettings: string | null = null;
let mockPlayerLevel = 3;
let mockProgressById: ProgressById = {};

jest.mock('expo-sqlite/kv-store', () => ({
	getItemSync: jest.fn(() => mockSavedSettings),
	setItemSync: jest.fn((_key: string, value: string) => {
		mockSavedSettings = value;
	}),
}));

jest.mock('@/src/db/useUserProgress', () => ({
	useUserProgress: () => ({
		progressById: mockProgressById,
		experience: {
			level: mockPlayerLevel,
		},
		reloadProgress: jest.fn(),
	}),
}));

jest.mock('@/src/util/atlasCompletion', () => ({
	findParagraphById: () => ({
		wordIds: ['word_one', 'word_two'],
	}),
	isItemUnlocked: () => true,
}));

jest.mock('@/src/db/interface', () => ({
	resetDB: jest.fn(),
}));

jest.mock('@/src/components/VolumeSetting', () => () => null);

jest.mock('expo-haptics', () => ({
	impactAsync: jest.fn(),
	ImpactFeedbackStyle: {
		Heavy: 'heavy',
	},
}));

describe('Fast Solve Unlocks', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockSavedSettings = null;
		mockPlayerLevel = 3;
		mockProgressById = {
			deck_one: {
				userId: 'user_one',
				id: 'deck_one',
				type: 'paragraph',
				completionPercentage: 50,
				completedSolveStages: 2,
				hasFirstGem: true,
				seenWordCount: 2,
			},
		};
	});

	test('defaults to fast unlocks for existing Settings and preserves a saved normal setting', () => {
		expect(readAppSettings(null).fastSolveUnlocks).toBe(true);
		expect(readAppSettings('{"showUnseenWords":true}').fastSolveUnlocks).toBe(true);
		expect(readAppSettings('{"fastSolveUnlocks":false}').fastSolveUnlocks).toBe(false);
		expect(readAppSettings('{"fastSolveUnlocks":"false"}').fastSolveUnlocks).toBe(true);
	});

	test('recalculates immediately when Settings or player level change without losing progress', async () => {
		const { result, rerender, unmount } = await renderHook(
			() => {
				const progression = useSolveProgress('deck_one');
				const settings = useAppSettings();

				return {
					progression,
					...settings,
				};
			},
			{
				wrapper: AppSettingsProvider,
			},
		);

		expect(result.current.progression.nextStage).toBe(3);
		expect(result.current.progression.isEligible).toBe(true);

		await act(() => result.current.setSetting('fastSolveUnlocks', false));

		expect(result.current.progression.isEligible).toBe(false);
		expect(result.current.progression.requiredPlayerLevel).toBe(10);
		expect(result.current.progression.completedStages).toBe(2);
		expect(mockProgressById.deck_one.hasFirstGem).toBe(true);

		mockPlayerLevel = 10;
		await rerender(undefined);

		expect(result.current.progression.isEligible).toBe(true);
		await unmount();

		const reopened = await renderHook(() => useSolveProgress('deck_one'), {
			wrapper: AppSettingsProvider,
		});

		expect(reopened.result.current.requiredPlayerLevel).toBe(10);
		expect(reopened.result.current.completedStages).toBe(2);
	});

	test('a high player level still opens only the next incomplete stage', async () => {
		mockPlayerLevel = 30;
		mockProgressById.deck_one.completedSolveStages = 1;

		const { result } = await renderHook(() => useSolveProgress('deck_one'), {
			wrapper: AppSettingsProvider,
		});

		expect(result.current.nextStage).toBe(2);
		expect(result.current.definition?.label).toBe('Solve+');
	});

	test('returns a completed state after Stage 5', async () => {
		mockProgressById.deck_one.completedSolveStages = 5;

		const { result } = await renderHook(() => useSolveProgress('deck_one'), {
			wrapper: AppSettingsProvider,
		});

		expect(result.current.nextStage).toBeNull();
		expect(result.current.definition).toBeNull();
		expect(result.current.lockReason).toBe('completed');
	});

	test('the Settings switch saves its value and keeps other settings', async () => {
		await render(
			<AppSettingsProvider>
				<Settings />
			</AppSettingsProvider>,
		);

		const toggle = screen.getByLabelText('Fast Solve Unlocks');
		const expectedSettings = {
			...defaultAppSettings,
			fastSolveUnlocks: false,
		};

		expect(toggle.props.value).toBe(true);

		await fireEvent(toggle, 'valueChange', false);

		expect(Storage.setItemSync).toHaveBeenLastCalledWith(
			appSettingsStorageKey,
			JSON.stringify(expectedSettings),
		);
		expect(screen.getByLabelText('Fast Solve Unlocks').props.value).toBe(false);
	});
});
