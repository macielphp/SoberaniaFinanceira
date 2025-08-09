import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
// Mock Picker for testing
const Picker = ({ selectedValue, onValueChange, children, style, enabled }: any) => {
  return null;
};
Picker.Item = ({ label, value }: any) => null;

import { Category } from '../../domain/entities/Category';

export interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CreateCategoryData | UpdateCategoryData) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
  error?: string;
}

export interface CreateCategoryData {
  name: string;
  type: 'income' | 'expense';
  isDefault: boolean;
}

export interface UpdateCategoryData extends CreateCategoryData {
  id: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  onDelete,
  loading = false,
  error,
}) => {
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    type: 'expense',
    isDefault: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        type: category.type,
        isDefault: category.isDefault || false,
      });
    }
  }, [category]);

  const validateForm = (): ValidationResult => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Nome deve conter apenas letras e espaços';
    }

    // O tipo sempre tem um valor padrão, então não precisa validar como obrigatório
    // Mas vamos manter a validação para casos futuros onde isso possa mudar
    if (!formData.type || (formData.type !== 'income' && formData.type !== 'expense')) {
      newErrors.type = 'Tipo é obrigatório';
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
      if (category) {
        onSubmit({
          ...formData,
          id: category.id,
        } as UpdateCategoryData);
      } else {
        onSubmit(formData);
      }
    }
  };

  const handleDelete = () => {
    if (category && onDelete) {
      onDelete(category.id);
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
        {category ? 'Editar Categoria' : 'Nova Categoria'}
      </Text>

      <View style={styles.form}>
        {/* Nome */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Digite o nome da categoria"
            editable={!loading}
          />
          {errors.name && (
            <Text style={styles.errorText}>{errors.name}</Text>
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
              <Picker.Item label="Receita" value="income" />
              <Picker.Item label="Despesa" value="expense" />
            </Picker>
          </View>
          {errors.type && (
            <Text style={styles.errorText}>{errors.type}</Text>
          )}
        </View>

        {/* Padrão */}
        <View style={styles.fieldContainer}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Padrão</Text>
            <Switch
              value={formData.isDefault}
              onValueChange={(value) => setFormData({ ...formData, isDefault: value })}
              disabled={loading}
            />
          </View>
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

          {category && onDelete && (
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
              {category ? 'Atualizar' : 'Criar'}
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
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

export default CategoryForm;
