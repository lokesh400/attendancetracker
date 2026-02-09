import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAttendance } from '../context/AttendanceContext';
import { colors } from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import SectionCard from '../components/SectionCard';
import {
  clampNumber,
  DEFAULT_ATTENDANCE_PER_CLASS,
  getSubjectTotals,
} from '../utils/attendance';

export default function SubjectEditScreen({ navigation, route }) {
  const { subjectId } = route.params;
  const { subjects, updateSubject, deleteSubject } = useAttendance();
  const subject = subjects.find((item) => item.id === subjectId);

  const [nameInput, setNameInput] = useState('');
  const [attendanceInput, setAttendanceInput] = useState(
    String(DEFAULT_ATTENDANCE_PER_CLASS)
  );
  const [totalClassesInput, setTotalClassesInput] = useState('0');
  const [attendedClassesInput, setAttendedClassesInput] = useState('0');

  useEffect(() => {
    if (!subject) return;
    const totals = getSubjectTotals(subject);
    setNameInput(subject.name);
    setAttendanceInput(
      String(subject.attendancePerClass ?? DEFAULT_ATTENDANCE_PER_CLASS)
    );
    setTotalClassesInput(String(totals.total));
    setAttendedClassesInput(String(totals.present));
  }, [subject]);

  if (!subject) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Subject Not Found</Text>
          <SecondaryButton label="Back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const perClassValue = clampNumber(Number(attendanceInput), 1, 20);
    const totalClassesValue = clampNumber(Number(totalClassesInput), 0, 5000);
    const attendedClassesValue = clampNumber(Number(attendedClassesInput), 0, 5000);
    const safeAttended = Math.min(attendedClassesValue, totalClassesValue);

    updateSubject(subject.id, {
      name: trimmed,
      attendancePerClass: perClassValue,
      totalClasses: totalClassesValue,
      attendedClasses: safeAttended,
    });
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Subject',
      'This will remove the subject and all its attendance logs. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSubject(subject.id);
            navigation.popToTop();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <SectionCard title="Subject Settings">
          <TextInput
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Subject name"
            placeholderTextColor="#7b7b7b"
            style={styles.input}
          />
          <Text style={styles.helperText}>
            Example: Lab has 2 attendance, Workshop has 6 attendance.
          </Text>
          <View style={styles.row}>
            <View style={styles.fieldWide}>
              <Text style={styles.label}>Attendance per class</Text>
              <TextInput
                value={attendanceInput}
                onChangeText={setAttendanceInput}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>Total classes held</Text>
              <TextInput
                value={totalClassesInput}
                onChangeText={setTotalClassesInput}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Total attended</Text>
              <TextInput
                value={attendedClassesInput}
                onChangeText={setAttendedClassesInput}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </View>
          <PrimaryButton label="Save Changes" onPress={handleSave} />
          <SecondaryButton
            label="Delete Subject"
            onPress={handleDelete}
            style={styles.deleteButton}
            textStyle={styles.deleteText}
          />
        </SectionCard>
      </View>
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
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  field: {
    flex: 1,
  },
  fieldWide: {
    flex: 1,
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: colors.dangerBg,
  },
  deleteText: {
    color: colors.dangerText,
  },
});
