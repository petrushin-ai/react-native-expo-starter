import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';

interface HelloWaveProps {
  /** Trigger to restart the wave animation. Change this value to trigger a new animation */
  trigger?: number;
}

export function HelloWave({ trigger = 0 }: HelloWaveProps) {
  const rotationAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(1);
  const opacityAnimation = useSharedValue(1);

  const startProfessionalWaveAnimation = () => {
    // Professional micro-animation with subtle movements
    const timingConfig = {
      duration: 600,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // Professional easing curve
    };

    const springConfig = {
      damping: 15,
      stiffness: 200,
      mass: 0.8,
    };

    // Subtle rotation sequence - much less exaggerated
    const rotationSequence = withSequence(
      withTiming(0, { duration: 0 }), // Reset to 0
      withSpring(12, springConfig), // Gentle right wave
      withSpring(-8, springConfig), // Gentle left wave  
      withSpring(6, springConfig),  // Smaller right wave
      withSpring(0, { ...springConfig, damping: 20 }) // Smooth return to center
    );

    // Subtle scale animation for emphasis
    const scaleSequence = withSequence(
      withTiming(1, { duration: 0 }), // Reset
      withTiming(1.1, { duration: 150, easing: Easing.out(Easing.quad) }),
      withTiming(0.95, { duration: 100, easing: Easing.inOut(Easing.quad) }),
      withTiming(1.05, { duration: 120, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 230, easing: Easing.out(Easing.quad) })
    );

    // Subtle opacity pulse for attention
    const opacitySequence = withSequence(
      withTiming(1, { duration: 0 }), // Reset
      withTiming(0.7, { duration: 100, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
      withTiming(0.85, { duration: 100, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 250, easing: Easing.out(Easing.quad) })
    );

    // Start all animations simultaneously for coordinated motion
    rotationAnimation.value = rotationSequence;
    scaleAnimation.value = scaleSequence;
    opacityAnimation.value = opacitySequence;
  };

  useEffect(() => {
    // Only animate when trigger changes (not on initial mount)
    if (trigger > 0) {
      startProfessionalWaveAnimation();
    }
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleAnimation.value },
      { rotate: `${rotationAnimation.value}deg` },
    ],
    opacity: opacityAnimation.value,
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
    textAlign: 'center',
  },
});
