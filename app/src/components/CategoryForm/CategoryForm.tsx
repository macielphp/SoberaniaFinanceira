import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Category as CleanCategory, CategoryType } from '../../clean-architecture/domain/entities/Category';
import { useCategoryViewModelAdapter } from '../../clean-architecture/presentation/ui-adapters/useCategoryViewModelAdapter';

interface CategoryFormProps {
  category?: CleanCategory;
  onCancel?: () => void;
  onSave?: (categoryData: { name: string; type: CategoryType }) => void;
  onDelete?: (category: CleanCategory) => void;
  loading?: boolean;
  error?: string | null;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onCancel,
  onSave,
  onDelete,
  loading = false,
  error
}) => {
  const { createCategory, updateCategory, deleteCategory } = useCategoryViewModelAdapter();
  const [name, setName] = useState(category?.name || '');
  const [type, setType] = useState<CategoryType>(category?.type || 'expense');
  const [isDefault, setIsDefault] = useState(category?.isDefault || false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Nome da categoria é obrigatório');
      return;
    }

    if (name.trim().length < 3) {
      Alert.alert('Erro', 'Nome deve ter pelo menos 3 caracteres');
      return;
    }

    try {
      if (category) {
        // Atualizar categoria existente
        const updatedCategory = new CleanCategory({
          id: category.id,
          name: name.trim(),
          type,
          isDefault,
        });
        await updateCategory(updatedCategory);
      } else {
        // Criar nova categoria
        const newCategoryProps = {
          name: name.trim(),
          type,
          isDefault,
        };
        await createCategory(newCategoryProps);
      }

      // Limpar formulário
      setName('');
      setType('expense');
      setIsDefault(false);

      if (onSave) {
        onSave({ name: name.trim(), type });
      }
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro ao salvar categoria');
    }
  };

  const handleDelete = () => {
    if (!category) return;

    Alert.alert(
      'Confirmar exclusão',
      `Deseja realmente excluir a categoria "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteCategory(category);
              if (onDelete) {
                onDelete(category);
              }
            } catch (error) {
              Alert.alert('Erro', 'Erro ao excluir categoria');
            }
          }
        }
      ]
    );
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {category ? 'Editar Categoria' : 'Nova Categoria'}
        </Text>
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.form}>
        <Text style={styles.label}>Nome da Categoria</Text>
        <TextInput
          style={[styles.input, loading && styles.disabledInput]}
          value={name}
          onChangeText={setName}
          placeholder="Ex: Alimentação, Transporte..."
          maxLength={50}
          autoFocus
          editable={!loading}
        />

        <Text style={styles.label}>Tipo</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={type}
            onValueChange={(value) => setType(value as CategoryType)}
            style={[styles.picker, loading && styles.disabledPicker]}
            enabled={!loading}
          >
            <Picker.Item label="Despesa" value="expense" />
            <Picker.Item label="Receita" value="income" />
          </Picker>
        </View>

        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>Preview:</Text>
          <View style={styles.previewItem}>
            <View style={[styles.previewColor, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.previewText}>{name || 'Nome da categoria'}</Text>
            <Ionicons name="pricetag" size={16} color="#FF6B6B" />
          </View>
        </View>

        <View style={styles.actions}>
          {category && onDelete && (
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleDelete}
              disabled={loading}
            >
              <Ionicons name="trash" size={16} color="#F44336" />
              <Text style={styles.deleteButtonText}>Excluir</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton, (!name.trim() || loading) && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading || !name.trim()}
          >
            <Text style={styles.submitButtonText}>
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  disabledPicker: {
    backgroundColor: '#f5f5f5',
  },
  previewContainer: {
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  previewColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  previewText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default CategoryForm;