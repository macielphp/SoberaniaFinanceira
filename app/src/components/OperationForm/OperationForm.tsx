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
  Image,
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
import { colors, spacing, typography} from '../../styles/themes';
import { componentSpacing } from '../../styles/themes/spacing'; 
import { buttonStyles, formStyles } from '../../styles/components'
import AppModal from '../AppModal/AppModal';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system';

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
    getCategoryNamesByType,
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

  // Determinar o tipo de receipt baseado na operação em edição
  const getInitialReceiptType = (): 'text' | 'media' => {
    if (editOperation?.receipt instanceof Uint8Array) {
      return 'media';
    }
    return 'text';
  };

  const [receiptType, setReceiptType] = useState<'text' | 'media'>(getInitialReceiptType());
  const [receiptText, setReceiptText] = useState(
    typeof editOperation?.receipt === 'string' ? editOperation.receipt : ''
  );
  const [receiptMedia, setReceiptMedia] = useState<Uint8Array | undefined>(
    editOperation?.receipt instanceof Uint8Array ? editOperation.receipt : undefined
  );
  const [receiptImageUri, setReceiptImageUri] = useState<string | undefined>(
    undefined
  );
  const [showReceiptOptions, setShowReceiptOptions] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Função para converter Uint8Array para URI temporária
  const convertUint8ArrayToUri = async (uint8Array: Uint8Array): Promise<string> => {
    try {
      const fileName = `receipt_${Date.now()}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      // Converter Uint8Array para base64 de forma mais robusta
      let binaryString = '';
      const len = uint8Array.length;
      for (let i = 0; i < len; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binaryString);
      
      // Salvar no cache do sistema
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('✅ Arquivo temporário criado:', fileUri);
      return fileUri;
    } catch (error) {
      console.error('❌ Erro ao converter Uint8Array para URI:', error);
      
      // Tentar método alternativo se o primeiro falhar
      try {
        console.log('🔄 Tentando método alternativo...');
        const fileName = `receipt_alt_${Date.now()}.jpg`;
        const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
        
        // Usar Buffer se disponível (React Native)
        const base64 = Buffer.from(uint8Array).toString('base64');
        
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        console.log('✅ Arquivo temporário criado (método alternativo):', fileUri);
        return fileUri;
      } catch (altError) {
        console.error('❌ Método alternativo também falhou:', altError);
        throw new Error('Falha ao processar imagem para visualização');
      }
    }
  };

  // Inicializar receiptImageUri quando há uma operação em edição com imagem
  useEffect(() => {
    const initializeReceiptImage = async () => {
      if (editOperation?.receipt instanceof Uint8Array) {
        try {
          console.log('🔄 Inicializando imagem de recibo para edição...');
          const uri = await convertUint8ArrayToUri(editOperation.receipt);
          setReceiptImageUri(uri);
          console.log('✅ Imagem de recibo inicializada com sucesso');
        } catch (error) {
          console.error('❌ Erro ao inicializar imagem de recibo:', error);
          // Se falhar, volta para tipo texto
          setReceiptType('text');
        }
      }
    };

    initializeReceiptImage();

    // Cleanup: remover arquivo temporário quando componente for desmontado
    return () => {
      if (receiptImageUri && FileSystem.cacheDirectory && receiptImageUri.startsWith(FileSystem.cacheDirectory)) {
        FileSystem.deleteAsync(receiptImageUri, { idempotent: true })
          .then(() => console.log('🗑️ Arquivo temporário removido'))
          .catch(err => console.log('⚠️ Erro ao remover arquivo temporário:', err));
      }
    };
  }, [editOperation]);

  // Categories that support double operations
  const doubleOperationCategories = [
    'Movimentação interna',
    'Adiantamento-pessoal',
    'Reparação'
  ];

  // Get dynamic data from database
  const categoryNames = getCategoryNames();
  const categoryNamesByType = getCategoryNamesByType(nature === 'receita' ? 'income' : 'expense');
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
      // Log para debug do campo receipt
      console.log('📋 Debug do campo receipt:');
      console.log('  - receiptType:', receiptType);
      console.log('  - receiptText:', receiptText);
      console.log('  - receiptMedia:', receiptMedia ? `Uint8Array(${receiptMedia.length} bytes)` : 'undefined');
      console.log('  - receipt (final):', receipt ? (typeof receipt === 'string' ? `string(${receipt.length})` : `Uint8Array(${receipt.length} bytes)`) : 'undefined');

      if (editOperation) {
        const operationData = {
          id: editOperation.id,
          user_id: editOperation.user_id || 'user-1',
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

        console.log('🔄 Atualizando operação com receipt:', operationData.receipt ? 'presente' : 'ausente');
        await updateOperation(operationData);
        Alert.alert('Sucesso', 'Operação atualizada com sucesso!')
      } else {
        const operationData = {
          user_id: 'user-1', // Default user ID
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
        
        console.log('🔄 Criando operação com receipt:', operationData.receipt ? 'presente' : 'ausente');
        
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
      console.error('❌ Erro ao salvar operação:', error);
      Alert.alert('Erro', editOperation ? 'Falha ao atualizar operação' : 'Falha ao criar operação');
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
    setReceiptType('text');
    setReceiptText('');
    setReceiptMedia(undefined);
    setReceipt('');
    setProject('');
    setReceiptImageUri(undefined);
  };

  const handleImagePicker = async (useCamera: boolean) => {
    try {
      console.log('🔄 Iniciando seleção de imagem...');
      
      const { status } = useCamera 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      console.log('📱 Status da permissão:', status);
      
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão necessária para acessar a câmera/galeria');
        return;
      }

      console.log('📸 Lançando picker...');
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: undefined,
          quality: 0.8,
        })
        : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: undefined,
          quality: 0.8,
        });

      console.log('📋 Resultado do picker:', result);

      if (!result.canceled && result.assets[0]) {
        console.log('🖼️ Imagem selecionada:', result.assets[0].uri);
        
        console.log('🌐 Fazendo fetch da imagem...');
        const response = await fetch(result.assets[0].uri);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('📦 Convertendo para blob...');
        const blob = await response.blob();
        console.log('📦 Tamanho do blob:', blob.size);
        
        // Método compatível com React Native
        console.log('🔄 Convertendo para Uint8Array...');
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
              resolve(reader.result);
            } else {
              reject(new Error('Falha ao ler blob como ArrayBuffer'));
            }
          };
          reader.onerror = () => reject(new Error('Erro ao ler blob'));
          reader.readAsArrayBuffer(blob);
        });
        
        console.log('🔄 Tamanho do ArrayBuffer:', arrayBuffer.byteLength);
        
        console.log('💾 Criando Uint8Array...');
        const uint8Array = new Uint8Array(arrayBuffer);
        console.log('💾 Tamanho do Uint8Array:', uint8Array.length);
        
        setReceiptMedia(uint8Array);
        setReceiptType('media');
        setReceiptImageUri(result.assets[0].uri);
        console.log('✅ Imagem processada com sucesso!');
      } else {
        console.log('❌ Usuário cancelou a seleção');
      }
    } catch (error) {
      console.error('❌ Erro detalhado:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A');
      
      let errorMessage = 'Falha ao processar imagem';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Erro ao carregar a imagem do dispositivo';
        } else if (error.message.includes('blob')) {
          errorMessage = 'Erro ao processar o formato da imagem';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Permissão negada para acessar câmera/galeria';
        } else if (error.message.includes('FileReader')) {
          errorMessage = 'Erro ao processar a imagem no dispositivo';
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }
      
      Alert.alert('Erro', errorMessage);
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
  }, [nature]);

  // Reset category when nature changes
  React.useEffect(() => {
    const availableCategories = getCategoryNamesByType(nature === 'receita' ? 'income' : 'expense');
    if (availableCategories.length > 0 && !availableCategories.includes(category)) {
      setCategory(availableCategories[0]);
    }
  }, [nature, getCategoryNamesByType]);

  // Controlar o valor do receipt baseado no tipo
  React.useEffect(() => {
    if (receiptType === 'text') {
      setReceipt(receiptText);
    } else if (receiptMedia !== undefined) {
      setReceipt(receiptMedia);
    } else {
      setReceipt('');
    }
  }, [receiptType, receiptText, receiptMedia]);

  // Show loading indicator while data is being loaded
  if (dataLoading) {
    return (
      <View style={[GlobalStyles.container, GlobalStyles.centered]}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={GlobalStyles.container}>
      <View style={formStyles.container}>
        {/* Natureza */}
        <View style={styles.fieldContainer}>
          <Text style={formStyles.label}>Natureza</Text>
          <View style={formStyles.input}>
            <Picker
              selectedValue={nature}
              onValueChange={setNature}
            >
              <Picker.Item label="Despesa" value="despesa" />
              <Picker.Item label="Receita" value="receita" />
            </Picker>
          </View>
        </View>

        {/* Estado - only for non-double operations */}
        {!doubleOperationCategories.includes(category) && (
          <View style={styles.fieldContainer}>
            <Text style={formStyles.label}>Estado</Text>
            <View style={formStyles.input}>
              <Picker
                selectedValue={state}
                onValueChange={setState}
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
          <Text style={formStyles.label}>Categoria</Text>
          <View style={formStyles.input}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
            >
              {categoryNamesByType.length > 0 ? (
                categoryNamesByType.map((categoryName) => (
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
          <Text style={formStyles.label}>Forma de Pagamento</Text>
          <View style={formStyles.input}>
            <Picker
              selectedValue={paymentMethod}
              onValueChange={setPaymentMethod}
            >
              {paymentMethods.map((method) => (
                <Picker.Item key={method} label={method} value={method} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Source Account - Dynamic from database */}
        <View style={styles.fieldContainer}>
          <Text style={formStyles.label}>Conta de Origem</Text>
          <View style={formStyles.input}>
            <Picker
              selectedValue={sourceAccount}
              onValueChange={setSourceAccount}
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
          <Text style={formStyles.label}>Conta de Destino</Text>
          <View style={formStyles.input}>
            <Picker
              selectedValue={destinationAccount}
              onValueChange={setDestinationAccount}
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
          <Text style={formStyles.label}>Valor (R$)</Text>
          <TextInput
            style={formStyles.input}
            value={value}
            onChangeText={setValue}
            placeholder="0,00"
            keyboardType="numeric"
            returnKeyType="next"
          />
        </View>

        {/* Data */}
        <View style={styles.fieldContainer}>
          <Text style={formStyles.label}>Data</Text>
          <TextInput
            style={formStyles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            returnKeyType="next"
          />
        </View>

        {/* Details */}
        <View style={styles.fieldContainer}>
          <Text style={formStyles.label}>Detalhes (Opcional)</Text>
          <TextInput
            style={[ formStyles.input ,formStyles.textArea]}
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
          <Text style={formStyles.label}>Recibo (Opcional)</Text>
          
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
              onPress={() => {
                if (receiptMedia) {
                  // Se já há uma imagem, mostrar preview
                  setShowImagePreview(true);
                } else {
                  // Se não há imagem, mostrar opções para selecionar
                  setShowReceiptOptions(true);
                }
              }}
            >
              <Text style={[
                styles.receiptTypeButtonText,
                receiptType === 'media' && styles.receiptTypeButtonTextActive
              ]}>
                {receiptMedia ? 'Imagem ✓' : 'Imagem'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Campo de texto ou indicador de mídia */}
          {receiptType === 'text' ? (
            <TextInput
              style={formStyles.input}
              value={receiptText}
              onChangeText={setReceiptText}
              placeholder="Número ou referência do recibo"
              returnKeyType="next"
            />
          ) : (
            <View style={styles.mediaIndicator}>
              <TouchableOpacity
                style={styles.mediaIndicatorContent}
                onPress={() => {
                  if (receiptImageUri) {
                    setShowImagePreview(true);
                  }
                }}
                disabled={!receiptImageUri}
              >
                <Text style={styles.mediaIndicatorText}>
                  {receiptImageUri ? '✓ Imagem anexada (clique para visualizar)' : 'Nenhuma imagem selecionada'}
                </Text>
                {receiptImageUri && (
                  <Ionicons name="eye" size={20} color={colors.primary[500]} />
                )}
              </TouchableOpacity>
              {receiptMedia && (
                <TouchableOpacity
                  style={styles.removeMediaButton}
                  onPress={() => {
                    setReceiptMedia(undefined);
                    setReceiptImageUri(undefined);
                    setReceiptType('text');
                  }}
                >
                  <Text style={styles.removeMediaButtonText}>Remover</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <AppModal
          visible={showReceiptOptions}
          onRequestClose={() => setShowReceiptOptions(false)}
          title="Selecionar Recibo"
          footer={null} 
        >
          <TouchableOpacity 
            style={GlobalStyles.modalOption}
            onPress={() => handleImagePicker(true)}
          >
            <Text>📷 Tirar Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={GlobalStyles.modalOption}
            onPress={() => handleImagePicker(false)}
          >
            <Text>📁 Escolher da Galeria</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowReceiptOptions(false)}></TouchableOpacity>
        </AppModal>

        {/* Modal de visualização da imagem */}
        <Modal
          visible={showImagePreview}
          transparent
          animationType="fade"
          onRequestClose={() => setShowImagePreview(false)}
        >
          <View style={styles.imagePreviewOverlay}>
            <View style={styles.imagePreviewContainer}>
              <View style={styles.imagePreviewHeader}>
                <Text style={styles.imagePreviewTitle}>Visualizar Recibo</Text>
                <TouchableOpacity
                  style={styles.imagePreviewCloseButton}
                  onPress={() => setShowImagePreview(false)}
                >
                  <Ionicons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
              {receiptImageUri && (
                <View style={styles.imagePreviewContent}>
                  <Image
                    source={{ uri: receiptImageUri }}
                    style={styles.imagePreview}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Project */}
        <View style={styles.fieldContainer}>
          <Text style={formStyles.label}>Projeto (Opcional)</Text>
          <TextInput
            style={formStyles.input}
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
            buttonStyles.base,
            buttonStyles.primary,
            (isLoading || categoryNames.length === 0 || accountNames.length === 0) && buttonStyles.disabled
          ]}
          onPress={handleSubmit}
          disabled={isLoading || categoryNames.length === 0 || accountNames.length === 0}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <Text style={[typography.body1, { color: colors.text.inverse, fontWeight: 'bold' }]}> 
              {editOperation ? 'Atualizar Operação' : 'Criar Operação'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Reset Button */}
        <TouchableOpacity
          style={[buttonStyles.base, buttonStyles.secondary]}
          onPress={resetForm}
          disabled={isLoading}
        >
          <Text style={[typography.body1, { color: colors.text.inverse, fontWeight: 'bold' }]}>Limpar Formulário</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingText: {
    marginTop: spacing.sm,
    ...typography.body2,
    color: colors.text.secondary,
  },
  fieldContainer: {
    marginBottom: spacing.md,
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
  mediaIndicatorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
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
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  imagePreviewContainer: {
    backgroundColor: colors.background.default,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  imagePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  imagePreviewTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
  },
  imagePreviewCloseButton: {
    padding: spacing.xs,
  },
  imagePreviewContent: {
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: 8,
  },
});

export default OperationForm;