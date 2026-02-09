import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

export default function ToggleGroup({ label, options, selectedKey, onSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const isSelected = option.key === selectedKey;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.button, isSelected && styles.buttonActive]}
              onPress={() => onSelect(option.key)}
            >
              <Text style={[styles.text, isSelected && styles.textActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3e382f',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f7f2ea',
  },
  buttonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  text: {
    color: '#3c362f',
    fontWeight: '500',
  },
  textActive: {
    color: '#ffffff',
  },
});
