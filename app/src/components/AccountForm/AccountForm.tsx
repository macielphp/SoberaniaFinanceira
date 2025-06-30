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
import { Account } from '../../database/Index';


interface AccountFormProps {
    account?: Account;
    onSubmit: (name: string) => Promise<boolean>;
    onCancel: () => void;
    isEditing?: boolean;
  }
  
  export const AccountForm: React.FC<AccountFormProps> = ({
    account,
    onSubmit,
    onCancel,
    isEditing = false
  }) => {
    const [name, setName] = useState(account?.name || '');
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async () => {
      if (!name.trim()) {
        Alert.alert('Erro', 'Nome da conta é obrigatório');
        return;
      }
  
      try {
        setLoading(true);
        const success = await onSubmit(name.trim());
        if (success) {
          setName('');
          onCancel();
        }
      } catch (error) {
        Alert.alert('Erro', error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? 'Editar Conta' : 'Nova Conta'}
          </Text>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
  
        <View style={styles.form}>
          <Text style={styles.label}>Nome da Conta</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Conta Corrente, Poupança..."
            maxLength={50}
            autoFocus
          />
  
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
  
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading || !name.trim()}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
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
    marginHorizontal: 20,
    marginVertical: 50,
    shadowColor: '#000',
    shadowOffset: {
    width: 0,
    height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
form: {
    gap: 15,
},
label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
},
input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
},
actions: {
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
cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
},
submitButton: {
    backgroundColor: '#4CAF50',
},
cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
},
submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
},
});