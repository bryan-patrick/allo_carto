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
const CARD_TRAVEL_X = 90;
const CARD_ROTATION = 180;
const CARD_MOVE_OUT_DURATION = 800;
const CARD_MOVE_BACK_DURATION = 300;
const TOP_CARD_Z_INDEX = 4;
const UNDER_DECK_Z_INDEX = -1;
const DECK_Z_INDEX = 1;
const CARD_ONE_DELAY = 0;
const CARD_TWO_DELAY = 900;
const CARD_THREE_DELAY = 1800;
const CARD_ONE_REST_DURATION = 1800;
const CARD_TWO_REST_DURATION = 900;
const CARD_THREE_REST_DURATION = 0;

/**
 * Helper function to animate the cards
 */
function animateCard(
  x: SharedValue<number>,
  rotate: SharedValue<number>,
  animatedZIndex: SharedValue<number>,
  delay: number,
  restDuration: number
) {
  x.value =
    withRepeat(
      withSequence(
        withDelay(delay, withTiming(CARD_TRAVEL_X, {
          duration: CARD_MOVE_OUT_DURATION,
          easing: Easing.inOut(Easing.ease)
        })),
        withTiming(0, {
          duration: CARD_MOVE_BACK_DURATION,
          easing: Easing.inOut(Easing.ease)
        }),
        withDelay(restDuration, withTiming(0, { duration: 0 }))
      ),
      -1
    );

  rotate.value =
    withRepeat(
      withSequence(
        withDelay(delay, withTiming(CARD_ROTATION, {
          duration: CARD_MOVE_OUT_DURATION,
          easing: Easing.inOut(Easing.ease)
        })),
        withTiming(CARD_ROTATION, { duration: CARD_MOVE_BACK_DURATION }),
        withTiming(0, { duration: 0 }),
        withDelay(restDuration, withTiming(0, { duration: 0 }))
      ),
      -1
    );

  animatedZIndex.value =
    withRepeat(
      withSequence(
        withDelay(delay, withTiming(TOP_CARD_Z_INDEX, { duration: 0 })),
        withDelay(CARD_MOVE_OUT_DURATION, withTiming(UNDER_DECK_Z_INDEX, { duration: 0 })),
        withDelay(CARD_MOVE_BACK_DURATION, withTiming(DECK_Z_INDEX, { duration: 0 })),
        withDelay(restDuration, withTiming(DECK_Z_INDEX, { duration: 0 }))
      ),
      -1
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
    animateCard(cardOneX, cardOneRotate, cardOneZIndex, CARD_ONE_DELAY, CARD_ONE_REST_DURATION);
    animateCard(cardTwoX, cardTwoRotate, cardTwoZIndex, CARD_TWO_DELAY, CARD_TWO_REST_DURATION);
    animateCard(cardThreeX, cardThreeRotate, cardThreeZIndex, CARD_THREE_DELAY, CARD_THREE_REST_DURATION);
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
    boxShadow: `4px 4px 4px 0 ${colors.dark.text}`,
    transform: [{
      translateX: 0,
    }],
  },
  cardText: {
    fontWeight: 800,
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
    fontWeight: 700,
    fontSize: 18,
    color: colors.light.text,
  },
});
