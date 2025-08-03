import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type BackButtonProps = {
    onPress: () => void;
    text?: string;
}

const BackButton = ({ onPress, text }: BackButtonProps) => {
    return (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onPress}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
          {text && <Text style={styles.backText}>{text}</Text>}
        </TouchableOpacity>
    )
}

export default BackButton;

const styles = StyleSheet.create({
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
  },
  backText: {
    marginLeft: 1,
    fontSize: 16,
    color: '#333',
  },
})