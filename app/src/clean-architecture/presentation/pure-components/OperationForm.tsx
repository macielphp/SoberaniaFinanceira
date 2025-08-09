import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
// Mock Picker for testing
const Picker = ({ selectedValue, onValueChange, children, style, enabled }: any) => {
  return null;
};
Picker.Item = ({ label, value }: any) => null;
import { Operation } from '../../domain/entities/Operation';
import { Category } from '../../domain/entities/Category';
import { Account } from '../../domain/entities/Account';
import { Money } from '../../shared/utils/Money';

export interface OperationFormProps {
  operation?: Operation;
  categories: Category[];
  accounts: Account[];
  onSubmit: (data: CreateOperationData | UpdateOperationData) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

export interface CreateOperationData {
  details: string;
  amount: string;
  categoryId: string;
  accountId: string;
  date: string;
  nature: 'receita' | 'despesa';
  state: 'receber' | 'recebido' | 'pagar' | 'pago';
  paymentMethod: 'Cartão de débito' | 'Cartão de crédito' | 'Pix' | 'TED' | 'Estorno' | 'Transferência bancária';
  sourceAccount: string;
  destinationAccount: string;
  project?: string;
}

export interface UpdateOperationData extends CreateOperationData {
  id: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const OperationForm: React.FC<OperationFormProps> = ({
  operation,
  categories,
  accounts,
  onSubmit,
  onCancel,
  loading = false,
  error,
}) => {
  const [formData, setFormData] = useState<CreateOperationData>({
    details: '',
    amount: '',
    categoryId: '',
    accountId: '',
    date: new Date().toISOString().split('T')[0],
    nature: 'despesa',
    state: 'pago',
    paymentMethod: 'Cartão de débito',
    sourceAccount: '',
    destinationAccount: '',
    project: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (operation) {
      setFormData({
        details: operation.details || '',
        amount: operation.value.toString(),
        categoryId: operation.category,
        accountId: operation.sourceAccount,
        date: operation.date.toISOString().split('T')[0],
        nature: operation.nature,
        state: operation.state,
        paymentMethod: operation.paymentMethod,
        sourceAccount: operation.sourceAccount,
        destinationAccount: operation.destinationAccount,
        project: operation.project || '',
      });
    }
  }, [operation]);

  const validateForm = (): ValidationResult => {
    const newErrors: Record<string, string> = {};

    if (!formData.details.trim()) {
      newErrors.details = 'Descrição é obrigatória';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Valor é obrigatório';
    } else {
      const amountValue = parseFloat(formData.amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        newErrors.amount = 'Valor deve ser um número positivo';
      }
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Categoria é obrigatória';
    }

    if (!formData.accountId) {
      newErrors.accountId = 'Conta é obrigatória';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    if (!formData.destinationAccount) {
      newErrors.destinationAccount = 'Conta de destino é obrigatória';
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
      if (operation) {
        onSubmit({
          ...formData,
          id: operation.id,
        } as UpdateOperationData);
      } else {
        onSubmit(formData);
      }
    }
  };

  const formatAmount = (value: string): string => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return numericValue;
  };

  const getOperationSummary = (): string => {
    if (!formData.details || !formData.amount) {
      return '';
    }

    const amount = parseFloat(formData.amount);
    const category = categories.find(c => c.id === formData.categoryId);
    const account = accounts.find(a => a.id === formData.accountId);

    const natureText = formData.nature === 'receita' ? 'Receita' : 'Despesa';
    
    const categoryText = category ? ` - ${category.name}` : '';
    const accountText = account ? ` (${account.name})` : '';

    return `${natureText}${categoryText}${accountText}`;
  };

  const filteredCategories = categories.filter(cat => cat.type === (formData.nature === 'receita' ? 'income' : 'expense'));

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
        {operation ? 'Editar Operação' : 'Nova Operação'}
      </Text>

      <View style={styles.form}>
        {/* Descrição */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, errors.details && styles.inputError]}
            value={formData.details}
            onChangeText={(text) => setFormData({ ...formData, details: text })}
            placeholder="Digite a descrição"
            editable={!loading}
          />
          {errors.details && (
            <Text style={styles.errorText}>{errors.details}</Text>
          )}
        </View>

