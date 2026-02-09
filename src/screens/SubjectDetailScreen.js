import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAttendance } from '../context/AttendanceContext';
import { colors } from '../theme/colors';
import {
  DEFAULT_ATTENDANCE_PER_CLASS,
  formatPercent,
  getSubjectTotals,
  groupLogsByDate,
  STATUS_LABELS,
} from '../utils/attendance';
import ConfirmSheet from '../components/ConfirmSheet';
import PrimaryButton from '../components/PrimaryButton';
import ProgressRing from '../components/ProgressRing';
import SectionCard from '../components/SectionCard';
import SecondaryButton from '../components/SecondaryButton';

export default function SubjectDetailScreen({ navigation, route }) {
  const { subjectId } = route.params;
  const { subjects, totals, markAttendance, setActiveSubjectId } = useAttendance();
  const subject = subjects.find((item) => item.id === subjectId);

  const [confirmType, setConfirmType] = useState(null);
  const [confirmMeta, setConfirmMeta] = useState(null);

  const summary = useMemo(() => {
    if (!subject) return { present: 0, absent: 0, total: 0 };
    return totals[subjectId] || getSubjectTotals(subject);
  }, [subject, totals, subjectId]);

  useEffect(() => {
    setActiveSubjectId(subjectId);
  }, [subjectId, setActiveSubjectId]);

  if (!subject) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Subject Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const percentValue = summary.total ? summary.present / summary.total : 0;
  const percentLabel = formatPercent(summary.present, summary.total);
  const attendancePerClass = subject.attendancePerClass ?? DEFAULT_ATTENDANCE_PER_CLASS;

  const openConfirm = (type) => {
    const classNumber = summary.total + 1;
    const now = new Date();
    setConfirmMeta({
      classNumber,
      timestamp: now,
    });
    setConfirmType(type);
  };
  const closeConfirm = () => {
    setConfirmType(null);
    setConfirmMeta(null);
  };

  const handleConfirm = () => {
    if (!confirmType) return;
    markAttendance(subject.id, confirmType === 'present');
    closeConfirm();
  };

  const confirmTitle = confirmType === 'present' ? 'Mark Present' : 'Mark Absent';
  const confirmMessage = confirmMeta
    ? `Class #${confirmMeta.classNumber} at ${confirmMeta.timestamp.toLocaleString()}.`
    : '';

  const historyGroups = useMemo(() => {
    return groupLogsByDate(subject.logs || []);
  }, [subject.logs]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{subject.name}</Text>

        <SectionCard title="Overview">
          <View style={styles.overviewRow}>
            <ProgressRing progress={percentValue} label="Attendance" />
            <View style={styles.overviewStats}>
              <Text style={styles.statLabel}>Attendance per class</Text>
              <Text style={styles.statValue}>{attendancePerClass}</Text>
              <Text style={styles.statLabel}>Total attendance</Text>
              <Text style={styles.statValue}>{summary.total}</Text>
              <Text style={styles.statLabel}>Total attended</Text>
              <Text style={styles.statValue}>{summary.present}</Text>
              <Text style={styles.statLabel}>Total absent</Text>
              <Text style={styles.statValue}>{summary.absent}</Text>
              <Text style={styles.statMeta}>{percentLabel} overall</Text>
            </View>
          </View>
          <View style={styles.actionRow}>
            <PrimaryButton label="Mark Present" onPress={() => openConfirm('present')} />
            <SecondaryButton label="Mark Absent" onPress={() => openConfirm('absent')} />
          </View>
          <SecondaryButton
            label="Edit Subject"
            onPress={() => navigation.navigate('SubjectEdit', { subjectId })}
            style={styles.editButton}
          />
        </SectionCard>

        <SectionCard title="History">
          {historyGroups.length === 0 ? (
            <Text style={styles.muted}>No history yet.</Text>
          ) : (
            historyGroups.map((group) => (
              <View key={group.dateKey} style={styles.historyGroup}>
                <Text style={styles.historyDate}>{group.dateKey}</Text>
                {group.logs.map((log) => {
                  const timeLabel = new Date(log.timestamp).toLocaleTimeString();
                  return (
                    <View key={log.id} style={styles.historyRow}>
                      <Text style={styles.historyTitle}>
                        {STATUS_LABELS[log.status]} - Class #{log.classNumber || '-'}
                      </Text>
                      <Text style={styles.historyTime}>{timeLabel}</Text>
                    </View>
                  );
                })}
              </View>
            ))
          )}
        </SectionCard>
      </ScrollView>

      <ConfirmSheet
        visible={Boolean(confirmType)}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirmType === 'present' ? 'Confirm Present' : 'Confirm Absent'}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
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
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 18,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  overviewStats: {
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
  actionRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    marginTop: 10,
  },
  muted: {
    color: colors.textMuted,
  },
  historyGroup: {
    marginBottom: 12,
  },
  historyDate: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  historyRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.logBorder,
  },
  historyTitle: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  historyTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
