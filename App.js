import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AttendanceContext } from './src/context/AttendanceContext';
import { loadAttendanceState, saveAttendanceState } from './src/storage/attendanceStorage';
import { colors } from './src/theme/colors';
import {
  computeTotals,
  DEFAULT_ATTENDANCE_PER_CLASS,
  generateId,
} from './src/utils/attendance';
import AddSubjectScreen from './src/screens/AddSubjectScreen';
import HomeScreen from './src/screens/HomeScreen';
import SubjectDetailScreen from './src/screens/SubjectDetailScreen';
import SubjectEditScreen from './src/screens/SubjectEditScreen';
import TaskScreen from './src/screens/TaskScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [subjects, setSubjects] = useState([]);
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      const stored = await loadAttendanceState();
      setSubjects(stored.subjects);
      setActiveSubjectId(stored.activeSubjectId);
      setTasks(stored.tasks ?? []);
      setIsHydrated(true);
    };

    hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveAttendanceState({ subjects, activeSubjectId, tasks }).catch(() => undefined);
  }, [subjects, activeSubjectId, tasks, isHydrated]);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const setupNotifications = async () => {
      if (Platform.OS === 'web') return;
      const settings = await Notifications.getPermissionsAsync();
      if (settings.status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('tasks', {
          name: 'Tasks',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: 'default',
        });
      }
    };

    setupNotifications();
  }, []);

  const totals = useMemo(() => computeTotals(subjects), [subjects]);

  const addSubject = (payload) => {
    const trimmed = payload.name.trim();
    if (!trimmed) return null;
    const id = generateId();
    const newSubject = {
      id,
      name: trimmed,
      attendancePerClass: payload.attendancePerClass ?? DEFAULT_ATTENDANCE_PER_CLASS,
      totalClasses: 0,
      attendedClasses: 0,
      logs: [],
    };
    setSubjects((prev) => [newSubject, ...prev]);
    setActiveSubjectId(id);
    return id;
  };

  const updateSubject = (subjectId, patch) => {
    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === subjectId ? { ...subject, ...patch } : subject
      )
    );
  };

  const markAttendance = (subjectId, wasPresent) => {
    setSubjects((prev) =>
      prev.map((subject) => {
        if (subject.id !== subjectId) return subject;
        const existingTotalClasses = Number.isFinite(subject.totalClasses)
          ? subject.totalClasses
          : Array.isArray(subject.logs)
            ? subject.logs.length
            : 0;
        const existingAttendedClasses = Number.isFinite(subject.attendedClasses)
          ? subject.attendedClasses
          : Array.isArray(subject.logs)
            ? subject.logs.filter((log) => log.status === 'present').length
            : 0;
        const totalClasses = existingTotalClasses + 1;
        const attendedClasses = existingAttendedClasses + (wasPresent ? 1 : 0);
        const newLog = {
          id: generateId(),
          status: wasPresent ? 'present' : 'absent',
          timestamp: new Date().toISOString(),
          classNumber: totalClasses,
        };
        return {
          ...subject,
          totalClasses,
          attendedClasses,
          logs: [newLog, ...(subject.logs || [])],
        };
      })
    );
  };

  const deleteSubject = (subjectId) => {
    setSubjects((prev) => prev.filter((subject) => subject.id !== subjectId));
    setActiveSubjectId((current) => (current === subjectId ? null : current));
  };

  const addTask = async (payload) => {
    const title = payload.title.trim();
    if (!title) return null;

    const scheduledAt = payload.scheduledAt;
    let notificationId = null;
    if (scheduledAt && Platform.OS !== 'web') {
      try {
        const settings = await Notifications.getPermissionsAsync();
        if (settings.status === 'granted') {
          notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Task Reminder',
              body: payload.notes ? `${title} - ${payload.notes}` : title,
              sound: 'default',
              channelId: 'tasks',
            },
            trigger: scheduledAt,
          });
        }
      } catch (error) {
        notificationId = null;
      }
    }

    const task = {
      id: generateId(),
      title,
      notes: payload.notes || '',
      date: payload.date,
      time: payload.time,
      scheduledAt: scheduledAt ? scheduledAt.toISOString() : null,
      notificationId,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [task, ...prev]);
    return task.id;
  };

  const contextValue = {
    subjects,
    totals,
    activeSubjectId,
    setActiveSubjectId,
    addSubject,
    updateSubject,
    markAttendance,
    deleteSubject,
    tasks,
    addTask,
  };

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <AttendanceContext.Provider value={contextValue}>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
            headerTitleStyle: { color: colors.text },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Attendance Tracker' }} />
          <Stack.Screen
            name="AddSubject"
            component={AddSubjectScreen}
            options={{ title: 'Add Subject' }}
          />
          <Stack.Screen
            name="SubjectDetail"
            component={SubjectDetailScreen}
            options={{ title: 'Subject Detail' }}
          />
          <Stack.Screen
            name="SubjectEdit"
            component={SubjectEditScreen}
            options={{ title: 'Edit Subject' }}
          />
          <Stack.Screen name="Tasks" component={TaskScreen} options={{ title: 'Tasks' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AttendanceContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
