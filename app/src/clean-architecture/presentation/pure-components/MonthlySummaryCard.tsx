// Pure Component: MonthlySummaryCard
// Componente puro para exibir resumo financeiro mensal
// Segue Clean Architecture - sem lógica de negócio, apenas UI

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MonthlyFinanceSummary } from '../../domain/entities/MonthlyFinanceSummary';

export interface MonthlySummaryCardProps {
  summary: MonthlyFinanceSummary;
  onViewDetails: (summary: MonthlyFinanceSummary) => void;
  onEdit: (summary: MonthlyFinanceSummary) => void;
  loading?: boolean;
  error?: string | null;
}

export const MonthlySummaryCard: React.FC<MonthlySummaryCardProps> = ({
  summary,
  onViewDetails,
  onEdit,
  loading = false,
  error = null,
}) => {
  const formatMonth = (monthString: string): string => {
    const [year, month] = monthString.split('-');
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return `${months[monthNum - 1]} ${yearNum}`;
  };

  const getComplianceColor = (percentage: number): string => {
    if (percentage >= 90) return '#4caf50'; // Green
    if (percentage >= 70) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const getComplianceStatus = (percentage: number): string => {
    if (percentage >= 90) return 'Excelente';
    if (percentage >= 70) return 'Bom';
    return 'Atenção';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="monthly-summary-card">
      <View style={styles.header}>
        <Text style={styles.title}>Resumo Financeiro</Text>
        <Text style={styles.monthYear}>
          {formatMonth(summary.month)}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.financialData}>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Receitas:</Text>
            <Text style={[styles.dataValue, styles.incomeValue]}>
              {summary.totalIncome.format()}
            </Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Despesas:</Text>
            <Text style={[styles.dataValue, styles.expenseValue]}>
              {summary.totalExpense.format()}
            </Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Economias:</Text>
            <Text style={[styles.dataValue, styles.savingsValue]}>
              {summary.balance.format()}
            </Text>
          </View>
        </View>

        <View style={styles.complianceSection}>
          <Text style={styles.complianceLabel}>Cumprimento do Orçamento</Text>
          <View style={styles.complianceRow}>
            <Text style={styles.compliancePercentage}>
              {summary.calculateBudgetAdherence()}%
            </Text>
            <View style={styles.complianceStatus}>
              <Text style={[
                styles.complianceStatusText,
                { color: getComplianceColor(summary.calculateBudgetAdherence()) }
              ]}>
                {getComplianceStatus(summary.calculateBudgetAdherence())}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewDetailsButton]}
          onPress={() => onViewDetails(summary)}
          accessibilityLabel="Ver detalhes do resumo"
          accessibilityHint="Ver detalhes completos do resumo financeiro"
        >
          <Text style={styles.viewDetailsButtonText} accessibilityLabel="Ver detalhes do resumo">
            Ver Detalhes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(summary)}
          accessibilityLabel="Editar resumo"
          accessibilityHint="Editar este resumo financeiro"
        >
          <Text style={styles.editButtonText} accessibilityLabel="Editar resumo">
            Editar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  monthYear: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    marginBottom: 16,
  },
  financialData: {
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataLabel: {
    fontSize: 14,
    color: '#666',
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  incomeValue: {
    color: '#4caf50',
  },
  expenseValue: {
    color: '#f44336',
  },
  savingsValue: {
    color: '#2196f3',
  },
  complianceSection: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  complianceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  complianceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compliancePercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  complianceStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  complianceStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  viewDetailsButton: {
    backgroundColor: '#2196f3',
  },
  viewDetailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#ff9800',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    marginVertical: 8,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '500',
  },
});
