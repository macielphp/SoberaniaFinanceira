# OperationForm - Visualizador de Imagem

## Funcionalidade

O `OperationForm` agora suporta visualização de imagens de recibo quando uma operação está sendo editada. Quando uma operação possui uma imagem anexada (armazenada como `Uint8Array` no banco de dados), o formulário automaticamente:

1. **Detecta** se há uma imagem na operação em edição
2. **Converte** o `Uint8Array` para uma URI temporária usando `expo-file-system`
3. **Configura** o tipo de receipt como 'media'
4. **Permite** visualização da imagem através de um modal

## Implementação

### Estados Principais

```typescript
const [receiptType, setReceiptType] = useState<'text' | 'media'>(getInitialReceiptType());
const [receiptMedia, setReceiptMedia] = useState<Uint8Array | undefined>(
  editOperation?.receipt instanceof Uint8Array ? editOperation.receipt : undefined
);
const [receiptImageUri, setReceiptImageUri] = useState<string | undefined>(undefined);
```

### Função de Conversão

```typescript
const convertUint8ArrayToUri = async (uint8Array: Uint8Array): Promise<string> => {
  const fileName = `receipt_${Date.now()}.jpg`;
  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
  
  // Converter Uint8Array para base64
  let binaryString = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(binaryString);
  
  // Salvar no cache do sistema
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  return fileUri;
};
```

### Inicialização Automática

```typescript
useEffect(() => {
  const initializeReceiptImage = async () => {
    if (editOperation?.receipt instanceof Uint8Array) {
      const uri = await convertUint8ArrayToUri(editOperation.receipt);
      setReceiptImageUri(uri);
    }
  };

  initializeReceiptImage();

  // Cleanup: remover arquivo temporário
  return () => {
    if (receiptImageUri && FileSystem.cacheDirectory && receiptImageUri.startsWith(FileSystem.cacheDirectory)) {
      FileSystem.deleteAsync(receiptImageUri, { idempotent: true });
    }
  };
}, [editOperation]);
```

## Interface do Usuário

### Botão de Imagem

- **Sem imagem**: Mostra "Imagem" e abre modal de seleção
- **Com imagem**: Mostra "Imagem ✓" e abre modal de visualização

### Modal de Visualização

```typescript
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
        <TouchableOpacity onPress={() => setShowImagePreview(false)}>
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
```

## Fluxo de Funcionamento

1. **Edição de Operação**: Usuário clica em "Editar" em uma operação com imagem
2. **Detecção**: Componente detecta `Uint8Array` no campo `receipt`
3. **Conversão**: `Uint8Array` é convertido para URI temporária
4. **Configuração**: Tipo de receipt é definido como 'media'
5. **Interface**: Botão mostra "Imagem ✓" indicando presença de imagem
6. **Visualização**: Clique no botão abre modal com a imagem
7. **Cleanup**: Arquivo temporário é removido quando componente é desmontado

## Dependências

- `expo-file-system`: Para manipulação de arquivos temporários
- `expo-image-picker`: Para seleção de novas imagens
- `react-native`: Para componentes de interface

## Tratamento de Erros

- Se a conversão falhar, o tipo volta para 'text'
- Arquivos temporários são limpos automaticamente
- Logs detalhados para debugging

## Testes

O arquivo `OperationForm.test.tsx` contém testes para verificar:
- Inicialização correta com imagem existente
- Abertura do modal de visualização
- Comportamento do botão de imagem 