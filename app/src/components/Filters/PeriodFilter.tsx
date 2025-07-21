import { Picker } from '@react-native-picker/picker';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../styles/themes';
import { useState, useEffect } from 'react';

type PeriodFilterProps = {
    onPeriodChange: (period: string) => void;
    selectedPeriod: string;
    availablePeriods: { label: string; value: string }[];
}

export default function PeriodFilter ({ onPeriodChange, selectedPeriod, availablePeriods }: PeriodFilterProps) {

// Filter states
const [selectedMonth, setSelectedMonth] = useState<string>('');
const [selectedYear, setSelectedYear] = useState<string>('');

  // Extrair mês e ano do selectedPeriod, se vier preenchido
  useEffect(() => {
    if (selectedPeriod && selectedPeriod !== 'all') {
      const [year, monthStr] = selectedPeriod.split('-');
      
      console.log(`🔄 PeriodFilter: selectedPeriod="${selectedPeriod}" -> monthStr="${monthStr}"`);
      
      setSelectedMonth(monthStr);
      setSelectedYear(year);
    } else {
      // Se for 'all', limpar os campos
      setSelectedMonth('');
      setSelectedYear('');
    }
  }, [selectedPeriod]);

  // Função para montar o período e chamar onPeriodChange
  const handlePeriodChange = (month: string, year: string) => {
    console.log(`🔄 PeriodFilter: handlePeriodChange chamado com month=${month}, year=${year}`);
    
    if (month && year) {
      // Usar diretamente o mês 1-12 sem conversão
      const periodValue = `${year}-${month}`;
      console.log(`🔄 PeriodFilter: month="${month}" -> periodValue="${periodValue}"`);
      onPeriodChange(periodValue);
    } else {
      console.log(`🔄 PeriodFilter: Chamando onPeriodChange com 'all'`);
      onPeriodChange('all');
    }
  };

  // Handler para mudança de mês
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    handlePeriodChange(month, selectedYear);
  };

  // Handler para mudança de ano
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    handlePeriodChange(selectedMonth, year);
  };

    return (
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Filtrar por Período</Text>
          <View style={styles.filterRow}>
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Mês</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedMonth}
                  onValueChange={handleMonthChange}
                  style={styles.inlinePicker}
                >
                  <Picker.Item label="Selecione um mês" value="" />
                  <Picker.Item label="Janeiro" value="01" />
                  <Picker.Item label="Fevereiro" value="02" />
                  <Picker.Item label="Março" value="03" />
                  <Picker.Item label="Abril" value="04" />
                  <Picker.Item label="Maio" value="05" />
                  <Picker.Item label="Junho" value="06" />
                  <Picker.Item label="Julho" value="07" />
                  <Picker.Item label="Agosto" value="08" />
                  <Picker.Item label="Setembro" value="09" />
                  <Picker.Item label="Outubro" value="10" />
                  <Picker.Item label="Novembro" value="11" />
                  <Picker.Item label="Dezembro" value="12" />
                </Picker>
              </View>
            </View>
            
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Ano</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedYear}
                  onValueChange={handleYearChange}
                  style={styles.inlinePicker}
                >
                  <Picker.Item label="Selecione um ano" value="" />
                  {(() => {
                    const currentYear = new Date().getFullYear();
                    const years = [];
                    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
                      years.push(
                        <Picker.Item key={i} label={i.toString()} value={i.toString()} />
                      );
                    }
                    return years;
                  })()}
                </Picker>
              </View>
            </View>
          </View>
        </View>
    )
}

const styles = StyleSheet.create({
    filterContainer: {
        // margin: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.background.default,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    filterTitle: {
        fontSize: typography.h3.fontSize,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    filterRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    filterItem: {
        flex: 1,
    },
    filterLabel: {
        fontSize: typography.caption.fontSize,
        color: colors.text.secondary,
        marginBottom: spacing.xs,
    },
    pickerContainer: {
        backgroundColor: colors.background.default,
        borderWidth: 1,
        borderColor: colors.gray[300],
        borderRadius: 8,
        overflow: 'hidden',
    },
    inlinePicker: {
        height: 50,
        margin: 0,
        padding: 0,
    },
})
