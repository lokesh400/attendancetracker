import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { getSessionLabel, STATUS_LABELS } from '../utils/attendance';

export default function LogItem({ log, sessionWeights, onEdit, onDelete }) {
  const timeLabel = new Date(log.timestamp).toLocaleTimeString();

  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.title}>
          {STATUS_LABELS[log.status]} - {getSessionLabel(log.type, sessionWeights)}
        </Text>
        <Text style={styles.meta}>{timeLabel}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.weight}>+{log.weight}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
            <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.logBorder,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2b2620',
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  weight: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.neutral,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3c362f',
  },
  deleteButton: {
    backgroundColor: colors.dangerBg,
  },
  deleteText: {
    color: colors.dangerText,
  },
});
