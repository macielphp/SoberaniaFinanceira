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
import { useOperationViewModelAdapter } from '../../clean-architecture/presentation/ui-adapters/useOperationViewModelAdapter';
import { 
  Nature, 
  PaymentMethod, 
  Category, 
  State,
  Operation 
} from '../../services/FinanceService';
import { OperationFormValidationService, OperationFormState } from '../../services/OperationFormValidationService';
import { AccountService } from '../../services/AccountService';
import GlobalStyles from '../../styles/Styles';
import { colors, spacing, typography} from '../../styles/themes';
import { componentSpacing } from '../../styles/themes/spacing'; 
import { buttonStyles, formStyles } from '../../styles/components'
import AppModal from '../AppModal/AppModal';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system';
import DateTimePicker from '@react-native-community/datetimepicker';

interface OperationFormProps {
  onSuccess?: () => void;
  editOperation?: Operation;
}

export const OperationForm: React.FC<OperationFormProps> = ({ 
  onSuccess, 
  editOperation 
}) => {
  const { 
    createOperation,
    createDoubleOperation, 
    updateOperationState,
    updateOperation,
    getCategoryNames,
    getCategoryNamesByType,
    getAccountNames,
    categories,
    accounts,
    operations,
    loading: dataLoading,
  } = useOperationViewModelAdapter();
  
  // Form state
  const [nature, setNature] = useState<Nature>(editOperation?.nature || 'despesa');
  const [state, setState] = useState<State>(editOperation?.state || 'pagar');
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    editOperation?.paymentMethod || 'Pix'
  );
  const [sourceAccount, setSourceAccount] = useState(editOperation?.sourceAccount || '');
  const [destinationAccount, setDestinationAccount] = useState(editOperation?.destinationAccount || '');
  const [date, setDate] = useState(editOperation?.date || new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [value, setValue] = useState(editOperation?.value?.toString() || '');
  const [category, setCategory] = useState<string>(
    editOperation?.category || ''
  );
  const [details, setDetails] = useState(editOperation?.details || '');
  const [receipt, setReceipt] = useState(editOperation?.receipt || '');
  const [goalId, setGoalId] = useState(editOperation?.goal_id || '');
  const [isLoading, setIsLoading] = useState(false);

  // Estado do formulário sequencial
  const [formState, setFormState] = useState<OperationFormState | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  // Atualizar estado do formulário quando valores mudam
  useEffect(() => {
    const currentValues = {
      natureza: nature,
      estado: state,
      categoria: category,
      formaPagamento: paymentMethod,
      contaOrigem: accounts.find(acc => acc.name === sourceAccount),
      contaDestino: accounts.find(acc => acc.name === destinationAccount),
      valor: value ? parseFloat(value) : undefined,
      data: date ? new Date(date) : undefined
    };

    const newFormState = OperationFormValidationService.gerarEstadoFormulario(
      currentValues,
      categories,
      accounts,
      operations
    );

    setFormState(newFormState);
  }, [nature, state, category, paymentMethod, sourceAccount, destinationAccount, value, date, categories, accounts, operations]);

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

  // Categories that support double operations (but still need Estado field for editing)
  const doubleOperationCategories = [
    'Movimentação interna',
    'Adiantamento-pessoal',
    'Reparação'
  ];

  // Get dynamic data from database
  const categoryNames = getCategoryNames();
  const categoryNamesByType = getCategoryNamesByType(nature === 'receita' ? 'income' : 'expense');
  const accountNames = getAccountNames();

  // Estados dinâmicos baseados na natureza
  const stateOptionsByNature = nature === 'despesa' 
    ? [
        { label: 'A Pagar', value: 'pagar' },
        { label: 'Pago', value: 'pago' }
      ]
    : [
        { label: 'A Receber', value: 'receber' },
        { label: 'Recebido', value: 'recebido' }
      ];

  const paymentMethods: PaymentMethod[] = [
    'Cartão de débito',
    'Cartão de crédito',
    'Pix',
    'TED',
    'Estorno',
    'Transferência bancária'
  ];

  // Filtrar metas compatíveis com a natureza selecionada
  const compatibleGoals = goals.filter(goal =>
    (nature === 'despesa' && goal.type === 'compra') ||
    (nature === 'receita' && goal.type === 'economia')
  );

  const validateForm = (): boolean => {
    if (!formState) return false;

    // Validar se o formulário está completo
    if (!OperationFormValidationService.validarFormularioCompleto({
      natureza: nature,
      estado: state,
      categoria: category,
      formaPagamento: paymentMethod,
      contaOrigem: accounts.find(acc => acc.name === sourceAccount),
      contaDestino: accounts.find(acc => acc.name === destinationAccount),
      valor: value ? parseFloat(value) : undefined,
      data: date ? new Date(date) : undefined
    })) {
      Alert.alert('Erro', 'Por favor, complete todos os campos obrigatórios na sequência correta.');
      return false;
    }

    // Validar valor
    if (parseFloat(value) <= 0) {
      Alert.alert('Erro', 'O valor deve ser maior que zero.');
      return false;
    }

    // Validar contas diferentes
    if (sourceAccount === destinationAccount) {
      Alert.alert('Erro', 'A conta origem e destino não podem ser iguais.');
      return false;
    }

    // Validar erros específicos
    const newErrors: { [key: string]: string } = {};
    
    if (value && formState.valor.validation) {
      const valorNum = parseFloat(value);
      if (!formState.valor.validation(valorNum)) {
        // Usar AccountService para obter mensagem detalhada
        const sourceAccountObj = accounts.find(acc => acc.name === sourceAccount);
        if (sourceAccountObj) {
          const validation = AccountService.validateOperationBalance(sourceAccountObj, valorNum, operations);
          newErrors.valor = validation.errorMessage || 'Saldo insuficiente na conta origem';
        } else {
          newErrors.valor = 'Saldo insuficiente na conta origem';
        }
      }
    }

    if (date && formState.data.validation) {
      const dataObj = new Date(date);
      if (!formState.data.validation(dataObj)) {
        newErrors.data = 'Data inválida para o estado selecionado';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Alert.alert('Erro', 'Por favor, corrija os erros no formulário.');
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
          goal_id: goalId || undefined,
          state, // Include updated state
        };
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
          goal_id: goalId || undefined,
          state,
        }
        
        if (doubleOperationCategories.includes(category)) {
          await createDoubleOperation(operationData);
          Alert.alert('Sucesso', 'Operação dupla criada com sucesso!');
        } else {
          await createOperation(operationData);
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
    setCategory(categoryNamesByType[0] || 'Alimento-supermercado');
    setDetails('');
    setReceiptType('text');
    setReceiptText('');
    setReceiptMedia(undefined);
    setReceipt('');
    setGoalId('');
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

  // Função para abrir o DatePicker
  const handleOpenDatePicker = () => {
    setShowDatePicker(true);
  };

  // Função para tratar a seleção da data
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Formatar para YYYY-MM-DD
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
    }
  };

  // Auto-set estado based on natureza
  useEffect(() => {
    if (nature === 'despesa') {
      setState('pagar');
    } else {
      setState('receber');
    }
  }, [nature]);

  // Initialize and adjust category when data is loaded or nature changes
  useEffect(() => {
    if (!editOperation && categoryNamesByType.length > 0) {
      // Se não há categoria selecionada ou se a categoria atual não está na lista do tipo atual
      if (!category || !categoryNamesByType.includes(category)) {
        setCategory(categoryNamesByType[0]);
      }
    }
  }, [categoryNamesByType, editOperation, category]);

  // Controlar o valor do receipt baseado no tipo
  useEffect(() => {
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
          <View style={[formStyles.input, formState?.natureza.disabled && styles.disabledField]}>
            <Picker
              selectedValue={nature}
              onValueChange={setNature}
              enabled={!formState?.natureza.disabled}
            >
              <Picker.Item label="Despesa" value="despesa" />
              <Picker.Item label="Receita" value="receita" />
            </Picker>
          </View>
          {formState?.natureza.message && (
            <Text style={styles.fieldMessage}>{formState.natureza.message}</Text>
          )}
        </View>

        {/* Estado - sempre visível quando editando, ou para operações não-duplas */}
        {(editOperation || !doubleOperationCategories.includes(category)) && (
          <View style={styles.fieldContainer}>
            <Text style={formStyles.label}>Estado</Text>
            <View style={[formStyles.input, formState?.estado.disabled && styles.disabledField]}>
              <Picker
                selectedValue={state}
                onValueChange={setState}
                enabled={!formState?.estado.disabled}
              >
                {formState?.estado.options.map((option) => (
                  <Picker.Item 
                    key={option} 
                    label={OperationFormValidationService.getEstadoLabel(option)} 
                    value={option} 
                  />
                ))}
              </Picker>
            </View>
            {formState?.estado.message && (
              <Text style={styles.fieldMessage}>{formState.estado.message}</Text>
            )}
          </View>
        )}

        {/* Category - Dynamic from database */}
        <View style={styles.fieldContainer}>
          <Text style={formStyles.label}>Categoria</Text>
          <View style={[formStyles.input, formState?.categoria.disabled && styles.disabledField]}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              enabled={!formState?.categoria.disabled}
            >
              {formState?.categoria.options && formState.categoria.options.length > 0 ? (
                formState.categoria.options.map((cat: any) => (
                  <Picker.Item key={cat.name} label={cat.name} value={cat.name} />
                ))
              ) : (
                <Picker.Item label="Nenhuma categoria disponível" value="" />
              )}
            </Picker>
          </View>
          {formState?.categoria.message && (
            <Text style={styles.fieldMessage}>{formState.categoria.message}</Text>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.fieldContainer}>
          <Text style={formStyles.label}>Forma de Pagamento</Text>
          <View style={[formStyles.input, formState?.formaPagamento.disabled && styles.disabledField]}>
            <Picker
              selectedValue={paymentMethod}
              onValueChange={setPaymentMethod}
              enabled={!formState?.formaPagamento.disabled}
            >
              {formState?.formaPagamento.options.map((method) => (
                <Picker.Item key={method} label={method} value={method} />
              ))}
            </Picker>
          </View>
          {formState?.formaPagamento.message && (
            <Text style={styles.fieldMessage}>{formState.formaPagamento.message}</Text>
          )}
        </View>

        {/* Source Account - Dynamic from database */}
        <View style={styles.fieldContainer}>
          <Text style={formStyles.label}>Conta de Origem</Text>
          <View style={[formStyles.input, formState?.contaOrigem.disabled && styles.disabledField]}>
            <Picker
              selectedValue={sourceAccount}
              onValueChange={setSourceAccount}
              enabled={!formState?.contaOrigem.disabled}
            >
              <Picker.Item label="Selecione uma conta" value="" />
              {formState?.contaOrigem.options && formState.contaOrigem.options.length > 0 ? (
                formState.contaOrigem.options.map((account: any) => (
                  <Picker.Item key={account.name} label={account.name} value={account.name} />
                ))
              ) : (
                <Picker.Item label="Nenhuma conta disponível" value="" />
              )}
            </Picker>
          </View>
          {formState?.contaOrigem.message && (
            <Text style={styles.fieldMessage}>{formState.contaOrigem.message}</Text>
          )}
        </View>

        {/* Destination Account - Dynamic from database */}
        <View style={styles.fieldContainer}>
          <Text style={formStyles.label}>Conta de Destino</Text>
          <View style={[formStyles.input, formState?.contaDestino.disabled && styles.disabledField]}>
            <Picker
              selectedValue={destinationAccount}
              onValueChange={setDestinationAccount}
              enabled={!formState?.contaDestino.disabled}
            >
              <Picker.Item label="Selecione uma conta" value="" />
              {formState?.contaDestino.options && formState.contaDestino.options.length > 0 ? (
                formState.contaDestino.options.map((account: any) => (
                  <Picker.Item key={account.name} label={account.name} value={account.name} />
                ))
              ) : (
                <Picker.Item label="Nenhuma conta disponível" value="" />
              )}
            </Picker>
          </View>
          {formState?.contaDestino.message && (
            <Text style={styles.fieldMessage}>{formState.contaDestino.message}</Text>
          )}
        </View>

        {/* Value */}
        <View style={styles.fieldContainer}>
          <Text style={formStyles.label}>Valor (R$)</Text>
          <TextInput
            style={[formStyles.input, formState?.valor.disabled && styles.disabledField]}
            value={value}
            onChangeText={setValue}
            placeholder="0,00"
            keyboardType="numeric"
            returnKeyType="next"
            editable={!formState?.valor.disabled}
          />
          {formState?.valor.message && (
            <Text style={styles.fieldMessage}>{formState.valor.message}</Text>
          )}
          {errors.valor && (
            <Text style={styles.errorMessage}>{errors.valor}</Text>
          )}
        </View>

        {/* Campo de Data */}
        <View style={styles.fieldContainer}>
          <Text style={formStyles.label}>Data</Text>
          <TouchableOpacity 
            onPress={handleOpenDatePicker} 
            style={[formStyles.input, formState?.data.disabled && styles.disabledField]}
            disabled={formState?.data.disabled}
          >
            <Text style={formState?.data.disabled ? { color: colors.gray[400] } : {}}>{date}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date ? new Date(date) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          {formState?.data.message && (
            <Text style={styles.fieldMessage}>{formState.data.message}</Text>
          )}
          {errors.data && (
            <Text style={styles.errorMessage}>{errors.data}</Text>
          )}
        </View>

        {/* Details */}
        <View style={styles.fieldContainer}>
          <Text style={formStyles.label}>Detalhes (Opcional)</Text>
          <TextInput
            style={[formStyles.input, formStyles.textArea, formState?.detalhes.disabled && styles.disabledField]}
            value={details}
            onChangeText={setDetails}
            placeholder="Descrição adicional..."
            multiline
            numberOfLines={3}
            returnKeyType="next"
            editable={!formState?.detalhes.disabled}
          />
          {formState?.detalhes.message && (
            <Text style={styles.fieldMessage}>{formState.detalhes.message}</Text>
          )}
        </View>

        {/* Receipt */}
        <View style={styles.fieldContainer}>
          <Text style={formStyles.label}>Recibo (Opcional)</Text>
          
          {/* Botões de seleção de tipo */}
          <View style={[styles.receiptTypeContainer, formState?.recibo.disabled && styles.disabledField]}>
            <TouchableOpacity
              style={[
                styles.receiptTypeButton,
                receiptType === 'text' && styles.receiptTypeButtonActive
              ]}
              onPress={() => setReceiptType('text')}
              disabled={formState?.recibo.disabled}
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
              disabled={formState?.recibo.disabled}
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
          {formState?.recibo.message && (
            <Text style={styles.fieldMessage}>{formState.recibo.message}</Text>
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

        {/* Goal (Meta) */}
        {nature && compatibleGoals.length > 0 && (
        <View style={styles.fieldContainer}>
            <Text style={formStyles.label}>Meta</Text>
            <View style={[formStyles.input, formState?.metas.disabled && styles.disabledField]}>
              <Picker
                selectedValue={goalId}
                onValueChange={setGoalId}
                enabled={!formState?.metas.disabled}
              >
                <Picker.Item label="Selecione uma meta (opcional)" value="" />
                {compatibleGoals.map(goal => (
                  <Picker.Item key={goal.id} label={goal.description} value={goal.id} />
                ))}
              </Picker>
        </View>
          {formState?.metas.message && (
            <Text style={styles.fieldMessage}>{formState.metas.message}</Text>
          )}
          </View>
        )}

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
  disabledField: {
    opacity: 0.5,
    backgroundColor: colors.gray[100],
  },
  fieldMessage: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  errorMessage: {
    fontSize: typography.caption.fontSize,
    color: colors.error[500],
    marginTop: spacing.xs,
  },
});

export default OperationForm;