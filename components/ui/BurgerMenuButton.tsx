import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface BurgerMenuButtonProps {
    onPress: () => void;
    isDrawerOpen?: boolean;
}

export function BurgerMenuButton({ onPress, isDrawerOpen = false }: BurgerMenuButtonProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    const scale = useSharedValue(1);
    const rotation = useSharedValue(0);

    React.useEffect(() => {
        rotation.value = withTiming(isDrawerOpen ? 180 : 0, { duration: 300 });
    }, [isDrawerOpen]);

    const animatedButtonStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: withSpring(scale.value) },
                { rotate: `${rotation.value}deg` },
            ],
        };
    });

    const handlePressIn = () => {
        scale.value = 0.95;
    };

    const handlePressOut = () => {
        scale.value = 1;
    };

    return (
        <View style={styles.container}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={({ pressed }) => [
                    styles.button,
                    {
                        backgroundColor: pressed
                            ? colors.tint + '20'
                            : colors.tint + '15',
                    }
                ]}
            >
                <BlurView
                    intensity={20}
                    style={styles.blurContainer}
                    tint={isDark ? 'dark' : 'light'}
                >
                    <Animated.View style={[styles.iconContainer, animatedButtonStyle]}>
                        <IconSymbol
                            name={isDrawerOpen ? "xmark" as any : "line.3.horizontal" as any}
                            size={24}
                            color={colors.tint}
                            weight="medium"
                        />
                    </Animated.View>
                </BlurView>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60, // Positioned considering transparent header
        right: 20,
        zIndex: 1000,
        elevation: 10,
    },
    button: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    blurContainer: {
        flex: 1,
        borderRadius: 24,
    },
    iconContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
}); 