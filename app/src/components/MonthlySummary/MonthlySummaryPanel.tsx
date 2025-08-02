import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Switch, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../styles/themes';
import { getMonthlyFinanceSummaryByUserAndMonth } from '../../database/monthly-finance-summary';
import { updateMonthlyFinanceSummary, updateVariableExpenseLimit } from '../../services/FinanceService';
import { useFinance } from '../../contexts/FinanceContext';

interface MonthlySummaryPanelProps {
  userId: string;
  month: string; // formato YYYY-MM
}

export default function MonthlySummaryPanel({ userId, month }: MonthlySummaryPanelProps) {
  const { operations, refreshAllData } = useFinance();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [includeVariableIncome, setIncludeVariableIncome] = useState(false);
  const [showDebug, setShowDebug] = useState(true); // Temporário para debug
  const [variableExpenseLimit, setVariableExpenseLimit] = useState('300');
  const [isEditingLimit, setIsEditingLimit] = useState(false);

  // Filtrar operações do mês selecionado
  const monthOperations = useMemo(() => {
    const monthStart = month + '-01';
    const monthEnd = month + '-' + String(new Date(Number(month.split('-')[0]), Number(month.split('-')[1]), 0).getDate()).padStart(2, '0');
    
    return operations.filter(op => 
      op.user_id === userId &&
      op.date >= monthStart &&
      op.date <= monthEnd
    );
  }, [operations, userId, month]);

  // Recalcular resumo quando operações mudarem
  useEffect(() => {
    loadSummary();
  }, [userId, month, monthOperations]); // Adicionar monthOperations como dependência

  const loadSummary = async () => {
    try {
      setLoading(true);
      // Primeiro buscar o resumo atual
      const data = await getMonthlyFinanceSummaryByUserAndMonth(userId, month + '-01');
      
      // Se existe resumo, atualizar com o valor atual do switch
      if (data) {
        await updateMonthlyFinanceSummary(userId, month, { 
          includeVariableIncome,
          variable_expense_max_value: parseFloat(variableExpenseLimit) || 300
        });
      }
      
      // Buscar o resumo atualizado
      const updatedData = await getMonthlyFinanceSummaryByUserAndMonth(userId, month + '-01');
      setSummary(updatedData);
      
      // Atualizar o input com o valor salvo
      if (updatedData) {
        setVariableExpenseLimit(updatedData.variable_expense_max_value.toString());
      }
      
      // Debug: Log dos valores
      if (updatedData) {
        console.log('=== DEBUG MONTHLY SUMMARY ===');
        console.log('Operações do mês:', monthOperations.length);
        console.log('Receita Total:', updatedData.total_monthly_income);
        console.log('Despesa Total:', updatedData.total_monthly_expense);
        console.log('Despesas Variáveis (usado/máximo):', updatedData.variable_expense_used_value, '/', updatedData.variable_expense_max_value);
        console.log('Contribuições para Metas:', updatedData.sum_monthly_contribution);
        console.log('Valor Disponível:', updatedData.total_monthly_available);
        
        // Calcular manualmente para verificar
        const calculated = updatedData.total_monthly_income - updatedData.total_monthly_expense - updatedData.variable_expense_max_value - updatedData.sum_monthly_contribution;
        console.log('Cálculo Manual:', calculated);
        console.log('==============================');
      }
    } catch (error) {
      console.error('Erro ao carregar resumo mensal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVariableIncomeToggle = async (value: boolean) => {
    try {
      setIncludeVariableIncome(value);
      // Atualizar o resumo mensal com o novo valor do switch
      await updateMonthlyFinanceSummary(userId, month, { 
        includeVariableIncome: value,
        variable_expense_max_value: parseFloat(variableExpenseLimit) || 300
      });
      // Recarregar os dados
      await loadSummary();
    } catch (error) {
      console.error('Erro ao atualizar resumo mensal:', error);
    }
  };

  const handleVariableExpenseLimitChange = async () => {
    try {
      const limit = parseFloat(variableExpenseLimit) || 300;
      
      // Usar a nova função que atualiza apenas o limite
      await updateVariableExpenseLimit(userId, month, limit);
      
      // Recarregar os dados
      await loadSummary();
      setIsEditingLimit(false);
    } catch (error) {
      console.error('Erro ao atualizar limite de despesas variáveis:', error);
    }
  };

  const handleEditLimit = () => {
    setIsEditingLimit(true);
  };

  const handleCancelEdit = () => {
    // Restaurar o valor original
    if (summary) {
      setVariableExpenseLimit(summary.variable_expense_max_value.toString());
    }
    setIsEditingLimit(false);
  };

  // Função para forçar atualização manual
  const handleManualRefresh = async () => {
    try {
      await refreshAllData(); // Atualiza o contexto
      await loadSummary(); // Recarrega o resumo mensal
    } catch (error) {
      console.error('Erro ao atualizar manualmente:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando resumo mensal...</Text>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>Nenhum resumo mensal encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Resumo Mensal</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleManualRefresh}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Incluir receitas variáveis</Text>
        <Switch
          value={includeVariableIncome}
          onValueChange={handleVariableIncomeToggle}
          trackColor={{ false: colors.gray[500], true: colors.primary[500] }}
          thumbColor={includeVariableIncome ? colors.primary[500] : colors.gray[400]}
        />
      </View>

      <View style={styles.limitContainer}>
        <Text style={styles.limitLabel}>Limite despesas variáveis:</Text>
        <View style={styles.limitInputContainer}>
          <TextInput
            style={[styles.limitInput, isEditingLimit && styles.limitInputEditing]}
            value={variableExpenseLimit}
            onChangeText={setVariableExpenseLimit}
            keyboardType="numeric"
            placeholder="300"
            editable={isEditingLimit}
          />
          {isEditingLimit ? (
            <View style={styles.editButtonsContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={handleVariableExpenseLimitChange}>
                <Text style={styles.saveButtonText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                <Text style={styles.cancelButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={handleEditLimit}>
              <Text style={styles.editButtonText}>✏️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Receita Total</Text>
          <Text style={styles.summaryValue}>
            R$ {summary.total_monthly_income.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Despesa Total</Text>
          <Text style={styles.summaryValue}>
            R$ {summary.total_monthly_expense.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Despesas Variáveis(não orçada)</Text>
          <Text style={styles.summaryValue}>
            R$ {summary.variable_expense_used_value.toFixed(2)}/R$ {summary.variable_expense_max_value.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Contribuições para Metas</Text>
          <Text style={styles.summaryValue}>
            R$ {summary.sum_monthly_contribution.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Disponível</Text>
          <Text style={[styles.summaryValue, { 
            color: summary.total_monthly_available >= 0 ? colors.success[600] : colors.error[600] 
          }]}>
            R$ {summary.total_monthly_available.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Seção de Debug - Temporária */}
      {showDebug && (
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>🔍 Debug - Cálculo Detalhado</Text>
          <Text style={styles.debugText}>
            Operações do mês: {monthOperations.length}
          </Text>
          <Text style={styles.debugText}>
            Receita: R$ {summary.total_monthly_income.toFixed(2)}
          </Text>
          <Text style={styles.debugText}>
            - Despesa: R$ {summary.total_monthly_expense.toFixed(2)}
          </Text>
          <Text style={styles.debugText}>
            - Limite Despesas Variáveis: R$ {summary.variable_expense_max_value.toFixed(2)}
          </Text>
          <Text style={styles.debugText}>
            - Contribuições Metas: R$ {summary.sum_monthly_contribution.toFixed(2)}
          </Text>
          <Text style={styles.debugText}>
            = Disponível: R$ {summary.total_monthly_available.toFixed(2)}
          </Text>
          
          <TouchableOpacity 
            style={styles.hideDebugButton} 
            onPress={() => setShowDebug(false)}
          >
            <Text style={styles.hideDebugButtonText}>Ocultar Debug</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.default,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.h4.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  refreshButton: {
    padding: spacing.xs,
    borderRadius: 4,
    backgroundColor: colors.gray[100],
  },
  refreshButtonText: {
    fontSize: typography.body1.fontSize,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  switchLabel: {
    fontSize: typography.body1.fontSize,
    color: colors.text.primary,
  },
  limitContainer: {
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  limitLabel: {
    fontSize: typography.body2.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  limitInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  limitInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 4,
    padding: spacing.xs,
    fontSize: typography.body2.fontSize,
    backgroundColor: colors.gray[50],
  },
  limitInputEditing: {
    borderColor: colors.primary[500],
    backgroundColor: colors.background.default,
  },
  editButton: {
    padding: spacing.xs,
    borderRadius: 4,
    backgroundColor: colors.gray[100],
  },
  editButtonText: {
    fontSize: typography.body1.fontSize,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  saveButton: {
    padding: spacing.xs,
    borderRadius: 4,
    backgroundColor: colors.success[500],
    minWidth: 32,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.background.default,
    fontSize: typography.body2.fontSize,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: spacing.xs,
    borderRadius: 4,
    backgroundColor: colors.error[500],
    minWidth: 32,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.background.default,
    fontSize: typography.body2.fontSize,
    fontWeight: 'bold',
  },
  summaryGrid: {
    gap: spacing.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.body2.fontSize,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.body2.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  loadingText: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
    padding: spacing.md,
  },
  noDataText: {
    fontSize: typography.body1.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
    padding: spacing.md,
  },
  debugSection: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.gray[100],
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning[500],
  },
  debugTitle: {
    fontSize: typography.body2.fontSize,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  debugText: {
    fontSize: typography.body2.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  hideDebugButton: {
    marginTop: spacing.sm,
    padding: spacing.xs,
    backgroundColor: colors.gray[300],
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  hideDebugButtonText: {
    fontSize: typography.body2.fontSize,
    color: colors.text.secondary,
  },
}); 