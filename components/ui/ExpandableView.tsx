import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

const animationConfig = {
    duration: 300,
    easing: Easing.inOut(Easing.ease)
};

interface ExpandableViewProps {
    children: React.ReactNode;
    expanded: boolean;
}

export default function ExpandableView({
    children,
    expanded
}: ExpandableViewProps) {
    const prevChildRef = useRef<React.ReactNode>(null);
    const height = useSharedValue(0);
    const hasChildren = useSharedValue(false);
    const animationProgress = useSharedValue(0);

    useEffect(() => {
        prevChildRef.current = children;
        hasChildren.value = expanded;
    }, [children, expanded]);

    useAnimatedReaction(
        () => ({
            expanded: hasChildren.value
        }),
        ({ expanded }) => {
            if (expanded) {
                animationProgress.value = 0;
                animationProgress.value = withTiming(1, animationConfig);
            } else {
                animationProgress.value = withTiming(0, animationConfig);
            }
        }
    );

    const animatedOuterStyle = useAnimatedStyle(() => ({
        height: interpolate(animationProgress.value, [0, 1], [0, height.value]),
        opacity: animationProgress.value
    }));

    const animatedInnerStyle = useAnimatedStyle(() => ({
        opacity: animationProgress.value
    }));

    return (
        <Animated.View style={[styles.outerContainer, animatedOuterStyle]}>
            <Animated.View
                style={[styles.innerContainer, animatedInnerStyle]}
                onLayout={({ nativeEvent: { layout } }) => {
                    height.value = layout.height;
                }}>
                {children || prevChildRef.current}
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    innerContainer: {
        position: 'absolute',
        top: 0,
        width: '100%'
    },
    outerContainer: {
        overflow: 'hidden'
    }
}); 