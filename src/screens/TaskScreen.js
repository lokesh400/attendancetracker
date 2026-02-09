import React, { useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAttendance } from '../context/AttendanceContext';
import { colors } from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';
import SectionCard from '../components/SectionCard';

const formatDate = (value) => {
  if (!value) return 'Select date';
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTime = (value) => {
  if (!value) return 'Select time';
  const hour = String(value.getHours()).padStart(2, '0');
  const minute = String(value.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
};

export default function TaskScreen() {
  const { tasks, addTask } = useAttendance();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dateValue, setDateValue] = useState(null);
  const [timeValue, setTimeValue] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState('');

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
      const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
      return aTime - bTime;
    });
  }, [tasks]);

  const handleAddTask = async () => {
    setError('');
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please enter a task title.');
      return;
    }

    if (!dateValue || !timeValue) {
      setError('Please select a date and time.');
      return;
    }

    const scheduledAt = new Date(
      dateValue.getFullYear(),
      dateValue.getMonth(),
      dateValue.getDate(),
      timeValue.getHours(),
      timeValue.getMinutes(),
      0,
      0
    );

    if (scheduledAt.getTime() <= Date.now()) {
      setError('Choose a future date and time.');
      return;
    }

    const createdId = await addTask({
      title: trimmedTitle,
      notes: notes.trim(),
      date: formatDate(dateValue),
      time: formatTime(timeValue),
      scheduledAt,
    });

    if (createdId) {
      setTitle('');
      setNotes('');
      setDateValue(null);
      setTimeValue(null);
      setError('');
    }
  };

  const handleDateChange = (event, selected) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
    if (event?.type === 'dismissed') return;
    if (selected) setDateValue(selected);
  };

  const handleTimeChange = (event, selected) => {
    if (Platform.OS !== 'ios') {
      setShowTimePicker(false);
    }
    if (event?.type === 'dismissed') return;
    if (selected) setTimeValue(selected);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionCard title="Add Task">
          <Text style={styles.label}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Homework, quiz, submission"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
          <Text style={styles.label}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional notes"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.notesInput]}
            multiline
          />
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.pickerText}>{formatDate(dateValue)}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Time</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.pickerText}>{formatTime(timeValue)}</Text>
              </TouchableOpacity>
            </View>
          </View>
          {showDatePicker ? (
            <DateTimePicker
              value={dateValue || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          ) : null}
          {showTimePicker ? (
            <DateTimePicker
              value={timeValue || new Date()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton label="Add Task" onPress={handleAddTask} />
          <Text style={styles.helper}>Reminders use your device local time.</Text>
        </SectionCard>

        <SectionCard title="Upcoming Tasks">
          {sortedTasks.length === 0 ? (
            <Text style={styles.muted}>No tasks yet. Add your first reminder.</Text>
          ) : (
            sortedTasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskMeta}>
                  {task.date} at {task.time}
                </Text>
                {task.notes ? <Text style={styles.taskNotes}>{task.notes}</Text> : null}
              </View>
            ))
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
  label: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 6,
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
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    flex: 1,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.card,
    marginBottom: 12,
  },
  pickerText: {
    fontSize: 15,
    color: colors.text,
  },
  helper: {
    marginTop: 10,
    fontSize: 12,
    color: colors.textMuted,
  },
  error: {
    color: colors.dangerText,
    marginBottom: 10,
  },
  muted: {
    color: colors.textMuted,
  },
  taskItem: {
    borderWidth: 1,
    borderColor: colors.logBorder,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: colors.chip,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  taskMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  taskNotes: {
    fontSize: 12,
    color: colors.text,
    marginTop: 6,
  },
});
