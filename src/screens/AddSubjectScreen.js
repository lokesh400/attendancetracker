import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAttendance } from '../context/AttendanceContext';
import { colors } from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';
import SectionCard from '../components/SectionCard';
import { clampNumber, DEFAULT_ATTENDANCE_PER_CLASS } from '../utils/attendance';

export default function AddSubjectScreen({ navigation }) {
  const { addSubject } = useAttendance();
  const [subjectName, setSubjectName] = useState('');
  const [attendanceInput, setAttendanceInput] = useState(
    String(DEFAULT_ATTENDANCE_PER_CLASS)
  );

  const handleAdd = () => {
    const perClassValue = clampNumber(Number(attendanceInput), 1, 20);
    const newId = addSubject({
      name: subjectName,
      attendancePerClass: perClassValue,
    });
    if (newId) {
      setSubjectName('');
      setAttendanceInput(String(DEFAULT_ATTENDANCE_PER_CLASS));
      navigation.replace('SubjectDetail', { subjectId: newId });
    }
  };

  const showAttendanceStep = subjectName.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <SectionCard title="Subject Details">
          <TextInput
            value={subjectName}
            onChangeText={setSubjectName}
            placeholder="Subject name"
            placeholderTextColor="#7b7b7b"
            style={styles.input}
          />
          {showAttendanceStep ? (
            <View>
              <Text style={styles.stepTitle}>Attendance per class</Text>
              <Text style={styles.helperText}>
                Example: Lab has 2 attendance, Workshop has 6 attendance.
              </Text>
              <TextInput
                value={attendanceInput}
                onChangeText={setAttendanceInput}
                keyboardType="numeric"
                style={styles.input}
              />
              <PrimaryButton label="Create Subject" onPress={handleAdd} />
            </View>
          ) : (
            <Text style={styles.helperText}>
              Enter a subject name to set attendance per class.
            </Text>
          )}
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
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
});
