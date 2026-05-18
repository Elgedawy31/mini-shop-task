import { Dimensions } from "react-native";
import {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;

/** Scroll-linked motion for auth screens (parallax + compact chrome). */
export function useAuthScrollMotion(keyboardHeight: SharedValue<number>) {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const glowPrimaryStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value * 0.42 }, { translateX: scrollY.value * -0.08 }],
  }));

  const glowSecondaryStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value * -0.28 }, { translateX: scrollY.value * 0.12 }],
  }));

  const brandStyle = useAnimatedStyle(() => {
    const kb = keyboardHeight.value;
    const y = scrollY.value;

    const scrollOpacity = interpolate(y, [0, 72, 150], [1, 0.88, 0.2], Extrapolation.CLAMP);
    const keyboardOpacity = interpolate(kb, [0, 120, 220], [1, 0.85, 0], Extrapolation.CLAMP);

    return {
      opacity: Math.min(scrollOpacity, keyboardOpacity),
      maxHeight: interpolate(kb, [0, 80, 220], [200, 120, 0], Extrapolation.CLAMP),
      marginBottom: interpolate(kb, [0, 220], [0, -12], Extrapolation.CLAMP),
      overflow: "hidden" as const,
      transform: [
        {
          translateY: interpolate(y, [0, 150], [0, -32], Extrapolation.CLAMP),
        },
        {
          scale: interpolate(y, [0, 150], [1, 0.86], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const headerStyle = useAnimatedStyle(() => {
    const kb = keyboardHeight.value;
    const y = scrollY.value;

    return {
      opacity: Math.min(
        interpolate(y, [0, 48, 110], [1, 1, 0.62], Extrapolation.CLAMP),
        interpolate(kb, [0, 100, 200], [1, 1, 0.55], Extrapolation.CLAMP)
      ),
      transform: [
        {
          translateY:
            interpolate(y, [0, 120], [0, -18], Extrapolation.CLAMP) +
            interpolate(kb, [0, 220], [0, -8], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const cardStyle = useAnimatedStyle(() => {
    const y = scrollY.value;
    return {
      transform: [
        {
          translateY: interpolate(y, [0, 180], [0, -10], Extrapolation.CLAMP),
        },
        {
          scale: interpolate(y, [0, 220], [1, 0.985], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const footerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 80, 160], [1, 0.92, 0.75], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, 160], [0, -8], Extrapolation.CLAMP),
      },
    ],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: interpolate(scrollY.value, [0, 280], [0, SCREEN_WIDTH], Extrapolation.CLAMP),
  }));

  return {
    scrollHandler,
    glowPrimaryStyle,
    glowSecondaryStyle,
    brandStyle,
    headerStyle,
    cardStyle,
    footerStyle,
    progressStyle,
  };
}
