// Pure Component: BudgetForm
// Componente puro para formulário de orçamento
// Segue Clean Architecture - sem lógica de negócio, apenas UI

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Budget } from '../../domain/entities/Budget';

export interface BudgetFormData {
  name: string;
  totalPlannedValue: number;
  startPeriod: string;
  endPeriod: string;
}

export interface BudgetFormProps {
  onSubmit: (data: BudgetFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
  initialData?: Budget;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  initialData,
}) => {
  const [formData, setFormData] = useState<BudgetFormData>({
    name: '',
    totalPlannedValue: 0,
    startPeriod: '',
    endPeriod: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        totalPlannedValue: initialData.totalPlannedValue.value,
        startPeriod: initialData.startPeriod.toISOString().split('T')[0],
        endPeriod: initialData.endPeriod.toISOString().split('T')[0],
      });
    } else {
      // Reset form when initialData is removed
      setFormData({
        name: '',
        totalPlannedValue: 0,
        startPeriod: '',
        endPeriod: '',
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    if (!formData.totalPlannedValue) {
      errors.totalPlannedValue = 'Valor é obrigatório';
    } else if (formData.totalPlannedValue <= 0) {
      errors.totalPlannedValue = 'Valor deve ser maior que zero';
    }

    if (!formData.startPeriod) {
      errors.startPeriod = 'Data de início é obrigatória';
    }

    if (!formData.endPeriod) {
      errors.endPeriod = 'Data de fim é obrigatória';
    }

    if (formData.startPeriod && formData.endPeriod) {
      const startDate = new Date(formData.startPeriod);
      const endDate = new Date(formData.endPeriod);
      
      if (endDate <= startDate) {
        errors.endPeriod = 'Data de fim deve ser posterior à data de início';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof BudgetFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {initialData ? 'Editar Orçamento' : 'Novo Orçamento'}
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome do Orçamento</Text>
          <TextInput
            style={[styles.input, validationErrors.name && styles.inputError]}
            placeholder="Nome do orçamento"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            editable={!loading}
            accessibilityLabel="Nome do orçamento"
            accessibilityHint="Digite o nome do orçamento"
          />
          {validationErrors.name && (
            <Text style={styles.validationError}>{validationErrors.name}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Valor Planejado</Text>
          <TextInput
            style={[styles.input, validationErrors.totalPlannedValue && styles.inputError]}
            placeholder="Valor planejado"
            value={formData.totalPlannedValue.toString()}
            onChangeText={(value) => handleInputChange('totalPlannedValue', parseFloat(value) || 0)}
            keyboardType="numeric"
            editable={!loading}
            accessibilityLabel="Valor planejado"
            accessibilityHint="Digite o valor planejado para o orçamento"
          />
          {validationErrors.totalPlannedValue && (
            <Text style={styles.validationError}>{validationErrors.totalPlannedValue}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data de Início</Text>
          <TextInput
            style={[styles.input, validationErrors.startPeriod && styles.inputError]}
            placeholder="Data de início"
            value={formData.startPeriod}
            onChangeText={(value) => handleInputChange('startPeriod', value)}
            editable={!loading}
            accessibilityLabel="Data de início"
            accessibilityHint="Digite a data de início do orçamento"
          />
          {validationErrors.startPeriod && (
            <Text style={styles.validationError}>{validationErrors.startPeriod}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data de Fim</Text>
          <TextInput
            style={[styles.input, validationErrors.endPeriod && styles.inputError]}
            placeholder="Data de fim"
            value={formData.endPeriod}
            onChangeText={(value) => handleInputChange('endPeriod', value)}
            editable={!loading}
            accessibilityLabel="Data de fim"
            accessibilityHint="Digite a data de fim do orçamento"
          />
          {validationErrors.endPeriod && (
            <Text style={styles.validationError}>{validationErrors.endPeriod}</Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
            accessibilityLabel="Cancelar"
            accessibilityHint="Cancelar a criação/edição do orçamento"
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
            accessibilityLabel={loading ? "Salvando" : "Salvar"}
            accessibilityHint={loading ? "Salvando orçamento" : "Salvar o orçamento"}
            accessibilityState={{ disabled: loading }}
          >
            <Text style={[styles.submitButtonText, loading && styles.disabledButtonText]}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  validationError: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2196f3',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledButtonText: {
    color: '#999',
  },
});