        {/* Valor */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Valor</Text>
          <TextInput
            style={[styles.input, errors.amount && styles.inputError]}
            value={formData.amount}
            onChangeText={(text) => setFormData({ ...formData, amount: formatAmount(text) })}
            placeholder="0,00"
            keyboardType="numeric"
            editable={!loading}
          />
          {errors.amount && (
            <Text style={styles.errorText}>{errors.amount}</Text>
          )}
        </View>

        {/* Categoria */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.categoryId}
              onValueChange={(value: any) => setFormData({ ...formData, categoryId: value })}
              style={styles.picker}
              enabled={!loading}
            >
              <Picker.Item label="Selecione uma categoria" value="" />
              {filteredCategories.map((category) => (
                <Picker.Item
                  key={category.id}
                  label={category.name}
                  value={category.id}
                />
              ))}
            </Picker>
          </View>
          {errors.categoryId && (
            <Text style={styles.errorText}>{errors.categoryId}</Text>
          )}
        </View>

        {/* Conta */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Conta</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.accountId}
              onValueChange={(value: any) => setFormData({ ...formData, accountId: value })}
              style={styles.picker}
              enabled={!loading}
            >
              <Picker.Item label="Selecione uma conta" value="" />
              {accounts.map((account) => (
                <Picker.Item
                  key={account.id}
                  label={account.name}
                  value={account.id}
                />
              ))}
            </Picker>
          </View>
          {errors.accountId && (
            <Text style={styles.errorText}>{errors.accountId}</Text>
          )}
        </View>

        {/* Data */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Data</Text>
          <TextInput
            style={[styles.input, errors.date && styles.inputError]}
            value={formData.date}
            onChangeText={(text) => setFormData({ ...formData, date: text })}
            placeholder="YYYY-MM-DD"
            editable={!loading}
          />
          {errors.date && (
            <Text style={styles.errorText}>{errors.date}</Text>
          )}
        </View>

        {/* Natureza */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Natureza</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.nature}
              onValueChange={(value: any) => setFormData({ ...formData, nature: value })}
              style={styles.picker}
              enabled={!loading}
            >
              <Picker.Item label="Variável" value="variable" />
              <Picker.Item label="Fixa" value="fixed" />
            </Picker>
          </View>
        </View>

        {/* Estado */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Estado</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.state}
              onValueChange={(value: any) => setFormData({ ...formData, state: value })}
              style={styles.picker}
              enabled={!loading}
            >
              <Picker.Item label="Concluída" value="completed" />
              <Picker.Item label="Pendente" value="pending" />
              <Picker.Item label="Cancelada" value="cancelled" />
            </Picker>
          </View>
        </View>

        {/* Método de Pagamento */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Método de Pagamento</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.paymentMethod}
              onValueChange={(value: any) => setFormData({ ...formData, paymentMethod: value })}
              style={styles.picker}
              enabled={!loading}
            >
              <Picker.Item label="Dinheiro" value="cash" />
              <Picker.Item label="Cartão de Crédito" value="credit_card" />
              <Picker.Item label="Cartão de Débito" value="debit_card" />
              <Picker.Item label="PIX" value="pix" />
              <Picker.Item label="Transferência" value="transfer" />
            </Picker>
          </View>
        </View>

        {/* Conta de Destino */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Conta de Destino</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.destinationAccount}
              onValueChange={(value: any) => setFormData({ ...formData, destinationAccount: value })}
              style={styles.picker}
              enabled={!loading}
            >
              <Picker.Item label="Selecione uma conta" value="" />
              {accounts.map((account) => (
                <Picker.Item
                  key={account.id}
                  label={account.name}
                  value={account.id}
                />
              ))}
            </Picker>
          </View>
          {errors.destinationAccount && (
            <Text style={styles.errorText}>{errors.destinationAccount}</Text>
          )}
        </View>

        {/* Detalhes */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Detalhes (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.details}
            onChangeText={(text) => setFormData({ ...formData, details: text })}
            placeholder="Informações adicionais"
            multiline
            numberOfLines={3}
            editable={!loading}
          />
        </View>

        {/* Resumo */}
        {getOperationSummary() && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryLabel}>Resumo:</Text>
            <Text style={styles.summaryText}>{getOperationSummary()}</Text>
          </View>
        )}

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {operation ? 'Atualizar' : 'Criar'}
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
  inputError: {
    borderColor: '#f44336',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  summaryContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 16,
    color: '#1976d2',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: '#4caf50',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
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
});

export default OperationForm;
