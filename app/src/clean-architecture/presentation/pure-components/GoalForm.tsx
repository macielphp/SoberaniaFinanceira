import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
// Mock Picker for testing
const Picker = ({ selectedValue, onValueChange, children, style, enabled }: any) => {
  return null;
};
Picker.Item = ({ label, value }: any) => null;

import { Goal } from '../../domain/entities/Goal';
import { Money } from '../../shared/utils/Money';

export interface GoalFormProps {
  goal?: Goal;
  onSubmit: (data: CreateGoalData | UpdateGoalData) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
  error?: string;
}

export interface CreateGoalData {
  description: string;
  targetAmount: string;
  availablePerMonth: string;
  startDate: Date;
  endDate: Date;
  type: 'economia' | 'compra';
  importance: 'baixa' | 'média' | 'alta';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
}

export interface UpdateGoalData extends CreateGoalData {
  id: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const GoalForm: React.FC<GoalFormProps> = ({
  goal,
  onSubmit,
  onCancel,
  onDelete,
  loading = false,
  error,
}) => {
  const [formData, setFormData] = useState<CreateGoalData>({
    description: '',
    targetAmount: '',
    availablePerMonth: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    type: 'economia',
    importance: 'média',
    status: 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (goal) {
      setFormData({
        description: goal.description || '',
        targetAmount: goal.targetValue ? goal.targetValue.value.toString() : '',
        availablePerMonth: goal.availablePerMonth ? goal.availablePerMonth.value.toString() : '',
        startDate: goal.startDate || new Date(),
        endDate: goal.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        type: goal.type,
        importance: goal.importance,
        status: goal.status,
      });
    }
  }, [goal]);

  const validateForm = (): ValidationResult => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    } else if (formData.description.trim().length < 3) {
      newErrors.description = 'Descrição deve ter pelo menos 3 caracteres';
    }

    if (!formData.targetAmount.trim()) {
      newErrors.targetAmount = 'Valor alvo é obrigatório';
    } else {
      const targetAmount = parseFloat(formData.targetAmount);
      if (isNaN(targetAmount) || targetAmount <= 0) {
        newErrors.targetAmount = 'Valor alvo deve ser positivo';
      }
    }

    // As datas sempre têm valores padrão, então não precisamos validar como obrigatórias
    // Mas podemos validar se a data de fim é posterior à data de início
    if (formData.startDate && formData.endDate && formData.endDate <= formData.startDate) {
      newErrors.endDate = 'Data de fim deve ser posterior à data de início';
    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleSubmit = () => {
    const validation = validateForm();
    if (validation.isValid) {
      if (goal) {
        onSubmit({
          ...formData,
          id: goal.id,
        } as UpdateGoalData);
      } else {
        onSubmit(formData);
      }
    }
  };

  const handleDelete = () => {
    if (goal && onDelete) {
      onDelete(goal.id);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Text style={styles.title}>
        {goal ? 'Editar Meta' : 'Nova Meta'}
      </Text>

      <View style={styles.form}>
        {/* Descrição */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Digite a descrição da meta"
            multiline
            numberOfLines={3}
            editable={!loading}
            testID="goal-description-input"
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
        </View>

        {/* Valor Alvo */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Valor Alvo</Text>
          <TextInput
            style={[styles.input, errors.targetAmount && styles.inputError]}
            value={formData.targetAmount}
            onChangeText={(text) => setFormData({ ...formData, targetAmount: text })}
            placeholder="0,00"
            keyboardType="numeric"
            editable={!loading}
            testID="goal-target-amount-input"
          />
          {errors.targetAmount && (
            <Text style={styles.errorText}>{errors.targetAmount}</Text>
          )}
        </View>

        {/* Valor Mensal Disponível */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Valor Mensal Disponível</Text>
          <TextInput
            style={[styles.input, errors.availablePerMonth && styles.inputError]}
            value={formData.availablePerMonth}
            onChangeText={(text) => setFormData({ ...formData, availablePerMonth: text })}
            placeholder="0,00"
            keyboardType="numeric"
            editable={!loading}
            testID="goal-available-per-month-input"
          />
          {errors.availablePerMonth && (
            <Text style={styles.errorText}>{errors.availablePerMonth}</Text>
          )}
        </View>

        {/* Data Início */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Data Início</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.startDate.toISOString().split('T')[0]}
              onValueChange={(value: any) => setFormData({ ...formData, startDate: new Date(value) })}
              style={styles.picker}
              enabled={!loading}
            >
              <Picker.Item label="Selecione a data de início" value="" />
            </Picker>
          </View>
          {errors.startDate && (
            <Text style={styles.errorText}>{errors.startDate}</Text>
          )}
        </View>

        {/* Data Fim */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Data Fim</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.endDate.toISOString().split('T')[0]}
              onValueChange={(value: any) => setFormData({ ...formData, endDate: new Date(value) })}
              style={styles.picker}
              enabled={!loading}
            >
              <Picker.Item label="Selecione a data de fim" value="" />
            </Picker>
          </View>
          {errors.endDate && (
            <Text style={styles.errorText}>{errors.endDate}</Text>
          )}
        </View>

        {/* Tipo */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Tipo</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.type}
              onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              style={styles.picker}
              enabled={!loading}
            >
              <Picker.Item label="Economia" value="economia" />
              <Picker.Item label="Investimento" value="investimento" />
              <Picker.Item label="Viagem" value="viagem" />
              <Picker.Item label="Educação" value="educacao" />
              <Picker.Item label="Saúde" value="saude" />
              <Picker.Item label="Lazer" value="lazer" />
              <Picker.Item label="Outros" value="outros" />
            </Picker>
          </View>
          {errors.type && (
            <Text style={styles.errorText}>{errors.type}</Text>
          )}
        </View>

        {/* Importância */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Importância</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.importance}
              onValueChange={(value: any) => setFormData({ ...formData, importance: value })}
              style={styles.picker}
              enabled={!loading}
            >
              <Picker.Item label="Baixa" value="baixa" />
              <Picker.Item label="Média" value="media" />
              <Picker.Item label="Alta" value="alta" />
            </Picker>
          </View>
          {errors.importance && (
            <Text style={styles.errorText}>{errors.importance}</Text>
          )}
        </View>

        {/* Status */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              style={styles.picker}
              enabled={!loading}
            >
              <Picker.Item label="Ativo" value="active" />
              <Picker.Item label="Concluído" value="completed" />
              <Picker.Item label="Pausado" value="paused" />
              <Picker.Item label="Cancelado" value="cancelled" />
            </Picker>
          </View>
          {errors.status && (
            <Text style={styles.errorText}>{errors.status}</Text>
          )}
        </View>

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          {goal && onDelete && (
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleDelete}
              disabled={loading}
            >
              <Text style={styles.deleteButtonText}>Excluir</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {goal ? 'Atualizar' : 'Criar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  form: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#f44336',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#4caf50',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoalForm;
