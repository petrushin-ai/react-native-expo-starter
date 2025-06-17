import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DrawerItem {
    name: string;
    title: string;
    icon: string;
    route: string;
}

const drawerItems: DrawerItem[] = [
    { name: 'index', title: 'Home', icon: 'house.fill', route: '/(protected)/(tabs)' },
    { name: 'charts', title: 'Charts', icon: 'chart.bar.fill', route: '/(protected)/(tabs)/charts' },
    { name: 'components', title: 'Components', icon: 'square.grid.3x3.fill', route: '/(protected)/(tabs)/components' },
    { name: 'calendar', title: 'Calendar', icon: 'calendar', route: '/(protected)/calendar' },
    { name: 'profile', title: 'Profile', icon: 'person.fill', route: '/(protected)/(tabs)/profile' },
    { name: 'settings', title: 'Settings', icon: 'gearshape.fill', route: '/(protected)/(tabs)/settings' },
];

interface CustomDrawerContentProps {
    navigation: any;
    state: any;
}

export function CustomDrawerContent({ navigation, state }: CustomDrawerContentProps) {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const router = useRouter();

    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    const currentRoute = state.routeNames[state.index];

    const handleItemPress = (route: string, routeName: string) => {
        navigation.closeDrawer();
        router.push(route as any);
    };

    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: withSpring(0, {
                        damping: 20,
                        stiffness: 200,
                    }),
                },
            ],
        };
    });

    return (
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient
                colors={isDark
                    ? ['#1a1a1a', '#2d2d2d', '#1a1a1a']
                    : ['#ffffff', '#f8f9fa', '#ffffff']
                }
                style={StyleSheet.absoluteFillObject}
            />

            <Animated.View style={[styles.content, animatedContainerStyle]}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerIcon}>
                        <IconSymbol
                            name="sparkles"
                            size={32}
                            color={colors.tint}
                        />
                    </View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        Menu
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: colors.tabIconDefault }]}>
                        Navigate your app
                    </Text>
                </View>

                {/* Navigation Items */}
                <DrawerContentScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.itemsContainer}>
                        {drawerItems.map((item, index) => {
                            const isActive = currentRoute === item.name;

                            return (
                                <Pressable
                                    key={item.name}
                                    style={({ pressed }) => [
                                        styles.drawerItem,
                                        {
                                            backgroundColor: isActive
                                                ? colors.tint + '15'
                                                : pressed
                                                    ? colors.tabIconDefault + '10'
                                                    : 'transparent',
                                            borderLeftColor: isActive ? colors.tint : 'transparent',
                                        }
                                    ]}
                                    onPress={() => handleItemPress(item.route, item.name)}
                                >
                                    <View style={[
                                        styles.itemIcon,
                                        {
                                            backgroundColor: isActive ? colors.tint : colors.tabIconDefault + '20',
                                        }
                                    ]}>
                                        <IconSymbol
                                            name={item.icon as any}
                                            size={20}
                                            color={isActive ? '#ffffff' : colors.tabIconDefault}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.itemText,
                                        {
                                            color: isActive ? colors.tint : colors.text,
                                            fontWeight: isActive ? '600' : '500',
                                        }
                                    ]}>
                                        {item.title}
                                    </Text>
                                    {isActive && (
                                        <View style={[styles.activeIndicator, { backgroundColor: colors.tint }]} />
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                </DrawerContentScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.tabIconDefault }]}>
                        Expo Bootstrap App
                    </Text>
                    <Text style={[styles.versionText, { color: colors.tabIconDefault }]}>
                        v1.0.0
                    </Text>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        paddingVertical: 30,
        paddingBottom: 20,
        alignItems: 'center',
    },
    headerIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '400',
    },
    scrollContent: {
        flexGrow: 1,
    },
    itemsContainer: {
        paddingVertical: 10,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginVertical: 2,
        borderRadius: 12,
        borderLeftWidth: 3,
        position: 'relative',
    },
    itemIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    itemText: {
        fontSize: 16,
        flex: 1,
    },
    activeIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        position: 'absolute',
        right: 16,
    },
    footer: {
        paddingVertical: 20,
        paddingBottom: 30,
        alignItems: 'center',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0,0,0,0.1)',
        marginTop: 20,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    versionText: {
        fontSize: 12,
        fontWeight: '400',
    },
}); 