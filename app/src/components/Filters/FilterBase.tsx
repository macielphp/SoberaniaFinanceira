import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface FilterBaseProps {
    label: string;
    selectedValue?: string;
    onValueChange: (value: string | undefined) => void;
    options: { label: string, value: string }[];
}

const FilterBase: React.FC<FilterBaseProps> = ({
    label,
    selectedValue,
    onValueChange,
    options,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.pickerContainer}>
                <Text style={styles.label}>{label}</Text>
                <Picker
                    selectedValue={selectedValue || ''}
                    onValueChange={(value) => onValueChange(value === '' ? undefined : value)}
                    style={styles.picker}
                >
                    <Picker.Item label="Todos" value="" />
                    {options.map(opt => (
                        <Picker.Item
                            style={styles.pickerItem}
                            key={opt.value} label={opt.label} value={opt.value}
                        />
                    ))}
                </Picker>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        padding: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        paddingStart: 5,
    },
    pickerContainer: {
        width: 160,
        borderWidth: 1,
        borderColor: '#ddd',
        borderBottomStartRadius: 8,
        borderBottomEndRadius: 8,
        backgroundColor: '#fff'
    },
    picker: {
        height: 50, 
              
    },
    pickerItem:{
        fontSize: 14,
        width: 50,
    }
})

export default FilterBase