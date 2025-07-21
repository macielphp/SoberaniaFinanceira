import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

const COLORS = [
  '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336',
  '#00BCD4', '#8BC34A', '#FF5722', '#607D8B', '#795548'
];

interface PizzaChartProps {
  data: Array<{
    x: string;
    y: number;
    label: string;
    percentage: number;
  }>;
  formatCurrency?: (value: number) => string;
  maxWidth?: number;
  containerStyle?: any;
  centerChart?: boolean;
}

const PizzaChart: React.FC<PizzaChartProps> = ({ 
  data, 
  formatCurrency = (value) => `R$ ${value.toFixed(2)}`,
  maxWidth = 300,
  containerStyle,
  centerChart = true
}) => {
  const [selectedSlice, setSelectedSlice] = useState<number | null>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });
  
  // Calcular dimensões do gráfico baseado no container
  const onLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    const chartWidth = Math.min(width - 40, maxWidth);
    const chartHeight = chartWidth * 0.8;
    setChartDimensions({ width: chartWidth, height: chartHeight });
  };

  const handleSlicePress = (index: number) => {
    setSelectedSlice(selectedSlice === index ? null : index);
  };

  const selectedData = selectedSlice !== null ? data[selectedSlice] : null;

  // Adaptar os dados para o formato do Gifted Charts
  const chartData = data.map((item, idx) => ({
    value: item.y,
    text: item.x,
    color: COLORS[idx % COLORS.length],
    textColor: '#333',
    textSize: 9,
    shiftTextX: -20,
    shiftTextY: 0,
  }));

  return (
    <View style={[styles.container, containerStyle]} onLayout={onLayout}>
      <View style={[styles.chartContainer, centerChart && styles.centeredChart]}>
        {chartDimensions.width > 0 && (
          <View style={[styles.chartWrapper, centerChart && styles.centeredWrapper]}>
            <PieChart
              data={chartData}
              donut
              showText
              textColor="black"
              textSize={12}
              radius={chartDimensions.width * 0.3}
              innerRadius={chartDimensions.width * 0.15}
              centerLabelComponent={() => (
                <View style={styles.centerLabel}>
                  <Text style={styles.centerLabelText}>Total</Text>
                  <Text style={styles.centerLabelValue}>
                    {formatCurrency(data.reduce((sum, item) => sum + item.y, 0))}
                  </Text>
                </View>
              )}
            />
          </View>
        )}
      </View>

      {/* Botões interativos para cada fatia */}
      <View style={styles.sliceButtonsContainer}>
        {data.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.sliceButton,
              { backgroundColor: COLORS[index % COLORS.length] },
              selectedSlice === index && styles.selectedSliceButton
            ]}
            onPress={() => handleSlicePress(index)}
          >
            <Text style={styles.sliceButtonText}>{item.x}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Legenda interativa */}
      {selectedData && (
        <View style={styles.legendContainer}>
          <View style={styles.legendHeader}>
            <View style={[styles.legendColor, { backgroundColor: COLORS[selectedSlice! % COLORS.length] }]} />
            <Text style={styles.legendTitle}>{selectedData.label}</Text>
          </View>
          <View style={styles.legendDetails}>
            <Text style={styles.legendValue}>
              {formatCurrency(selectedData.y)}
            </Text>
            <Text style={styles.legendPercentage}>
              {selectedData.percentage.toFixed(1)}% do total
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedSlice(null)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  centeredChart: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabelText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  centerLabelValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  sliceButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  sliceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 4,
    marginVertical: 2,
    opacity: 0.8,
  },
  selectedSliceButton: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sliceButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  legendContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    width: '90%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  legendDetails: {
    marginBottom: 8,
  },
  legendValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  legendPercentage: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
});

export default PizzaChart; 