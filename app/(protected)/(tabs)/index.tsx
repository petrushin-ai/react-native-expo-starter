import Ionicons from '@expo/vector-icons/Ionicons';
import { useDrawerStatus } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import { BurgerMenuButton } from '@/components/ui/BurgerMenuButton';
import { LottieAnimation } from '@/components/ui/LottieAnimation';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  const navigation = useNavigation();
  const drawerStatus = useDrawerStatus();
  const isDrawerOpen = drawerStatus === 'open';
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // State for pull-to-refresh and wave animation
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [waveAnimationTrigger, setWaveAnimationTrigger] = useState(0);

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

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    // Trigger wave animation
    setWaveAnimationTrigger(prev => prev + 1);

    // Simulate loading delay (like fetching fresh data)
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsRefreshing(false);
  }, []);

  return (
    <>
      <ScrollView
        style={[styles.container, isDark && styles.containerDark]}
        contentContainerStyle={styles.scrollContent}
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
              <HelloWave />
            </View>
            <Text style={[styles.subtitle, isDark && styles.textDark]}>
              Your modern React Native app is ready to go. Explore the features and start building something amazing!
            </Text>
          </View>

          {/* Quick Actions Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
              Quick Actions
            </Text>

            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction]}
              onPress={handleNavigateToCharts}
            >
              <View style={styles.actionButtonContent}>
                <Ionicons name="bar-chart" size={24} color="#fff" />
                <View style={styles.actionButtonText}>
                  <Text style={styles.actionButtonTitle}>Explore Charts</Text>
                  <Text style={styles.actionButtonDescription}>
                    View beautiful data visualizations and chart components
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

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
          <View style={[styles.kawaiSection, isDark && styles.kawaiSectionDark]}>
            <LottieAnimation
              source={require('@/assets/lottie/splash.lottie')}
              autoPlay
              loop
              size="medium"
              style={styles.kittyAnimation}
            />
            <Text style={[styles.kawaiText, isDark && styles.textDark]}>
              頑張って！ (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧
            </Text>
            <Text style={[styles.kawaiSubtext, isDark && styles.textDark]}>
              Ganbatte! You're doing great, keep coding! 🐱✨
            </Text>
          </View>
        </View>
      </ScrollView>

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
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  secondaryAction: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  secondaryActionDark: {
    borderColor: '#374151',
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
    color: '#fff',
    marginBottom: 4,
  },
  actionButtonTitleSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 4,
  },
  actionButtonTitleSecondaryDark: {
    color: '#6B7280',
  },
  actionButtonDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
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
  kawaiSection: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 0,
    backgroundColor: 'transparent',
  },
  kawaiSectionDark: {
    backgroundColor: 'transparent',
  },
  kittyAnimation: {
    marginBottom: 16,
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
});
