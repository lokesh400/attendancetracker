import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

export default function SubjectCard({ subject, summary, percentLabel, isActive, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, isActive && styles.cardActive]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={[styles.name, isActive && styles.nameActive]}>{subject.name}</Text>
        <Text style={[styles.total, isActive && styles.nameActive]}>
          {summary.present}/{summary.total}
        </Text>
      </View>
      <Text style={styles.meta}>
        Present {summary.present} | Absent {summary.absent}
      </Text>
      <Text style={styles.meta}>
        {percentLabel} | Per class {subject.attendancePerClass ?? 1}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.logBorder,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    backgroundColor: colors.chip,
  },
  cardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.chipActive,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2b2620',
  },
  nameActive: {
    color: '#1f3a2a',
  },
  total: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2b2620',
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
});
