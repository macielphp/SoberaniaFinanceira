import React from 'react';
import { View, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

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
}

const screenWidth = Dimensions.get('window').width;

const PizzaChart: React.FC<PizzaChartProps> = ({ data }) => {
  // Adaptar os dados para o formato do PieChart
  const chartData = data.map((item, idx) => ({
    name: item.x,
    population: item.y,
    color: COLORS[idx % COLORS.length],
    legendFontColor: '#333',
    legendFontSize: 14,
  }));

  return (
    <View style={{ alignItems: 'center', marginVertical: 24 }}>
      <PieChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor={'population'}
        backgroundColor={'transparent'}
        paddingLeft={'15'}
        absolute
      />
    </View>
  );
};

export default PizzaChart;
