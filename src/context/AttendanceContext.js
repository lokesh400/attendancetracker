import { createContext, useContext } from 'react';

export const AttendanceContext = createContext(null);

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within AttendanceContext provider');
  }
  return context;
};
