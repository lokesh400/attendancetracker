import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDateKey = (date) => date.toISOString().split('T')[0];

const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

export default function CalendarMonth({
  monthDate,
  markedDates,
  selectedDate,
  onSelectDate,
  onChangeMonth,
}) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysInMonth = getDaysInMonth(monthDate);
  const firstDay = new Date(year, month, 1).getDay();
  const todayKey = formatDateKey(new Date());

  const rows = [];
  let dayCounter = 1 - firstDay;

  for (let week = 0; week < 6; week += 1) {
    const cells = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const currentDate = new Date(year, month, dayCounter);
      const currentKey = formatDateKey(currentDate);
      const isCurrentMonth = dayCounter >= 1 && dayCounter <= daysInMonth;
      const isSelected = selectedDate === currentKey;
      const hasLog = isCurrentMonth && markedDates[currentKey] > 0;
      const isToday = currentKey === todayKey;

      cells.push(
        <TouchableOpacity
          key={`${week}-${dayIndex}`}
          style={[
            styles.cell,
            !isCurrentMonth && styles.cellMuted,
            isSelected && styles.cellSelected,
          ]}
          onPress={() => onSelectDate(currentKey)}
          disabled={!isCurrentMonth}
        >
          <Text style={[styles.cellText, !isCurrentMonth && styles.cellTextMuted]}>
            {currentDate.getDate()}
          </Text>
          {hasLog ? <View style={styles.dot} /> : null}
          {isToday && isCurrentMonth ? <View style={styles.todayRing} /> : null}
        </TouchableOpacity>
      );
      dayCounter += 1;
    }
    rows.push(
      <View style={styles.weekRow} key={`week-${week}`}>
        {cells}
      </View>
    );
  }

  const monthLabel = monthDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => onChangeMonth(-1)}
        >
          <Text style={styles.monthButtonText}>Prev</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => onChangeMonth(1)}
        >
          <Text style={styles.monthButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.weekRow}>
        {WEEK_DAYS.map((day) => (
          <Text key={day} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>
      {rows}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  monthButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.neutral,
  },
  monthButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3c362f',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginBottom: 6,
    position: 'relative',
  },
  cellMuted: {
    opacity: 0.35,
  },
  cellSelected: {
    backgroundColor: colors.chipActive,
  },
  cellText: {
    fontSize: 12,
    color: colors.text,
  },
  cellTextMuted: {
    color: colors.textMuted,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 4,
  },
  todayRing: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.accent,
  },
});
