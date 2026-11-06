import colors from '@/src/app/colors';
import type { ProgressType, UserProgressRow } from '@/src/util/progression';
import {
	getCompletedSolveStages,
	type CompletedSolveStages,
	type SolveStage,
} from '@/src/util/solveProgression';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import MaterialSymbol from './MaterialSymbol';

/*
 * Typing
 */
interface CollectionGemsProps {
	title: string;
	progress?: UserProgressRow;
	size?: number;
	celebrationStage?: SolveStage;
	celebrationReady?: boolean;
}

interface GemResponse {
	label: string;
	filledCount: number;
	description: string;
}

interface PrismaticGemProps {
	size: number;
}

const gemSpinDuration = 4000;
const gemSpinDegrees = 10 * 360;
const gemColors = [colors.gems.first, colors.gems.second, colors.gems.third];
const glowGemColors = [colors.glowGems.first, colors.glowGems.second, colors.glowGems.third];
const prismaticGemColors = [
	colors.rarity.Legendary,
	colors.gems.second,
	colors.gems.third,
	colors.gems.first,
] as const;
const gemAppearanceDescriptions: Partial<Record<CompletedSolveStages, string>> = {
	4: ' All three gems are glowing.',
	5: ' All three gems are prismatic. You have fully mastered this paragraph, congrats!',
};

/*
 * Gives the paragraph gems a cool prismatic color effect
 */
function PrismaticGem({ size }: PrismaticGemProps) {
	const slotStyle = {
		width: size,
		height: size,
	};
	const symbolStyle = {
		lineHeight: size,
	};

	return (
		<MaskedView
			style={slotStyle}
			maskElement={
				<MaterialSymbol
					name="diamond"
					size={size}
					filled
					color={colors.dark.text}
					style={[slotStyle, symbolStyle]}
				/>
			}
		>
			<LinearGradient
				colors={prismaticGemColors}
				start={{
					x: 0,
					y: 1,
				}}
				end={{
					x: 1,
					y: 0,
				}}
				style={StyleSheet.absoluteFill}
			/>
		</MaskedView>
	);
}

/*
 * Explains earned gems and the next Solve challenge.
 */
function getGemResponses(progress?: UserProgressRow): Record<CompletedSolveStages, GemResponse> {
	const type = progress?.type ?? 'paragraph';
	const completedParagraphCount = progress?.completedParagraphCount ?? 0;
	const paragraphCount = progress?.paragraphCount ?? 0;
	const seenWordCount = progress?.seenWordCount ?? 0;
	const wordCount = progress?.wordCount ?? 0;
	const requirements: Record<ProgressType, string> = {
		paragraph: `${seenWordCount} of ${wordCount} words seen. See every word in flashcards, then solve every puzzle card to earn the first gem.`,
		chapter: `${completedParagraphCount} of ${paragraphCount} paragraphs solved. Solve every paragraph in this chapter to earn its first gem.`,
		story: `${completedParagraphCount} of ${paragraphCount} paragraphs solved. Solve every paragraph in this story to earn its first gem.`,
	};
	const targets: Record<ProgressType, string> = {
		paragraph: 'this paragraph',
		chapter: 'every paragraph in this chapter',
		story: 'every paragraph in this story',
	};
	const target = targets[type];

	return {
		0: {
			label: '0/3 Gems',
			filledCount: 0,
			description: requirements[type],
		},
		1: {
			label: '1/3 Gems',
			filledCount: 1,
			description: `First gem earned! Complete Solve+ for ${target} to earn the second gem.`,
		},
		2: {
			label: '2/3 Gems',
			filledCount: 2,
			description: `Second gem earned! Complete Solve++ for ${target} to earn the third gem.`,
		},
		3: {
			label: '3/3 Gems',
			filledCount: 3,
			description: `All three gems earned! Complete Solve+++ for ${target} to make them glow.`,
		},
		4: {
			label: '3/3 Gems',
			filledCount: 3,
			description: `All three gems are glowing! Complete Solve++++ for ${target} to reach final mastery.`,
		},
		5: {
			label: '3/3 Gems',
			filledCount: 3,
			description: `Prismatic gems earned! All five Solve puzzles are complete for ${target}.`,
		},
	};
}

