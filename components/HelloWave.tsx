import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';

export function HelloWave() {
  const rotationAnimation = useSharedValue(0);
  const translateXAnimation = useSharedValue(0);
  const translateYAnimation = useSharedValue(0);

  useEffect(() => {
    // Create coordinated animation values for natural waving motion
    const springConfig = {
      damping: 10,
      stiffness: 120,
      mass: 0.6,
    };

    const waveSequence = withSequence(
      // Wave right - rotate right, move right, slight bounce up
      withSpring(8, springConfig),
      // Wave left - rotate left, move left, slight bounce up  
      withSpring(-8, springConfig),
      // Wave right again
      withSpring(8, springConfig),
      // Return to center
      withSpring(0, { ...springConfig, damping: 12 })
    );

    const translateXSequence = withSequence(
      // Move right during right wave
      withSpring(2, springConfig),
      // Move left during left wave
      withSpring(-2, springConfig),
      // Move right again
      withSpring(2, springConfig),
      // Return to center
      withSpring(0, { ...springConfig, damping: 12 })
    );

    const translateYSequence = withSequence(
      // Slight bounce up during wave peaks
      withSpring(-1, springConfig),
      withSpring(-1, springConfig),
      withSpring(-1, springConfig),
      // Return to center
      withSpring(0, { ...springConfig, damping: 12 })
    );

    // Start all animations simultaneously for coordinated motion
    rotationAnimation.value = withRepeat(waveSequence, 2, false);
    translateXAnimation.value = withRepeat(translateXSequence, 2, false);
    translateYAnimation.value = withRepeat(translateYSequence, 2, false);
  }, [rotationAnimation, translateXAnimation, translateYAnimation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateXAnimation.value },
      { translateY: translateYAnimation.value },
      { rotate: `${rotationAnimation.value}deg` },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={styles.text}>👋</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    lineHeight: 32,
    // Removed margins to avoid affecting pivot point
    textAlign: 'center',
  },
});
