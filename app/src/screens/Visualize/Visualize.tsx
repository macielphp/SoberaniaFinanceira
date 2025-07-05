// app\src\screens\Visualize\Visualize.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Layout from './../../components/Layout/Layout';
import GlobalStyles from '../../styles/Styles';
import { useFinance } from '../../contexts/FinanceContext';

function Visualize() {
  const {
    financialSummary,
    monthOptions,
    selectedPeriod,
    loading,
    setSelectedPeriod,
    formatCurrency,
    getSelectedPeriodLabel,
    getCategoryStats
  } = useFinance();

  const categoryStats = getCategoryStats();

  if (loading) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <Text style={GlobalStyles.title}>Visualize</Text>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Filtro de Período */}
        <View style={GlobalStyles.cardContainer}>
          <View style={GlobalStyles.cardHeader}>
            <Text style={GlobalStyles.subTitle}>Período</Text>
          </View>
          <View style={styles.hrLine}></View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedPeriod}
              onValueChange={(itemValue) => setSelectedPeriod(itemValue)}
              style={styles.picker}
            >
              {monthOptions.map((option) => (
                <Picker.Item 
                  key={option.value} 
                  label={option.label} 
                  value={option.value} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Board de balanço */}
        <View style={GlobalStyles.cardContainer}>
          <View style={GlobalStyles.cardHeader}>
            <Text style={GlobalStyles.subTitle}>Balanço</Text>
            <Text style={styles.periodLabel}>{getSelectedPeriodLabel()}</Text>
          </View>
          <View style={styles.hrLine}></View>
          <View style={styles.containerContent}>
            <View style={styles.column}>
              <Text style={styles.columnTitle}>Receitas</Text>
              <Text style={[GlobalStyles.operationValue, styles.positive]}>
                {formatCurrency(financialSummary.totalReceitas)}
              </Text>
              {financialSummary.receitasPendentes > 0 && (
                <Text style={styles.pendingText}>
                  Pendente: {formatCurrency(financialSummary.receitasPendentes)}
                </Text>
              )}
            </View>
            <View style={styles.column}>
              <Text style={styles.columnTitle}>Despesas</Text>
              <Text style={[GlobalStyles.operationValue, styles.negative]}>
                -{formatCurrency(financialSummary.totalDespesas)}
              </Text>
              {financialSummary.despesasPendentes > 0 && (
                <Text style={styles.pendingText}>
                  Pendente: {formatCurrency(financialSummary.despesasPendentes)}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.hrLine}></View>
          <View style={styles.containerFooter}>
            <Text style={[
              GlobalStyles.description, 
              styles.resultText,
              financialSummary.saldoLiquido >= 0 ? styles.positive : styles.negative
            ]}>
              Resultado: {formatCurrency(financialSummary.saldoLiquido)}
            </Text>
            <Text style={styles.statsText}>
              {financialSummary.totalOperacoes} operações realizadas
              {financialSummary.operacoesPendentes > 0 && 
                ` • ${financialSummary.operacoesPendentes} pendentes`
              }
            </Text>
          </View>
        </View>

        {/* Card de categorias */}
        {categoryStats.length > 0 && (
          <View style={GlobalStyles.cardContainer}>
            <View style={GlobalStyles.cardHeader}>
              <Text style={GlobalStyles.subTitle}>Principais Categorias</Text>
            </View>
            <View style={styles.hrLine}></View>
            <View style={styles.categoriesContainer}>
              {categoryStats.slice(0, 5).map((stat, index) => {
                const totalGeral = financialSummary.totalReceitas + financialSummary.totalDespesas;
                const percentage = totalGeral > 0 ? (stat.total / totalGeral) * 100 : 0;
                
                return (
                  <View key={stat.category} style={styles.categoryItem}>
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryName}>{stat.category}</Text>
                      <Text style={styles.categoryValue}>
                        {formatCurrency(stat.total)}
                      </Text>
                    </View>
                    <View style={styles.categoryDetails}>
                      <View style={styles.progressBarContainer}>
                        <View 
                          style={[
                            styles.progressBar, 
                            { width: `${Math.min(percentage, 100)}%` },
                            { backgroundColor: getColorForIndex(index) }
                          ]} 
                        />
                      </View>
                      <Text style={styles.categoryPercentage}>
                        {percentage.toFixed(1)}%
                      </Text>
                    </View>
                    {stat.receitas > 0 && stat.despesas > 0 && (
                      <View style={styles.categoryBreakdown}>
                        <Text style={[styles.breakdownText, styles.positive]}>
                          +{formatCurrency(stat.receitas)}
                        </Text>
                        <Text style={[styles.breakdownText, styles.negative]}>
                          -{formatCurrency(stat.despesas)}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </Layout>
  );
}

// Função para gerar cores para as categorias
const getColorForIndex = (index: number): string => {
  const colors = [
    '#4CAF50', // Verde
    '#2196F3', // Azul
    '#FF9800', // Laranja
    '#9C27B0', // Roxo
    '#F44336', // Vermelho
    '#00BCD4', // Ciano
    '#8BC34A', // Verde claro
    '#FF5722', // Deep Orange
    '#607D8B', // Blue Grey
    '#795548'  // Brown
  ];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    padding: 12,
  },
  containerContent: {
    flexDirection: 'row', 
    justifyContent: 'space-around',
    padding: 12,
  },
  containerFooter: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  hrLine: {
    height: 2,
    borderColor: 'rgb(232, 232, 232)',
    borderWidth: 1,
  },
  column: {
    width: '50%',
    alignItems: 'center'
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  negative: {
    color: '#F44336',
  },
  positive: {
    color: '#4CAF50',
  },
  pendingText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  resultText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  periodLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  pickerContainer: {
    padding: 8,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  categoriesContainer: {
    padding: 12,
  },
  categoryItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  categoryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginRight: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#666',
    minWidth: 40,
    textAlign: 'right',
  },
  categoryBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  breakdownText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default Visualize;