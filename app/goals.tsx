import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

// ─── Constants ───────────────────────────────────────────────────────────────
const BEIGE = '#F5F0E8';
const CARD = '#FFFDF7';
const ACCENT = '#2E6B9E';
const BORDER = '#D9CFC0';
const TEXT = '#2C2416';
const MUTED = '#8A7F6E';

type Goal = {
  id: string;
  label: string;
  description: string;
  color: string;
  abbr: string;
};

const GOALS: Goal[] = [
  {
    id: 'credit_loans',
    label: 'Credit and Loans',
    description: 'Check eligibility for credit facilities',
    color: '#2E6B9E',
    abbr: 'CL',
  },
  {
    id: 'business_loans',
    label: 'Business Loans',
    description: 'Apply for business financing',
    color: '#27AE60',
    abbr: 'BL',
  },
  {
    id: 'personal_review',
    label: 'Personal Review',
    description: 'Review your personal credit standing',
    color: '#8E44AD',
    abbr: 'PR',
  },
  {
    id: 'employment',
    label: 'Employment',
    description: 'Required for job applications',
    color: '#D4A017',
    abbr: 'EM',
  },
  {
    id: 'mortgages',
    label: 'Mortgages',
    description: 'Apply for a home mortgage',
    color: '#C0392B',
    abbr: 'MO',
  },
  {
    id: 'property_leases',
    label: 'Property Leases',
    description: 'Qualify for property rental',
    color: '#16A085',
    abbr: 'PL',
  },
];

export default function GoalsScreen() {
  const params = useLocalSearchParams<{
    firstName?: string;
    lastName?: string;
    idNumber?: string;
    email?: string;
    phone?: string;
  }>();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const canContinue = selected.length > 0;

  const handleContinue = () => {
    router.push({
      pathname: '/profile-check',
      params: {
        firstName: params.firstName ?? '',
        lastName: params.lastName ?? '',
        idNumber: params.idNumber ?? '',
        email: params.email ?? '',
        phone: params.phone ?? '',
        goals: selected.join(','),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotDone]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
        </View>
        <Text style={styles.greeting}>
          Hello, {params.firstName || 'there'}
        </Text>
        <Text style={styles.subtitle}>
          Select one or more reasons for checking{'\n'}your credit status
        </Text>
      </View>

      {/* Goal cards */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {GOALS.map((goal) => {
          const isSelected = selected.includes(goal.id);
          return (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.card,
                { borderTopColor: goal.color },
                isSelected && styles.cardSelected,
              ]}
              onPress={() => toggle(goal.id)}
              activeOpacity={0.75}
            >
              {/* Selected badge */}
              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: goal.color }]}>
                  <Text style={styles.checkBadgeText}>✓</Text>
                </View>
              )}

              {/* Abbreviation circle */}
              <View
                style={[
                  styles.abbrCircle,
                  {
                    backgroundColor: goal.color + '18',
                    borderColor: goal.color + '50',
                  },
                ]}
              >
                <Text style={[styles.abbrText, { color: goal.color }]}>
                  {goal.abbr}
                </Text>
              </View>

              <Text style={styles.cardLabel}>{goal.label}</Text>
              <Text style={styles.cardDesc}>{goal.description}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {selected.length > 0 && (
          <Text style={styles.selectedCount}>
            {selected.length} reason{selected.length > 1 ? 's' : ''} selected
          </Text>
        )}
        <TouchableOpacity
          style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
          activeOpacity={0.85}
        >
          <Text style={[styles.continueBtnText, !canContinue && styles.continueBtnTextDisabled]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BEIGE },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 16,
    paddingBottom: 20,
    backgroundColor: BEIGE,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BORDER,
    borderWidth: 2,
    borderColor: BORDER,
  },
  stepDotActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepDotDone: { backgroundColor: '#27AE60', borderColor: '#27AE60' },
  stepLine: { flex: 1, height: 2, backgroundColor: BORDER, marginHorizontal: 4 },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: MUTED,
    lineHeight: 21,
  },

  // Grid
  scroll: { flex: 1 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    paddingTop: 8,
  },

  // Card
  card: {
    width: '47%',
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    borderTopWidth: 4,
    borderWidth: 1.5,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    position: 'relative',
    minHeight: 140,
    justifyContent: 'flex-end',
  },
  cardSelected: {
    borderColor: '#2E6B9E',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: '#F0F7FF',
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  abbrCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  abbrText: { fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  cardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 4,
    lineHeight: 18,
  },
  cardDesc: { fontSize: 11, color: MUTED, lineHeight: 16 },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 12,
    backgroundColor: BEIGE,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  selectedCount: {
    textAlign: 'center',
    fontSize: 13,
    color: ACCENT,
    fontWeight: '600',
    marginBottom: 10,
  },
  continueBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: ACCENT,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  continueBtnDisabled: {
    backgroundColor: '#C8C0B4',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  continueBtnTextDisabled: { color: '#F0EDE8' },
});
