// app\src\screens\Visualize\Visualize.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Layout from './../../components/Layout/Layout';
import GlobalStyles from '../../styles/Styles';
import { useFinance } from '../../contexts/FinanceContext';
import PeriodFilter from '../../components/Filters/PeriodFilter';
import PizzaChartVictory from '../../components/Charts/PizzaChartVictory';
import { spacing } from '../../styles/themes/spacing';
import { Nature } from '../../services/FinanceService';

function Visualize() {
  // Estados para filtros
  const [selectedNature, setSelectedNature] = useState<Nature | undefined>();
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);

  const {
    operations,
    financialSummary,
    monthOptions,
    selectedPeriod,
    loading,
    setSelectedPeriod,
    formatCurrency,
    getSelectedPeriodLabel,
    getCategoryStats,
    filterOperations,
    filteredOperations: contextFilteredOperations
  } = useFinance();

  // Filtrar operações baseado nos filtros selecionados
  // Se selectedPeriod não for 'all', usar as operações já filtradas pelo contexto
  // Se for 'all', aplicar filtros locais sobre todas as operações
  const filteredOperations = (() => {
    // Base de operações para filtrar
    const baseOperations = selectedPeriod !== 'all' 
      ? contextFilteredOperations 
      : operations;
    
    console.log(`🔍 Visualize: selectedPeriod=${selectedPeriod}`);
    console.log(`🔍 Visualize: baseOperations=${baseOperations.length} operações`);
    console.log(`🔍 Visualize: selectedNature=${selectedNature}`);
    console.log(`🔍 Visualize: selectedStartDate=${selectedStartDate}`);
    console.log(`🔍 Visualize: selectedEndDate=${selectedEndDate}`);
    
    // Aplicar filtros locais sobre a base
    let filtered = [...baseOperations];

    if (selectedNature) {
      filtered = filtered.filter(op => op.nature === selectedNature);
      console.log(`🔍 Visualize: Após filtro de natureza=${selectedNature}: ${filtered.length} operações`);
    }

    // Só aplicar filtros de data locais se não houver período selecionado
    if (selectedPeriod === 'all' && selectedStartDate && selectedEndDate) {
      const start = new Date(selectedStartDate);
      const end = new Date(selectedEndDate);
      end.setHours(23, 59, 59, 999); // Incluir o dia inteiro
      
      filtered = filtered.filter(op => {
        const opDate = new Date(op.date);
        return opDate >= start && opDate <= end;
      });
      console.log(`🔍 Visualize: Após filtro de data local: ${filtered.length} operações`);
    }

    console.log(`🔍 Visualize: Resultado final: ${filtered.length} operações`);
    return filtered;
  })();

  // Calcular estatísticas baseadas nas operações filtradas
  const getFilteredCategoryStats = () => {
    const categoryStats = new Map<string, {
      receitas: number;
      despesas: number;
      total: number;
      operacoes: number;
    }>();

    filteredOperations
      .filter(op => ['recebido', 'pago'].includes(op.state))
      .forEach(op => {
        const category = op.category;
        const current = categoryStats.get(category) || {
          receitas: 0,
          despesas: 0,
          total: 0,
          operacoes: 0
        };

        if (op.nature === 'receita') {
          current.receitas += Math.abs(op.value);
        } else {
          current.despesas += Math.abs(op.value);
        }
        
        current.total += Math.abs(op.value);
        current.operacoes += 1;
        
        categoryStats.set(category, current);
      });

    // Converter para array e ordenar por total
    return Array.from(categoryStats.entries())
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.total - a.total);
  };

  // Calcular resumo financeiro baseado nas operações filtradas
  const getFilteredFinancialSummary = () => {
    // Receitas realizadas (recebidas)
    const totalReceitas = filteredOperations
      .filter(op => op.nature === 'receita' && op.state === 'recebido')
      .reduce((total, op) => total + Math.abs(op.value), 0);

    // Despesas realizadas (pagas)
    const totalDespesas = filteredOperations
      .filter(op => op.nature === 'despesa' && op.state === 'pago')
      .reduce((total, op) => total + Math.abs(op.value), 0);

    // Saldo líquido
    const saldoLiquido = totalReceitas - totalDespesas;

    // Operações pendentes
    const operacoesPendentes = filteredOperations.filter(op => 
      ['receber', 'pagar', 'transferir'].includes(op.state)
    );

    // Receitas pendentes
    const receitasPendentes = operacoesPendentes
      .filter(op => op.nature === 'receita')
      .reduce((total, op) => total + Math.abs(op.value), 0);

    // Despesas pendentes
    const despesasPendentes = operacoesPendentes
      .filter(op => op.nature === 'despesa')
      .reduce((total, op) => total + Math.abs(op.value), 0);

    return {
      totalReceitas,
      totalDespesas,
      saldoLiquido,
      receitasPendentes,
      despesasPendentes,
      totalOperacoes: filteredOperations.length,
      operacoesPendentes: operacoesPendentes.length
    };
  };

  const categoryStats = getFilteredCategoryStats();
  const filteredFinancialSummary = getFilteredFinancialSummary();

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setSelectedNature(undefined);
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setSelectedPeriod('all');
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = selectedNature || selectedStartDate || selectedEndDate || selectedPeriod !== 'all';

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
        {/* Filtros */}
        <View style={GlobalStyles.cardContainer}>
          <View style={GlobalStyles.cardHeader}>
            <Text style={GlobalStyles.subTitle}>Filtros</Text>
            {hasActiveFilters && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={clearAllFilters}
              >
                <Text style={styles.clearFiltersText}>Limpar</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.hrLine}></View>
          
          {/* Filtro de Período */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Período</Text>
            <PeriodFilter
              onPeriodChange={setSelectedPeriod}
              selectedPeriod={selectedPeriod}
              availablePeriods={monthOptions.map(opt => ({ label: opt.label, value: opt.value }))}
            />
          </View>

          {/* Filtro de Natureza */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Natureza</Text>
            <View style={styles.natureFilterContainer}>
              <TouchableOpacity
                style={[
                  styles.natureFilterButton,
                  selectedNature === 'despesa' && styles.natureFilterButtonActive
                ]}
                onPress={() => setSelectedNature(selectedNature === 'despesa' ? undefined : 'despesa')}
              >
                <Text style={[
                  styles.natureFilterText,
                  selectedNature === 'despesa' && styles.natureFilterTextActive
                ]}>
                  Despesas
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.natureFilterButton,
                  selectedNature === 'receita' && styles.natureFilterButtonActive
                ]}
                onPress={() => setSelectedNature(selectedNature === 'receita' ? undefined : 'receita')}
              >
                <Text style={[
                  styles.natureFilterText,
                  selectedNature === 'receita' && styles.natureFilterTextActive
                ]}>
                  Receitas
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Indicador de filtros ativos */}
          {hasActiveFilters && (
            <View style={styles.activeFiltersIndicator}>
              <Text style={styles.activeFiltersText}>
                Mostrando {filteredOperations.length} de {operations.length} operações
              </Text>
            </View>
          )}
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
                {formatCurrency(filteredFinancialSummary.totalReceitas)}
              </Text>
              {filteredFinancialSummary.receitasPendentes > 0 && (
                <Text style={styles.pendingText}>
                  Pendente: {formatCurrency(filteredFinancialSummary.receitasPendentes)}
                </Text>
              )}
            </View>
            <View style={styles.column}>
              <Text style={styles.columnTitle}>Despesas</Text>
              <Text style={[GlobalStyles.operationValue, styles.negative]}>
                -{formatCurrency(filteredFinancialSummary.totalDespesas)}
              </Text>
              {filteredFinancialSummary.despesasPendentes > 0 && (
                <Text style={styles.pendingText}>
                  Pendente: {formatCurrency(filteredFinancialSummary.despesasPendentes)}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.hrLine}></View>
          <View style={styles.containerFooter}>
            <Text style={[
              GlobalStyles.description, 
              styles.resultText,
              filteredFinancialSummary.saldoLiquido >= 0 ? styles.positive : styles.negative
            ]}>
              Resultado: {formatCurrency(filteredFinancialSummary.saldoLiquido)}
            </Text>
            <Text style={styles.statsText}>
              {filteredFinancialSummary.totalOperacoes} operações realizadas
              {filteredFinancialSummary.operacoesPendentes > 0 && 
                ` • ${filteredFinancialSummary.operacoesPendentes} pendentes`
              }
            </Text>
          </View>
        </View>

        {/* Card de categorias */}
        {categoryStats.length > 0 && (
          <View style={GlobalStyles.cardContainer}>
            <View style={GlobalStyles.cardHeader}>
              <Text style={GlobalStyles.subTitle}>
                {selectedNature === 'despesa' ? 'Principais Despesas' : 
                 selectedNature === 'receita' ? 'Principais Receitas' : 
                 'Principais Categorias'}
              </Text>
            </View>
            <View style={styles.hrLine}></View>
            <View style={styles.categoriesContainer}>
              {categoryStats.slice(0, 5).map((stat, index) => {
                const totalGeral = filteredFinancialSummary.totalReceitas + filteredFinancialSummary.totalDespesas;
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

        {/* Gráfico de Pizza Interativo para Categorias */}
        {categoryStats.length > 0 && (
          <View style={GlobalStyles.cardContainer}>
            <View style={GlobalStyles.cardHeader}>
              <Text style={GlobalStyles.subTitle}>
                {selectedNature === 'despesa' ? 'Despesas (Gráfico)' : 
                 selectedNature === 'receita' ? 'Receitas (Gráfico)' : 
                 'Categorias (Gráfico)'}
              </Text>
            </View>
            <View style={styles.hrLine}></View>
            <PizzaChartVictory
              data={categoryStats.map((stat, idx) => ({
                x: stat.category,
                y: stat.total,
                label: stat.category,
                percentage: (stat.total / (filteredFinancialSummary.totalReceitas + filteredFinancialSummary.totalDespesas)) * 100 || 0
              }))}
              formatCurrency={formatCurrency}
              maxWidth={320}
              centerChart={true}
              containerStyle={{
                paddingVertical: 10,
                paddingHorizontal: 5
              }}
            />
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
    padding: spacing.sm,
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
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  natureFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  natureFilterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  natureFilterButtonActive: {
    backgroundColor: '#007AFF',
  },
  natureFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  natureFilterTextActive: {
    color: '#fff',
  },
  clearFiltersButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  activeFiltersIndicator: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e0f7fa',
    borderRadius: 6,
    alignSelf: 'center',
  },
  activeFiltersText: {
    fontSize: 13,
    color: '#00796b',
    fontWeight: '600',
  },
});

export default Visualize;