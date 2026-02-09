import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'attendance-tracker-state-v1';

const emptyState = {
  subjects: [],
  activeSubjectId: null,
};

export const loadAttendanceState = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return emptyState;

    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return { ...emptyState, subjects: parsed };
    }
    if (parsed && Array.isArray(parsed.subjects)) {
      return {
        subjects: parsed.subjects,
        activeSubjectId: parsed.activeSubjectId ?? null,
      };
    }
  } catch (error) {
    return emptyState;
  }

  return emptyState;
};

export const saveAttendanceState = async (state) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
