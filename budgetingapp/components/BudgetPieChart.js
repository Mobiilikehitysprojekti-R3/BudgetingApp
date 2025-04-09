import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const BudgetPieChart = ({ data, onSlicePress }) => {
  if (!data || typeof data !== 'object') return null;

  const chartData = Object.entries(data)
    .map(([category, expenses], index) => {
      const total = Object.values(expenses).reduce((sum, val) => sum + val, 0);
      return {
        name: category,
        population: total,
        color: getColor(index),
        legendFontColor: '#333',
        legendFontSize: 14,
        onPress: () => onSlicePress(category)
      };
    })
    .filter(item => item.population > 0);

  if (chartData.length === 0) {
    return <Text style={styles.empty}>No budget data to show.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Budget Pie Chart</Text>
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
        hasLegend={true}
      />
    </View>
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
    '#795548',
    '#3F51B5',
    '#009688',
  ];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 24,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  empty: {
    marginTop: 20,
    color: '#999',
    textAlign: 'center',
  },
});

export default BudgetPieChart;
