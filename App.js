import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AttendanceContext } from './src/context/AttendanceContext';
import { loadAttendanceState, saveAttendanceState } from './src/storage/attendanceStorage';
import { colors } from './src/theme/colors';
import {
  computeTotals,
  DEFAULT_ATTENDANCE_PER_CLASS,
  generateId,
  getSubjectTotals,
} from './src/utils/attendance';
import AddSubjectScreen from './src/screens/AddSubjectScreen';
import HomeScreen from './src/screens/HomeScreen';
import SubjectDetailScreen from './src/screens/SubjectDetailScreen';
import SubjectEditScreen from './src/screens/SubjectEditScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [subjects, setSubjects] = useState([]);
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      const stored = await loadAttendanceState();
      setSubjects(stored.subjects);
      setActiveSubjectId(stored.activeSubjectId);
      setIsHydrated(true);
    };

    hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveAttendanceState({ subjects, activeSubjectId }).catch(() => undefined);
  }, [subjects, activeSubjectId, isHydrated]);

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
        const totals = getSubjectTotals(subject);
        const totalClasses = totals.total + 1;
        const attendedClasses = totals.present + (wasPresent ? 1 : 0);
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

  const contextValue = {
    subjects,
    totals,
    activeSubjectId,
    setActiveSubjectId,
    addSubject,
    updateSubject,
    markAttendance,
    deleteSubject,
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
