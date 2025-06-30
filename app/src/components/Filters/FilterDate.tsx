import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type FilterDateProps = {
    startDate: Date | null;
    endDate: Date | null;
    setStartDate: (date: Date | null) => void;
    setEndDate: (date: Date | null) => void;
}

const FilterDate: React.FC<FilterDateProps> = ({
    startDate,
    endDate,
    setStartDate,
    setEndDate,
}) => {
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const formatDate = (date: Date | null) => {
        if (!date) return 'Selecione';
        return date.toLocaleDateString('pt-BR');
    };

    return (    
        <View style={styles.container}>
            <Text style={styles.label}>Período</Text>
            <View style={styles.row}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setShowStartPicker(true)}
                >
                    <Text style={styles.buttonText}>Início: {formatDate(startDate)}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setShowEndPicker(true)}
                >
                    <Text style={styles.buttonText}>Fim: {formatDate(endDate)}</Text>
                </TouchableOpacity>

                {showStartPicker && (
                    <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                        setShowStartPicker(false);
                        if (selectedDate) {
                        setStartDate(selectedDate);
                        }
                    }}
                    />
                )}

                {showEndPicker && (
                    <DateTimePicker
                        value={endDate || new Date()}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(event, selectedDate) => {
                            setShowEndPicker(false);
                            if (selectedDate) {
                                setEndDate(selectedDate)
                            }
                        }}

                    />
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    buttonText: {
        color: '#333'
    },
    button: {
        flex: 1,
        backgroundColor: '#eee',
        padding: 12,
        borderRadius: 8,
        marginRight: 8,
        alignItems: 'center',
    },
})

export default FilterDate