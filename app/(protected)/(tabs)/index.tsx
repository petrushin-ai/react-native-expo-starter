import Ionicons from '@expo/vector-icons/Ionicons';
import { useDrawerStatus } from '@react-navigation/drawer';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Reanimated, {
  runOnJS,
  runOnUI,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated';

import { HelloWave } from '@/components/HelloWave';
import { BurgerMenuButton } from '@/components/ui/BurgerMenuButton';
import { LottieAnimation } from '@/components/ui/LottieAnimation';
import { useSplash } from '@/contexts/SplashContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  const navigation = useNavigation();
  const drawerStatus = useDrawerStatus();
  const isDrawerOpen = drawerStatus === 'open';
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isSplashFinished } = useSplash();

  // State for pull-to-refresh and wave animation
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [waveAnimationTrigger, setWaveAnimationTrigger] = useState(0);
  const [hasTriggeredInitialAnimation, setHasTriggeredInitialAnimation] = useState(false);

  // Animation for Explore Charts button
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Reanimated scroll handling
  const scrollViewRef = useAnimatedRef<Reanimated.ScrollView>();
  const scrollY = useSharedValue(0);
  const isScrollingToTop = useSharedValue(false);

  // Function to trigger animations (moved to separate function for reuse)
  const triggerAnimations = useCallback(() => {
    // Trigger wave animation
    setWaveAnimationTrigger(prev => prev + 1);
  }, []);

  // Scroll handler to track position
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      // Add occasional logging to track scroll position
      if (Math.floor(event.contentOffset.y) % 100 === 0) {
        console.log('🔍 Scroll position:', event.contentOffset.y);
      }
    },
    onMomentumEnd: (event) => {
      console.log('🔍 onMomentumEnd triggered, position:', event.contentOffset.y, 'isScrollingToTop:', isScrollingToTop.value);
      // Check if we just finished scrolling to top and should trigger animations
      if (isScrollingToTop.value && event.contentOffset.y <= 5) {
        console.log('🔍 Scroll to top completed, triggering animations');
        isScrollingToTop.value = false;
        // Use the pre-defined function with runOnJS
        runOnJS(triggerAnimations)();
      }
    },
  });

  // Function to handle scroll to top with animation coordination
  const handleScrollToTopAndAnimate = useCallback(() => {
    console.log('🔍 handleScrollToTopAndAnimate called, scrollY.value:', scrollY.value);

    // Check if we need to scroll to top
    if (scrollY.value > 10) { // Small threshold to avoid unnecessary scrolling
      console.log('🔍 Need to scroll to top, current position:', scrollY.value);
      isScrollingToTop.value = true;

      // Use runOnUI to call scrollTo from UI thread
      runOnUI(() => {
        'worklet';
        console.log('🔍 Calling scrollTo from UI thread');
        scrollTo(scrollViewRef, 0, 0, true);
      })();
    } else {
      console.log('🔍 Already at top, triggering animations immediately');
      // Already at top, trigger animations immediately
      triggerAnimations();
    }
  }, [triggerAnimations, scrollY, scrollViewRef, isScrollingToTop]);

  // Trigger wave animation immediately when splash screen finishes
  useEffect(() => {
    if (isSplashFinished && !hasTriggeredInitialAnimation) {
      // Trigger animation immediately after splash screen finishes
      handleScrollToTopAndAnimate();
      setHasTriggeredInitialAnimation(true);
    }
  }, [isSplashFinished, hasTriggeredInitialAnimation, handleScrollToTopAndAnimate]);

  // Trigger wave animation when screen comes into focus (navigation)
  useFocusEffect(
    useCallback(() => {
      // Only trigger on navigation focus, not initial load
      if (hasTriggeredInitialAnimation) {
        // Small delay to ensure screen is fully loaded
        const timer = setTimeout(() => {
          handleScrollToTopAndAnimate();
        }, 200);

        return () => clearTimeout(timer);
      }
    }, [hasTriggeredInitialAnimation, handleScrollToTopAndAnimate])
  );

  // Trigger button animation when waveAnimationTrigger changes
  useEffect(() => {
    if (waveAnimationTrigger > 0) {
      // Small delay after wave animation starts
      const timer = setTimeout(() => {
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 350,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 350,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            useNativeDriver: true,
          }),
        ]).start();
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [waveAnimationTrigger, scaleAnim]);

  const handleBurgerPress = () => {
    if (isDrawerOpen) {
      (navigation as any).closeDrawer();
    } else {
      (navigation as any).openDrawer();
    }
  };

  const handleNavigateToCharts = () => {
    (navigation as any).navigate('charts');
  };

  const handleNavigateToComponents = () => {
    (navigation as any).navigate('components');
  };

  const handleNavigateToCalendar = () => {
    (navigation as any).navigate('calendar');
  };

  const handleTelegramPress = () => {
    Linking.openURL('https://t.me/wedigital');
  };

  const handleGitHubPress = () => {
    Linking.openURL('https://github.com/petrushin.ai');
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:petrushin.a@live.ru');
  };

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    // Simulate loading delay (like fetching fresh data)
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsRefreshing(false);

    // Trigger wave animation after successful refresh using the same mechanism
    handleScrollToTopAndAnimate();
  }, [handleScrollToTopAndAnimate]);

  return (
    <>
      <Reanimated.ScrollView
        ref={scrollViewRef}
        style={[styles.container, isDark && styles.containerDark]}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? '#6B7280' : '#2563EB'}
            colors={[isDark ? '#6B7280' : '#2563EB']}
            progressBackgroundColor={isDark ? '#2d2d2d' : '#fff'}
            title="Refreshing..."
            titleColor={isDark ? '#6B7280' : '#2563EB'}
            progressViewOffset={50}
          />
        }
      >
        <View style={styles.content}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, isDark && styles.textDark]}>Welcome!</Text>
              <HelloWave trigger={waveAnimationTrigger} />
            </View>
            <Text style={[styles.subtitle, isDark && styles.textDark]}>
              This carefully crafted bootstrap combines the latest Expo & React Native versions with battle-tested components. Hours of debugging and integration work went into creating this production-ready UI kit for you!
            </Text>
          </View>

          {/* Quick Actions Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
              Quick Actions
            </Text>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryAction, isDark && styles.primaryActionDark]}
                onPress={handleNavigateToCharts}
              >
                <View style={styles.actionButtonContent}>
                  <Ionicons name="bar-chart" size={24} color={isDark ? '#6B7280' : '#2563EB'} />
                  <View style={styles.actionButtonText}>
                    <Text style={[styles.actionButtonTitle, isDark && styles.actionButtonTitleDark]}>Explore Charts</Text>
                    <Text style={[styles.actionButtonDescription, isDark && styles.textDark]}>
                      View beautiful data visualizations and chart components
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction, isDark && styles.secondaryActionDark]}
              onPress={handleNavigateToComponents}
            >
              <View style={styles.actionButtonContent}>
                <Ionicons name="grid" size={24} color={isDark ? '#6B7280' : '#2563EB'} />
                <View style={styles.actionButtonText}>
                  <Text style={[styles.actionButtonTitleSecondary, isDark && styles.actionButtonTitleSecondaryDark]}>
                    UI Components
                  </Text>
                  <Text style={[styles.actionButtonDescriptionSecondary, isDark && styles.textDark]}>
                    Browse the component library and interactive examples
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction, isDark && styles.secondaryActionDark]}
              onPress={handleNavigateToCalendar}
            >
              <View style={styles.actionButtonContent}>
                <Ionicons name="calendar" size={24} color={isDark ? '#6B7280' : '#2563EB'} />
                <View style={styles.actionButtonText}>
                  <Text style={[styles.actionButtonTitleSecondary, isDark && styles.actionButtonTitleSecondaryDark]}>
                    Calendar
                  </Text>
                  <Text style={[styles.actionButtonDescriptionSecondary, isDark && styles.textDark]}>
                    Check out the interactive calendar component
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
              App Features
            </Text>

            <View style={styles.featureGrid}>
              <View style={[styles.featureCard, isDark && styles.featureCardDark]}>
                <Ionicons name="color-palette" size={28} color="#2563EB" style={styles.featureIcon} />
                <Text style={[styles.featureTitle, isDark && styles.textDark]}>Theme Support</Text>
                <Text style={[styles.featureDescription, isDark && styles.textDark]}>
                  Dark and light mode with automatic system detection
                </Text>
              </View>

              <View style={[styles.featureCard, isDark && styles.featureCardDark]}>
                <Ionicons name="notifications" size={28} color="#2563EB" style={styles.featureIcon} />
                <Text style={[styles.featureTitle, isDark && styles.textDark]}>Push Notifications</Text>
                <Text style={[styles.featureDescription, isDark && styles.textDark]}>
                  Expo push notifications with permission management
                </Text>
              </View>

              <View style={[styles.featureCard, isDark && styles.featureCardDark]}>
                <Ionicons name="phone-portrait" size={28} color="#2563EB" style={styles.featureIcon} />
                <Text style={[styles.featureTitle, isDark && styles.textDark]}>Responsive Design</Text>
                <Text style={[styles.featureDescription, isDark && styles.textDark]}>
                  Optimized for all screen sizes and orientations
                </Text>
              </View>

              <View style={[styles.featureCard, isDark && styles.featureCardDark]}>
                <Ionicons name="shield-checkmark" size={28} color="#2563EB" style={styles.featureIcon} />
                <Text style={[styles.featureTitle, isDark && styles.textDark]}>Permissions</Text>
                <Text style={[styles.featureDescription, isDark && styles.textDark]}>
                  Smart permission handling with user-friendly prompts
                </Text>
              </View>
            </View>
          </View>

          {/* Getting Started Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
              Getting Started
            </Text>

            <View style={styles.stepContainer}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, isDark && styles.textDark]}>Explore Navigation</Text>
                <Text style={[styles.stepDescription, isDark && styles.textDark]}>
                  Use the burger menu to explore different sections of the app
                </Text>
              </View>
            </View>

            <View style={styles.stepContainer}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, isDark && styles.textDark]}>Check Settings</Text>
                <Text style={[styles.stepDescription, isDark && styles.textDark]}>
                  Configure your preferences and permissions in the Settings tab
                </Text>
              </View>
            </View>

            <View style={styles.stepContainer}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, isDark && styles.textDark]}>Start Building</Text>
                <Text style={[styles.stepDescription, isDark && styles.textDark]}>
                  Begin customizing the app for your specific needs
                </Text>
              </View>
            </View>
          </View>

          {/* Kawaii Kitty Section */}
          <View style={[styles.kawaiCard, isDark && styles.kawaiCardDark]}>
            <View style={styles.skyBackground}>
              <LottieAnimation
                animationName="splash"
                autoPlay
                loop
                size="medium"
                style={styles.kittyAnimation}
              />
            </View>
            <Text style={[styles.kawaiText, isDark && styles.textDark]}>
              頑張って！ (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧
            </Text>
            <Text style={[styles.kawaiSubtext, isDark && styles.textDark]}>
              Ganbatte! You're doing great, keep coding! 🐱✨
            </Text>
          </View>

          {/* Credits Section */}
          <View style={[styles.creditsSection, isDark && styles.creditsSectionDark]}>
            <Text style={[styles.creditsTitle, isDark && styles.textDark]}>
              Made with ❤️ by
            </Text>

            <View style={styles.creditsContainer}>
              <TouchableOpacity
                style={[styles.creditItem, isDark && styles.creditItemDark]}
                onPress={handleTelegramPress}
              >
                <Ionicons name="send" size={20} color="#0088cc" />
                <Text style={[styles.creditText, isDark && styles.textDark]}>@wedigital</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.creditItem, isDark && styles.creditItemDark]}
                onPress={handleGitHubPress}
              >
                <Ionicons name="logo-github" size={20} color={isDark ? '#fff' : '#333'} />
                <Text style={[styles.creditText, isDark && styles.textDark]}>petrushin.ai</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.creditItem, isDark && styles.creditItemDark]}
                onPress={handleEmailPress}
              >
                <Ionicons name="mail" size={20} color="#ea4335" />
                <Text style={[styles.creditText, isDark && styles.textDark]}>petrushin.a@live.ru</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Reanimated.ScrollView>

      <BurgerMenuButton
        onPress={handleBurgerPress}
        isDrawerOpen={isDrawerOpen}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 40,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 8,
  },
  title: {
    fontSize: 32,
    marginTop: 8,
    marginBottom: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  textDark: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  actionButton: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  primaryAction: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#9ca3af',
    paddingVertical: 18,
    paddingHorizontal: 16,
    minHeight: 100,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  secondaryAction: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#9ca3af',
    paddingVertical: 18,
    paddingHorizontal: 16,
    minHeight: 100,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  secondaryActionDark: {
    backgroundColor: '#2d2d2d',
    borderColor: '#6b7280',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    marginLeft: 16,
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  actionButtonTitleSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  actionButtonTitleSecondaryDark: {
    color: '#6B7280',
  },
  actionButtonDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionButtonDescriptionSecondary: {
    fontSize: 14,
    color: '#666',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureCardDark: {
    backgroundColor: '#2d2d2d',
    borderColor: '#374151',
  },
  featureIcon: {
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  kawaiCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 40,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kawaiCardDark: {
    backgroundColor: '#2d2d2d',
    borderColor: '#374151',
  },
  skyBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#87CEEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  kittyAnimation: {
    // Animation will be centered within the sky background
  },
  kawaiText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  kawaiSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  primaryActionDark: {
    backgroundColor: '#2d2d2d',
    borderColor: '#6b7280',
  },
  actionButtonTitleDark: {
    color: '#6B7280',
  },
  creditsSection: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 20,
  },
  creditsSectionDark: {
    // No border styling needed
  },
  creditsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 40,
  },
  creditsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  creditItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  creditItemDark: {
    backgroundColor: '#2d2d2d',
    borderColor: '#374151',
  },
  creditText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});