// Show earned gems and celebrate a new claim with a spin and a shrinking backdrop gem.
export default function CollectionGems({
	title,
	progress,
	size = 18,
	celebrationStage,
	celebrationReady = true,
}: CollectionGemsProps) {
	const rotation = useRef(new Animated.Value(0)).current;
	const backdropScale = useRef(new Animated.Value(8)).current;
	const [hasRevealedGem, setHasRevealedGem] = useState(!celebrationStage);
	const responses = getGemResponses(progress);
	const completedStages = getCompletedSolveStages(progress);
	const response = responses[completedStages];
	const displayedStages =
		celebrationStage && !hasRevealedGem ?
			((celebrationStage - 1) as CompletedSolveStages)
		:	completedStages;
	const displayedResponse = responses[displayedStages];
	const hasGlowingGems = displayedStages >= 4;
	const hasPrismaticGems = displayedStages === 5;
	const appearanceDescription = gemAppearanceDescriptions[completedStages] ?? '';
	const glowGemSize = size * 1.5;
	const glowGemOffset = (size - glowGemSize) / 2;
	const glowRowPosition = {
		top: size / 2 / 2,
	};
	const gemSlotStyle = {
		width: size,
		height: size,
	};
	const gemTextStyle = {
		lineHeight: size,
	};
	const glowGemStyle = {
		width: glowGemSize,
		height: glowGemSize,
		lineHeight: glowGemSize,
		top: glowGemOffset,
		left: glowGemOffset,
	};
	const backdropGemStyle = {
		opacity: 0.5,
		transform: [
			{
				perspective: 300,
			},
			{
				rotateY: rotation.interpolate({
					inputRange: [0, gemSpinDegrees],
					outputRange: ['0deg', `${gemSpinDegrees / 3}deg`],
				}),
			},
			{
				scale: backdropScale,
			},
		],
	};

	/*
	 * Spin and shrink the backdrop while the small gem stays still.
	 * Reveal the earned gem and remove its backdrop as soon as the backdrop reaches normal size.
	 */
	useEffect(() => {
		const spin = Animated.timing(rotation, {
			toValue: gemSpinDegrees,
			duration: gemSpinDuration,
			easing: Easing.out(Easing.quad),
			useNativeDriver: true,
		});
		const shrinkBackdrop = Animated.timing(backdropScale, {
			toValue: 1,
			duration: gemSpinDuration / 2,
			easing: Easing.out(Easing.quad),
			useNativeDriver: true,
		});

		if (!celebrationStage || !celebrationReady) {
			return;
		}

		rotation.setValue(0);
		backdropScale.setValue(8);
		setHasRevealedGem(false);
		spin.start();
		shrinkBackdrop.start(({ finished }) => {
			if (finished) {
				setHasRevealedGem(true);
			}
		});

		return () => {
			shrinkBackdrop.stop();
			spin.stop();
		};
	}, [celebrationStage, celebrationReady, rotation, backdropScale]);

	function showProgress() {
		Alert.alert(`${title} (${response.label})`, response.description);
	}

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`${title}: ${response.filledCount} of 3 gems. ${completedStages} of 5 Solve stages complete.${appearanceDescription}`}
			accessibilityHint="Show puzzle progress and gem requirements."
			hitSlop={8}
			onPress={showProgress}
		>
			<View style={styles.masteryRow}>
				<View style={styles.container}>
					{celebrationStage && celebrationReady && !hasRevealedGem && (
						<View
							pointerEvents="none"
							accessibilityElementsHidden
							importantForAccessibility="no-hide-descendants"
							style={[styles.row, StyleSheet.absoluteFill]}
						>
							{gemColors.map((gemColor, index) => {
								const isAffectedGem = celebrationStage >= 4 || index === celebrationStage - 1;

								return (
									<View
										key={index}
										style={gemSlotStyle}
									>
										{isAffectedGem && (
											<Animated.View style={[gemSlotStyle, backdropGemStyle]}>
												{celebrationStage === 5 ?
													<PrismaticGem size={size} />
												:	<MaterialSymbol
														name="diamond"
														size={size}
														filled
														color={gemColor}
														style={[gemSlotStyle, gemTextStyle]}
													/>
												}
											</Animated.View>
										)}
									</View>
								);
							})}
						</View>
					)}
					{hasGlowingGems && (
						<View
							pointerEvents="none"
							accessibilityElementsHidden
							importantForAccessibility="no-hide-descendants"
							style={[styles.row, styles.glowRow, glowRowPosition]}
						>
							{glowGemColors.map((gemColor, index) => {
								const glowColor = {
									textShadowColor: gemColor,
								};

								return (
									<View
										key={index}
										style={gemSlotStyle}
									>
										<MaterialSymbol
											name="diamond"
											size={glowGemSize}
											color={gemColor}
											style={[styles.glowGem, glowGemStyle, glowColor]}
											filled
										/>
									</View>
								);
							})}
						</View>
					)}
					<View style={styles.row}>
						{gemColors.map((gemColor, index) => {
							const filled = index < displayedResponse.filledCount;

							return (
								<View
									key={index}
									style={gemSlotStyle}
								>
									{hasPrismaticGems ?
										<PrismaticGem size={size} />
									:	<MaterialSymbol
											name="diamond"
											size={size}
											filled={filled}
											color={filled ? gemColor : colors.gems.unsolved}
											style={[gemSlotStyle, gemTextStyle, !filled && styles.unfilled]}
										/>
									}
								</View>
							);
						})}
					</View>
				</View>
				{completedStages === 5 && (
					<MaterialSymbol
						name="check"
						size={size}
						color={colors.wordProgress.mastered}
						style={!hasPrismaticGems && styles.hiddenCheck}
					/>
				)}
			</View>
		</Pressable>
	);
}

/*
 * Styles
 */
const styles = StyleSheet.create({
	hiddenCheck: {
		opacity: 0,
	},
	masteryRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	container: {
		position: 'relative',
		justifyContent: 'center',
		alignItems: 'center',
		alignContent: 'center',
	},
	glowRow: {
		...StyleSheet.absoluteFill,
	},
	glowGem: {
		position: 'absolute',
		opacity: 0.2,
		textShadowOffset: {
			width: 0,
			height: 0,
		},
		textShadowRadius: 1,
	},
	unfilled: {
		opacity: 0.4,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
	},
});
