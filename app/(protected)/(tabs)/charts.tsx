import { Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ChartsScreen() {
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
            headerImage={
                <IconSymbol
                    size={310}
                    color="#808080"
                    name="chart.bar.fill"
                    style={styles.headerImage}
                />
            }>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Charts</ThemedText>
            </ThemedView>
            <ThemedText>This section provides data visualization and chart components.</ThemedText>
            <Collapsible title="Chart Types">
                <ThemedText>
                    This app supports various chart types including:{' '}
                    <ThemedText type="defaultSemiBold">Bar Charts</ThemedText>,{' '}
                    <ThemedText type="defaultSemiBold">Line Charts</ThemedText>, and{' '}
                    <ThemedText type="defaultSemiBold">Pie Charts</ThemedText>
                </ThemedText>
                <ThemedText>
                    Chart components are located in{' '}
                    <ThemedText type="defaultSemiBold">components/charts/</ThemedText> directory.
                </ThemedText>
                <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/svg/">
                    <ThemedText type="link">Learn more about SVG in Expo</ThemedText>
                </ExternalLink>
            </Collapsible>
            <Collapsible title="Data Visualization">
                <ThemedText>
                    Charts are optimized for both mobile and web platforms with responsive design
                    and touch interactions.
                </ThemedText>
            </Collapsible>
            <Collapsible title="Interactive Charts">
                <ThemedText>
                    Charts support touch gestures, zoom, and pan interactions for better user experience.
                </ThemedText>
                <ExternalLink href="https://reactnative.dev/docs/panresponder">
                    <ThemedText type="link">Learn more about gestures</ThemedText>
                </ExternalLink>
            </Collapsible>
            <Collapsible title="Real-time Data">
                <ThemedText>
                    Charts can be updated in real-time using WebSocket connections or polling mechanisms.
                </ThemedText>
                <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/websockets/">
                    <ThemedText type="link">Learn more about WebSockets</ThemedText>
                </ExternalLink>
            </Collapsible>
            <Collapsible title="Chart Theming">
                <ThemedText>
                    Charts automatically adapt to light and dark mode themes. The{' '}
                    <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook ensures
                    consistent theming across all chart components.
                </ThemedText>
                <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
                    <ThemedText type="link">Learn more about theming</ThemedText>
                </ExternalLink>
            </Collapsible>
            <Collapsible title="Chart Animations">
                <ThemedText>
                    Charts include smooth animations powered by{' '}
                    <ThemedText type="defaultSemiBold">react-native-reanimated</ThemedText>{' '}
                    for enhanced user experience.
                </ThemedText>
                {Platform.select({
                    ios: (
                        <ThemedText>
                            Chart animations are optimized for iOS native performance with hardware acceleration.
                        </ThemedText>
                    ),
                })}
            </Collapsible>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        color: '#808080',
        bottom: -90,
        left: -35,
        position: 'absolute',
    },
    titleContainer: {
        flexDirection: 'row',
        gap: 8,
    },
}); 