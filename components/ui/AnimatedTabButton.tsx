import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

export function AnimatedTabButton({ children, ...props }: BottomTabBarButtonProps) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    const handlePressIn = (ev: any) => {
        // Add haptic feedback
        if (process.env.EXPO_OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // More pronounced scale down animation
        scale.value = withSpring(0.85, {
            damping: 15,
            stiffness: 300,
        });

        opacity.value = withTiming(0.7, { duration: 100 });

        props.onPressIn?.(ev);
    };

    const handlePressOut = (ev: any) => {
        // Scale back up with a nice spring
        scale.value = withSpring(1, {
            damping: 12,
            stiffness: 400,
        });

        opacity.value = withTiming(1, { duration: 150 });

        props.onPressOut?.(ev);
    };

    const handlePress = (ev: any) => {
        // More pronounced bounce when actually pressed
        scale.value = withSpring(1.15, {
            damping: 8,
            stiffness: 600,
        });

        // Then back to normal
        setTimeout(() => {
            scale.value = withSpring(1, {
                damping: 12,
                stiffness: 400,
            });
        }, 120);

        props.onPress?.(ev);
    };

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <PlatformPressable
                {...props}
                style={[styles.pressable, props.style]}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handlePress}
            >
                {children}
            </PlatformPressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressable: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        minHeight: 60, // Ensure minimum tap target size
    },
}); 