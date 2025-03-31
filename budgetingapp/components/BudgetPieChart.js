import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const BudgetPieChart = ({ data }) => {
  const chartData = Object.entries(data)
    .filter(([_, value]) => typeof value === 'number' && value > 0)
    .map(([label, value], index) => ({
      name: label,
      population: value,
      color: getColor(index),
      legendFontColor: '#333',
      legendFontSize: 14,
    }));

  if (chartData.length === 0) return <Text>No budget data to show.</Text>;

  return (
    <PieChart
      data={chartData}
      width={screenWidth - 32}
      height={220}
      chartConfig={{
        color: () => `rgba(0, 0, 0, 0.5)`,
      }}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="16"
      center={[0, 0]}
      absolute
    />
  );
};

const getColor = (index) => {
  const colors = [
    '#F44336',
    '#2196F3',
    '#FFEB3B',
    '#4CAF50',
    '#9C27B0',
    '#FF9800',
    '#00BCD4',
  ];
  return colors[index % colors.length];
};

export default BudgetPieChart;
