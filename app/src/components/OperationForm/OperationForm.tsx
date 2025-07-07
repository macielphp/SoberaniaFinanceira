// app\src\components\OperationForm\OperationForm.tsx
import React, { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFinance } from '../../contexts/FinanceContext';
import { 
  Nature, 
  PaymentMethod, 
  Category, 
  State,
  Operation 
} from '../../services/FinanceService';
import GlobalStyles from '../../styles/Styles';
import colors from '../../styles/themes/colors';
import { spacing, componentSpacing } from '../../styles/themes/spacing';
import typography from '../../styles/themes/typography';


interface OperationFormProps {
  onSuccess?: () => void;
  editOperation?: Operation;
}

export const OperationForm: React.FC<OperationFormProps> = ({ 
  onSuccess, 
  editOperation 
}) => {
  const { 
    createSimpleOperation, 
    createDoubleOperation, 
    updateOperationState,
    updateOperation,
    getCategoryNames,
    getAccountNames,
    categories,
    accounts,
    loading: dataLoading
  } = useFinance();
  
  // Form state
  const [nature, setNature] = useState<Nature>(editOperation?.nature || 'despesa');
  const [state, setState] = useState<State>(editOperation?.state || 'pagar');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    editOperation?.paymentMethod || 'Pix'
  );
  const [sourceAccount, setSourceAccount] = useState(editOperation?.sourceAccount || '');
  const [destinationAccount, setDestinationAccount] = useState(editOperation?.destinationAccount || '');
  const [date, setDate] = useState(editOperation?.date || new Date().toISOString().split('T')[0]);
  const [value, setValue] = useState(editOperation?.value?.toString() || '');
  const [category, setCategory] = useState<string>(
    editOperation?.category || (getCategoryNames()[0] || 'Alimento-supermercado')
  );
  const [details, setDetails] = useState(editOperation?.details || '');
  const [receipt, setReceipt] = useState(editOperation?.receipt || '');
  const [project, setProject] = useState(editOperation?.project || '');
  const [isLoading, setIsLoading] = useState(false);

  const [receiptType, setReceiptType] = useState<'text' | 'media'>('text');
  const [receiptText, setReceiptText] = useState(
    typeof editOperation?.receipt === 'string' ? editOperation.receipt : ''
  );
  const [receiptMedia, setReceiptMedia] = useState<Uint8Array | undefined>(
    editOperation?.receipt instanceof Uint8Array ? editOperation.receipt : undefined
  );
  const [showReceiptOptions, setShowReceiptOptions] = useState(false);


  // Categories that support double operations
  const doubleOperationCategories = [
    'Movimentação interna',
    'Adiantamento-pessoal',
    'Reparação'
  ];

  // Get dynamic data from database
  const categoryNames = getCategoryNames();
  const accountNames = getAccountNames();

  const paymentMethods: PaymentMethod[] = [
    'Cartão de débito',
    'Cartão de crédito',
    'Pix',
    'TED',
    'Estorno',
    'Transferência bancária'
  ];

  const validateForm = (): boolean => {
    if (!sourceAccount.trim()) {
      Alert.alert('Erro', 'Conta de origem é obrigatória');
      return false;
    }

    if (!destinationAccount.trim() && category !== 'Movimentação interna') {
      Alert.alert('Erro', 'Conta de destino é obrigatória');
      return false;
    }

    if (!value.trim() || parseFloat(value) <= 0) {
      Alert.alert('Erro', 'Valor deve ser maior que zero');
      return false;
    }
    
    if (!date.trim()) {
      Alert.alert('Erro', 'Data é obrigatória');
      return false;
    }

    if (!category.trim()) {
      Alert.alert('Erro', 'Categoria é obrigatória');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      if (editOperation) {
        const operationData = {
          id: editOperation.id,
          nature,
          paymentMethod,
          sourceAccount: sourceAccount.trim(),
          destinationAccount: destinationAccount.trim(),
          date,
          value: parseFloat(value),
          category: category as Category,
          details: details.trim() || undefined,
          receipt: receipt || undefined,
          project: project.trim() || undefined,
          state, // Include updated state
        };

        await updateOperation(operationData);
        Alert.alert('Sucesso', 'Operação atualizada com sucesso!')
      } else {
        const operationData = {
          nature,
          paymentMethod,
          sourceAccount: sourceAccount.trim(),
          destinationAccount: destinationAccount.trim(),
          date,
          value: parseFloat(value),
          category: category as Category,
          details: details.trim() || undefined,
          receipt: receipt || undefined,
          project: project.trim() || undefined,
          state,
        }
        if (doubleOperationCategories.includes(category)) {
          await createDoubleOperation(operationData);
          Alert.alert('Sucesso', 'Operação dupla criada com sucesso!');
        } else {
          await createSimpleOperation(operationData);
          Alert.alert('Sucesso', 'Operação criada com sucesso!');
        }
      }

      // Reset form
      resetForm();
      onSuccess?.();
    } catch (error) {
      Alert.alert('Erro', editOperation ? 'Falha ao atualizar operação' : 'Falha ao criar operação');
      console.error('Error creating operation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNature('despesa');
    setState('pagar');
    setPaymentMethod('Pix');
    setSourceAccount('');
    setDestinationAccount('');
    setDate(new Date().toISOString().split('T')[0]);
    setValue('');
    setCategory(categoryNames[0] || 'Alimento-supermercado');
    setDetails('');
    setReceiptType('text'); // Adicionar esta linha
    setReceiptText(''); // Adicionar esta linha
    setReceiptMedia(undefined); // Adicionar esta linha
    setReceipt(''); 
    setProject('');
  };

  const handleImagePicker = async (useCamera: boolean) => {
    try {
      const { status } = useCamera 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão necessária para acessar a câmera/galeria');
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        setReceiptMedia(uint8Array);
        setReceiptType('media');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao processar imagem');
    } finally {
      setShowReceiptOptions(false);
    }
  };


  // Auto-set estado based on natureza
  React.useEffect(() => {
    if (nature === 'despesa') {
      setState('pagar');
    } else {
      setState('receber');
    }
    if (receiptType === 'text') {
      setReceipt(receiptText);
    } else if (receiptMedia !== undefined) {
      setReceipt(receiptMedia);
    } else {
      setReceipt('');
    }
  }, [nature, receiptType, receiptText, receiptMedia]);

  // Show loading indicator while data is being loaded
  if (dataLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  } 

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Natureza */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Natureza</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={nature}
              onValueChange={setNature}
              style={styles.picker}
            >
              <Picker.Item label="Despesa" value="despesa" />
              <Picker.Item label="Receita" value="receita" />
            </Picker>
          </View>
        </View>

        {/* Estado - only for non-double operations */}
        {!doubleOperationCategories.includes(category) && (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Estado</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={state}
                onValueChange={setState}
                style={styles.picker}
              >
                <Picker.Item label="A Pagar" value="pagar" />
                <Picker.Item label="Pago" value="pago" />
                <Picker.Item label="A Receber" value="receber" />
                <Picker.Item label="Recebido" value="recebido" />
              </Picker>
            </View>
          </View>
        )}

        {/* Category - Dynamic from database */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}
            >
              {categoryNames.length > 0 ? (
                categoryNames.map((categoryName) => (
                  <Picker.Item key={categoryName} label={categoryName} value={categoryName} />
                ))
              ) : (
                <Picker.Item label="Nenhuma categoria disponível" value="" />
              )}
            </Picker>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Forma de Pagamento</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={paymentMethod}
              onValueChange={setPaymentMethod}
              style={styles.picker}
            >
              {paymentMethods.map((method) => (
                <Picker.Item key={method} label={method} value={method} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Source Account - Dynamic from database */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Conta de Origem</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={sourceAccount}
              onValueChange={setSourceAccount}
              style={styles.picker}
            >
              <Picker.Item label="Selecione uma conta" value="" />
              {accountNames.length > 0 ? (
                accountNames.map((accountName) => (
                  <Picker.Item key={accountName} label={accountName} value={accountName} />
                ))
              ) : (
                <Picker.Item label="Nenhuma conta disponível" value="" />
              )}
            </Picker>
          </View>
        </View>

        {/* Destination Account - Dynamic from database */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Conta de Destino</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={destinationAccount}
              onValueChange={setDestinationAccount}
              style={styles.picker}
            >
              <Picker.Item label="Selecione uma conta" value="" />
              {accountNames.length > 0 ? (
                accountNames.map((accountName) => (
                  <Picker.Item key={accountName} label={accountName} value={accountName} />
                ))
              ) : (
                <Picker.Item label="Nenhuma conta disponível" value="" />
              )}
            </Picker>
          </View>
        </View>

        {/* Value */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Valor (R$)</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder="0,00"
            keyboardType="numeric"
            returnKeyType="next"
          />
        </View>

        {/* Data */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Data</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            returnKeyType="next"
          />
        </View>

        {/* Details */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Detalhes (Opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={details}
            onChangeText={setDetails}
            placeholder="Descrição adicional..."
            multiline
            numberOfLines={3}
            returnKeyType="next"
          />
        </View>

        {/* Receipt */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Recibo (Opcional)</Text>
          
          {/* Botões de seleção de tipo */}
          <View style={styles.receiptTypeContainer}>
            <TouchableOpacity
              style={[
                styles.receiptTypeButton,
                receiptType === 'text' && styles.receiptTypeButtonActive
              ]}
              onPress={() => setReceiptType('text')}
            >
              <Text style={[
                styles.receiptTypeButtonText,
                receiptType === 'text' && styles.receiptTypeButtonTextActive
              ]}>
                Texto
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.receiptTypeButton,
                receiptType === 'media' && styles.receiptTypeButtonActive
              ]}
              onPress={() => setShowReceiptOptions(true)}
            >
              <Text style={[
                styles.receiptTypeButtonText,
                receiptType === 'media' && styles.receiptTypeButtonTextActive
              ]}>
                Imagem
              </Text>
            </TouchableOpacity>
          </View>

          {/* Campo de texto ou indicador de mídia */}
          {receiptType === 'text' ? (
            <TextInput
              style={styles.input}
              value={receiptText}
              onChangeText={setReceiptText}
              placeholder="Número ou referência do recibo"
              returnKeyType="next"
            />
          ) : (
            <View style={styles.mediaIndicator}>
              <Text style={styles.mediaIndicatorText}>
                {receiptMedia ? '✓ Imagem anexada' : 'Nenhuma imagem selecionada'}
              </Text>
              {receiptMedia && (
                <TouchableOpacity
                  style={styles.removeMediaButton}
                  onPress={() => {
                    setReceiptMedia(undefined);
                    setReceiptType('text');
                  }}
                >
                  <Text style={styles.removeMediaButtonText}>Remover</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Modal para opções de imagem */}
        <Modal
          visible={showReceiptOptions}
          transparent
          animationType="slide"
          onRequestClose={() => setShowReceiptOptions(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecionar Recibo</Text>
              
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleImagePicker(true)}
              >
                <Text style={styles.modalOptionText}>📷 Tirar Foto</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleImagePicker(false)}
              >
                <Text style={styles.modalOptionText}>📁 Escolher da Galeria</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowReceiptOptions(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Project */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Projeto (Opcional)</Text>
          <TextInput
            style={styles.input}
            value={project}
            onChangeText={setProject}
            placeholder="Nome do projeto"
            returnKeyType="done"
          />
        </View>

        {/* Double Operation Info */}
        {doubleOperationCategories.includes(category) && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              ℹ️ Esta categoria criará automaticamente duas operações relacionadas.
            </Text>
          </View>
        )}

        {/* Data Status Info */}
        {(categoryNames.length === 0 || accountNames.length === 0) && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              ⚠️ {categoryNames.length === 0 ? 'Nenhuma categoria encontrada. ' : ''}
              {accountNames.length === 0 ? 'Nenhuma conta encontrada. ' : ''}
              Verifique se os dados foram carregados corretamente.
            </Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton, 
            (isLoading || categoryNames.length === 0 || accountNames.length === 0) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isLoading || categoryNames.length === 0 || accountNames.length === 0}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>
              {editOperation ? 'Atualizar Operação' : 'Criar Operação'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Reset Button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetForm}
          disabled={isLoading}
        >
          <Text style={styles.resetButtonText}>Limpar Formulário</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    padding: componentSpacing.form.horizontal,
    paddingBottom: componentSpacing.form.vertical,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.sm,
    ...typography.body2,
    color: colors.text.secondary,
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body2,
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    backgroundColor: colors.background.default,
    minHeight: 44,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.background.default,
  },
  picker: {
    height: 50,
  },
  infoContainer: {
    backgroundColor: colors.secondary[50],
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  infoText: {
    ...typography.body2,
    color: colors.secondary[700],
  },
  warningContainer: {
    backgroundColor: colors.warning[50],
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderLeftColor: colors.warning[500],
    borderLeftWidth: 4,
  },
  warningText: {
    ...typography.body2,
    color: colors.warning[700],
  },
  submitButton: {
    backgroundColor: colors.primary[500],
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  submitButtonText: {
    color: colors.text.inverse,
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: 'transparent',
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  resetButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  receiptTypeContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  receiptTypeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.background.default,
    alignItems: 'center',
    marginRight: spacing.sm,
    borderRadius: 6,
  },
  receiptTypeButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  receiptTypeButtonText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  receiptTypeButtonTextActive: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  mediaIndicator: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.background.default,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaIndicatorText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  removeMediaButton: {
    backgroundColor: colors.error[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  removeMediaButtonText: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.default,
    padding: spacing.lg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: colors.text.primary,
  },
  modalOption: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.text.primary,
  },
  modalCancel: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.gray[200],
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  modalCancelText: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.text.secondary,
    fontWeight: '600',
  },
});

export default OperationForm;