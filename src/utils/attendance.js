export const SESSION_LABELS = {
  lecture: 'Lecture',
  lab: 'Lab',
  workshop: 'Workshop',
};

export const STATUS_LABELS = {
  present: 'Present',
  absent: 'Absent',
};

export const generateId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const DEFAULT_ATTENDANCE_PER_CLASS = 1;

export const formatPercent = (present, total) => {
  if (!total) return '0%';
  return `${((present / total) * 100).toFixed(1)}%`;
};

export const computeTotals = (subjects) => {
  return subjects.reduce((acc, subject) => {
    acc[subject.id] = getSubjectTotals(subject);
    return acc;
  }, {});
};

export const groupLogsByDate = (logs) => {
  const groups = {};
  logs.forEach((log) => {
    const dateKey = log.timestamp.split('T')[0];
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(log);
  });

  return Object.keys(groups)
    .sort((a, b) => (a > b ? -1 : 1))
    .map((dateKey) => ({
      dateKey,
      logs: groups[dateKey].sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1)),
    }));
};

export const clampNumber = (value, min, max) => {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
};

export const getSubjectTotals = (subject) => {
  const totalFromSubject = Number.isFinite(subject.totalClasses)
    ? subject.totalClasses
    : null;
  const attendedFromSubject = Number.isFinite(subject.attendedClasses)
    ? subject.attendedClasses
    : null;

  if (totalFromSubject !== null && attendedFromSubject !== null) {
    const total = Math.max(0, totalFromSubject);
    const present = Math.min(Math.max(0, attendedFromSubject), total);
    const absent = Math.max(0, total - present);
    return { present, absent, total };
  }

  const logs = Array.isArray(subject.logs) ? subject.logs : [];
  const total = logs.length;
  const present = logs.filter((log) => log.status === 'present').length;
  const absent = Math.max(0, total - present);
  return { present, absent, total };
};
