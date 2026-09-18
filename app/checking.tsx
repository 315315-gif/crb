import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

const BEIGE = '#F5F0E8';
const ACCENT = '#2E6B9E';
const TEXT = '#2C2416';
const MUTED = '#8A7F6E';

export default function CheckingScreen() {
  const router = useRouter();
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const dotOpacity1 = useRef(new Animated.Value(1)).current;
  const dotOpacity2 = useRef(new Animated.Value(0.4)).current;
  const dotOpacity3 = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    // Spinner rotation
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse glow ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.12,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress bar fill over 5 seconds
    Animated.timing(progress, {
      toValue: 1,
      duration: 5000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    // Dot loading animation
    const dotAnim = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(dotOpacity1, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dotOpacity2, { toValue: 0.4, duration: 300, useNativeDriver: true }),
          Animated.timing(dotOpacity3, { toValue: 0.2, duration: 300, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(dotOpacity1, { toValue: 0.4, duration: 300, useNativeDriver: true }),
          Animated.timing(dotOpacity2, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dotOpacity3, { toValue: 0.4, duration: 300, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(dotOpacity1, { toValue: 0.2, duration: 300, useNativeDriver: true }),
          Animated.timing(dotOpacity2, { toValue: 0.4, duration: 300, useNativeDriver: true }),
          Animated.timing(dotOpacity3, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
      ])
    );
    dotAnim.start();

    // Navigate after 5 seconds
    const timer = setTimeout(() => {
      router.replace('/result');
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Spinner section */}
        <View style={styles.spinnerSection}>
          {/* Outer glow ring */}
          <Animated.View
            style={[styles.glowRing, { transform: [{ scale: pulse }] }]}
          />

          {/* Track ring */}
          <View style={styles.trackRing} />

          {/* Spinner arc */}
          <Animated.View
            style={[styles.spinnerArc, { transform: [{ rotate: spin }] }]}
          >
            <View style={styles.arcDot} />
          </Animated.View>

          {/* Center content */}
          <View style={styles.spinnerCenter}>
            <Text style={styles.spinnerIcon}>CRB</Text>
          </View>
        </View>

        {/* Text content */}
        <Text style={styles.mainText}>Checking from Database...</Text>

        {/* Animated dots */}
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { opacity: dotOpacity1 }]} />
          <Animated.View style={[styles.dot, { opacity: dotOpacity2 }]} />
          <Animated.View style={[styles.dot, { opacity: dotOpacity3 }]} />
        </View>

        <Text style={styles.patientText}>
          Please stay patient while we securely{'\n'}retrieve your credit status from database
        </Text>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        {/* Steps */}
        <View style={styles.stepsBox}>
          {[
            'Verifying your identity',
            'Connecting to CRB database',
            'Fetching credit report',
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BEIGE },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'android' ? 32 : 0,
  },

  // Spinner
  spinnerSection: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  glowRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: ACCENT + '14',
  },
  trackRing: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 6,
    borderColor: ACCENT + '20',
  },
  spinnerArc: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 6,
    borderColor: 'transparent',
    borderTopColor: ACCENT,
    borderRightColor: ACCENT + '60',
  },
  arcDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: ACCENT,
  },
  spinnerCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  spinnerIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: ACCENT,
    letterSpacing: 1,
  },

  // Text
  mainText: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
  },
  patientText: {
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },

  // Progress bar
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: ACCENT + '20',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 32,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 3,
  },

  // Steps
  stepsBox: {
    width: '100%',
    backgroundColor: '#FFFDF7',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#D9CFC0',
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: ACCENT + '18',
    borderWidth: 1.5,
    borderColor: ACCENT + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontSize: 12, fontWeight: '800', color: ACCENT },
  stepText: { fontSize: 13, color: MUTED, fontWeight: '500' },
});
