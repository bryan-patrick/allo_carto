import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";
import colors from "../app/colors";

/**
 * Animation consts
 */
const CARD_X = 100;
const CARD_ROTATE = 180;
const CARD_MOVE_DURATION = 800;
const TOP_CARD_Z_INDEX = 3;
const UNDER_DECK_Z_INDEX = -1;
const DECK_Z_INDEX = 1;
const CARD_ONE_DELAY = 0;
const CARD_TWO_DELAY = 900;
const CARD_THREE_DELAY = 1800;
const CARD_REST_DURATION = 1800;

/**
 * Helper function to animate the cards
 */
function animateCard(
  x: SharedValue<number>,
  rotate: SharedValue<number>,
  zIndex: SharedValue<number>,
  delay: number
) {

  /**
   * 3 cards stacked on top of each other
   * First, they move to the side
   */
  x.value =
    withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(CARD_X, {
            duration: CARD_MOVE_DURATION,
            easing: Easing.inOut(Easing.ease)
          }),
          withTiming(0, {
            duration: CARD_MOVE_DURATION,
            easing: Easing.inOut(Easing.ease)
          }),
          withDelay(CARD_REST_DURATION, withTiming(0, { duration: 0 }))
        ),
        -1
      ),
    );

  /**
   * While moving to the side, the cards should be rotating
   */
  rotate.value =
    withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(CARD_ROTATE, {
            duration: CARD_MOVE_DURATION * 2,
            easing: Easing.inOut(Easing.ease)
          }),
          withTiming(0, { duration: 0 }),
          withDelay(CARD_REST_DURATION, withTiming(0, { duration: 0 }))
        ),
        -1
      ),
    );

  /**
   * Mid rotation and off to the side, 
   * set the zIndex to a lower value
   */
  zIndex.value =
    withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(TOP_CARD_Z_INDEX, { duration: 0 }),
          withDelay(CARD_MOVE_DURATION, withTiming(UNDER_DECK_Z_INDEX, { duration: 0 })),
          withDelay(CARD_MOVE_DURATION, withTiming(DECK_Z_INDEX, { duration: 0 })),
          withDelay(CARD_REST_DURATION, withTiming(DECK_Z_INDEX, { duration: 0 }))
        ),
        -1
      ),
    );
}

/**
 * Loader Component
 */
export default function Loader() {
  const {
    container,
    cardContainer,
    card,
    cardText,
    textContainer,
    text
  } = styles;

  /**
   * Animation values
   */
  const cardOneX = useSharedValue<number>(0);
  const cardOneRotate = useSharedValue<number>(0);
  const cardOneZIndex = useSharedValue<number>(3);
  const cardTwoX = useSharedValue<number>(0);
  const cardTwoRotate = useSharedValue<number>(0);
  const cardTwoZIndex = useSharedValue<number>(2);
  const cardThreeX = useSharedValue<number>(0);
  const cardThreeRotate = useSharedValue<number>(0);
  const cardThreeZIndex = useSharedValue<number>(1);

  /**
   * Animation styles
   */
  const cardOne = useAnimatedStyle(() => ({
    transform: [
      { translateX: cardOneX.value },
      { rotateZ: `${cardOneRotate.value}deg` }
    ],
    zIndex: cardOneZIndex.value
  }));

  const cardTwo = useAnimatedStyle(() => ({
    transform: [
      { translateX: cardTwoX.value },
      { rotateZ: `${cardTwoRotate.value}deg` }
    ],
    zIndex: cardTwoZIndex.value
  }));

  const cardThree = useAnimatedStyle(() => ({
    transform: [
      { translateX: cardThreeX.value },
      { rotateZ: `${cardThreeRotate.value}deg` }
    ],
    zIndex: cardThreeZIndex.value
  }));

  /**
   * Trigger the animations
   */
  useEffect(() => {
    animateCard(cardOneX, cardOneRotate, cardOneZIndex, CARD_ONE_DELAY);
    animateCard(cardTwoX, cardTwoRotate, cardTwoZIndex, CARD_TWO_DELAY);
    animateCard(cardThreeX, cardThreeRotate, cardThreeZIndex, CARD_THREE_DELAY);
  }, [
    cardOneRotate,
    cardOneX,
    cardOneZIndex,
    cardThreeRotate,
    cardThreeX,
    cardThreeZIndex,
    cardTwoRotate,
    cardTwoX,
    cardTwoZIndex
  ])

  /**
   * Render the loader
   */
  return (
    <Animated.View style={container}>
      <Animated.View style={cardContainer}>
        <Animated.View style={[card, cardOne]}>
          <Text style={cardText}>AC</Text>
        </Animated.View>
        <Animated.View style={[card, cardTwo]}>
          <Text style={cardText}>AC</Text>
        </Animated.View>
        <Animated.View style={[card, cardThree]}>
          <Text style={cardText}>AC</Text>
        </Animated.View>
      </Animated.View>
      <Animated.View style={textContainer}>
        <Text style={text}>Loading...</Text>
      </Animated.View>
    </Animated.View>
  )
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: colors.dark.background
  },
  cardContainer: {
    width: '100%',
    height: '50%',
    justifyContent: 'flex-end',
    alignContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8
  },
  card: {
    position: 'absolute',
    backgroundColor: colors.dark.primary,
    borderColor: colors.dark.border,
    borderWidth: 4,
    borderRadius: 12,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
    transform: [{
      translateX: 0,
    }],
  },
  cardText: {
    fontFamily: 'lexend-600',
    fontSize: 20,
    color: colors.dark.border
  },
  textContainer: {
    marginTop: 8,
    flex: 1,
    alignItems: 'center',
    height: '50%',
  },
  text: {
    fontFamily: 'lexend-600',
    fontSize: 18,
    color: colors.light.text,
  },
});
