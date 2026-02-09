import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAttendance } from '../context/AttendanceContext';
import { colors } from '../theme/colors';
import { formatPercent } from '../utils/attendance';
import PrimaryButton from '../components/PrimaryButton';
import ProgressRing from '../components/ProgressRing';
import SectionCard from '../components/SectionCard';
import SubjectCard from '../components/SubjectCard';

export default function HomeScreen({ navigation }) {
  const { subjects, totals, setActiveSubjectId } = useAttendance();

  const aggregateTotals = subjects.reduce(
    (acc, subject) => {
      const summary = totals[subject.id] || { present: 0, absent: 0, total: 0 };
      acc.present += summary.present;
      acc.absent += summary.absent;
      acc.total += summary.total;
      return acc;
    },
    { present: 0, absent: 0, total: 0 }
  );
  const aggregatePercent = aggregateTotals.total
    ? aggregateTotals.present / aggregateTotals.total
    : 0;
  const aggregateLabel = formatPercent(aggregateTotals.present, aggregateTotals.total);

  const handleOpenSubject = (subjectId) => {
    setActiveSubjectId(subjectId);
    navigation.navigate('SubjectDetail', { subjectId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        <SectionCard title="Overall Attendance">
          <View style={styles.aggregateRow}>
            <ProgressRing progress={aggregatePercent} label="All Subjects" />
            <View style={styles.aggregateStats}>
              <Text style={styles.statLabel}>Total classes held</Text>
              <Text style={styles.statValue}>{aggregateTotals.total}</Text>
              <Text style={styles.statLabel}>Total attended</Text>
              <Text style={styles.statValue}>{aggregateTotals.present}</Text>
              <Text style={styles.statLabel}>Total absent</Text>
              <Text style={styles.statValue}>{aggregateTotals.absent}</Text>
              <Text style={styles.statMeta}>{aggregateLabel} overall</Text>
            </View>
          </View>
        </SectionCard>

        <SectionCard title="Quick Actions">
          <PrimaryButton
            label="Add New Subject"
            onPress={() => navigation.navigate('AddSubject')}
          />
        </SectionCard>

        <SectionCard title="Subjects">
          {subjects.length === 0 ? (
            <Text style={styles.muted}>No subjects yet. Add your first one.</Text>
          ) : (
            <View>
              {subjects.map((subject) => {
                const summary = totals[subject.id] || { present: 0, absent: 0, total: 0 };
                const percentLabel = formatPercent(summary.present, summary.total);
                return (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    summary={summary}
                    percentLabel={percentLabel}
                    isActive={false}
                    onPress={() => handleOpenSubject(subject.id)}
                  />
                );
              })}
            </View>
          )}
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 18,
  },
  muted: {
    color: colors.textMuted,
  },
  aggregateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  aggregateStats: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
  },
});
