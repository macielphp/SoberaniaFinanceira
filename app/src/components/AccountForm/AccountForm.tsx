import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,

} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { Account } from '../../database';

// Lista inicial de contas externas genéricas
const DEFAULT_EXTERNAL_ACCOUNTS = [
  'Supermercado',
  'Farmácia',
  'Universidade/Escola',
  'Transporte',
  'Outros',
];

interface AccountFormProps {
  account?: Account;
  onSubmit: (name: string, type: 'propria' | 'externa', saldo?: number) => Promise<boolean>;
  onCancel: () => void;
  isEditing?: boolean;
}

export const AccountForm: React.FC<AccountFormProps> = ({
  account,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const [type, setType] = useState<'propria' | 'externa'>(account?.type || 'propria');
  const [name, setName] = useState(account?.name || '');
  const [saldo, setSaldo] = useState(account?.saldo?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [externalOptions, setExternalOptions] = useState<string[]>(DEFAULT_EXTERNAL_ACCOUNTS);
  const [showEditExternal, setShowEditExternal] = useState(false);
  const [newExternal, setNewExternal] = useState('');

  const handleSubmit = async () => {
    if (type === 'propria' && !name.trim()) {
      Alert.alert('Erro', 'Nome da conta é obrigatório');
      return;
    }
    if (type === 'externa' && !name.trim()) {
      Alert.alert('Erro', 'Selecione uma conta externa');
      return;
    }
    if (type === 'propria' && saldo && isNaN(Number(saldo))) {
      Alert.alert('Erro', 'Saldo deve ser um número válido');
      return;
    }
    try {
      setLoading(true);
      const success = await onSubmit(name.trim(), type, type === 'propria' ? Number(saldo) : undefined);
      if (success) {
        setName('');
        setSaldo('');
        onCancel();
      }
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExternal = () => {
    if (newExternal.trim() && !externalOptions.includes(newExternal.trim())) {
      setExternalOptions([...externalOptions, newExternal.trim()]);
      setNewExternal('');
    }
  };
  const handleRemoveExternal = (option: string) => {
    setExternalOptions(externalOptions.filter(o => o !== option));
    if (name === option) setName('');
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
        <Text style={styles.label}>Tipo da Conta</Text>
        <Picker
          selectedValue={type}
          onValueChange={setType}
          style={{ marginBottom: 10 }}
        >
          <Picker.Item label="Própria" value="propria" />
          <Picker.Item label="Externa" value="externa" />
        </Picker>
        {type === 'propria' ? (
          <>
            <Text style={styles.label}>Nome da Conta</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Conta Corrente, Poupança..."
              maxLength={50}
              autoFocus
            />
            <Text style={styles.label}>Saldo Inicial</Text>
            <TextInput
              style={styles.input}
              value={saldo}
              onChangeText={setSaldo}
              placeholder="Ex: 1000.00"
              keyboardType="numeric"
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Conta Externa</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Picker
                selectedValue={name}
                onValueChange={setName}
                style={{ flex: 1 }}
              >
                <Picker.Item label="Selecione..." value="" />
                {externalOptions.map(opt => (
                  <Picker.Item key={opt} label={opt} value={opt} />
                ))}
              </Picker>
              <TouchableOpacity onPress={() => setShowEditExternal(!showEditExternal)}>
                <Ionicons name="create-outline" size={22} color="#2196F3" />
              </TouchableOpacity>
            </View>
            {showEditExternal && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.label}>Editar opções externas</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={newExternal}
                    onChangeText={setNewExternal}
                    placeholder="Nova opção"
                  />
                  <TouchableOpacity onPress={handleAddExternal}>
                    <Ionicons name="add-circle" size={24} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
                {externalOptions.map(opt => (
                  <View key={opt} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ flex: 1 }}>{opt}</Text>
                    <TouchableOpacity onPress={() => handleRemoveExternal(opt)}>
                      <Ionicons name="remove-circle" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
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
            disabled={loading || (type === 'propria' ? !name.trim() : !name.trim())}
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