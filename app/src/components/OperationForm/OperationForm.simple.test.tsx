// Teste simples para verificar se o visualizador de imagem está funcionando
import React from 'react';
import { render } from '@testing-library/react-native';
import { OperationForm } from './OperationForm';

// Mock do contexto
const mockUseFinance = {
  createSimpleOperation: jest.fn(),
  createDoubleOperation: jest.fn(),
  updateOperationState: jest.fn(),
  updateOperation: jest.fn(),
  getCategoryNames: () => ['Alimento-supermercado', 'Transporte'],
  getAccountNames: () => ['Conta Corrente', 'Poupança'],
  categories: [],
  accounts: [],
  loading: false,
};

jest.mock('../../contexts/FinanceContext', () => ({
  useFinance: () => mockUseFinance,
}));

// Mock do expo-file-system
jest.mock('expo-file-system', () => ({
  cacheDirectory: '/tmp/',
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
}));

// Mock do expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

// Mock dos estilos
jest.mock('../../styles/Styles', () => ({
  __esModule: true,
  default: {
    container: {},
    centered: {},
    modalOption: {},
  },
}));

jest.mock('../../styles/components', () => ({
  buttonStyles: {
    base: {},
    primary: {},
    secondary: {},
    disabled: {},
  },
  formStyles: {
    container: {},
    label: {},
    input: {},
    textArea: {},
  },
}));

jest.mock('../../styles/themes', () => ({
  colors: {
    primary: { 500: '#2196f3' },
    secondary: { 50: '#e3f2fd', 700: '#1976d2' },
    warning: { 50: '#fff3cd', 500: '#ffc107', 700: '#856404' },
    error: { 500: '#f44336' },
    text: { primary: '#333', secondary: '#666', inverse: '#fff' },
    gray: { 200: '#eee', 300: '#ddd' },
    background: { default: '#fff' },
  },
  spacing: { sm: 8, md: 16, lg: 24, xs: 4 },
  typography: { body1: {}, body2: {}, h4: {} },
}));

describe('OperationForm - Visualizador de Imagem', () => {
  it('deve renderizar sem erros quando não há operação em edição', () => {
    const { getByText } = render(
      <OperationForm 
        onSuccess={jest.fn()}
      />
    );

    // Verificar se o formulário renderiza
    expect(getByText('Natureza')).toBeTruthy();
  });

  it('deve renderizar sem erros quando há uma operação em edição com imagem', () => {
    const mockEditOperation = {
      id: 'test-id',
      nature: 'despesa' as const,
      state: 'pago' as const,
      paymentMethod: 'Pix' as const,
      sourceAccount: 'Conta Corrente',
      destinationAccount: 'Poupança',
      date: '2024-01-01',
      value: 100,
      category: 'Alimento-supermercado' as const,
      details: 'Teste',
      receipt: new Uint8Array([255, 216, 255, 224]), // JPEG header
      project: 'Teste',
    };

    const { getByText } = render(
      <OperationForm 
        editOperation={mockEditOperation}
        onSuccess={jest.fn()}
      />
    );

    // Verificar se o formulário renderiza
    expect(getByText('Natureza')).toBeTruthy();
  });

  it('deve renderizar sem erros quando há uma operação em edição sem imagem', () => {
    const mockEditOperation = {
      id: 'test-id',
      nature: 'despesa' as const,
      state: 'pago' as const,
      paymentMethod: 'Pix' as const,
      sourceAccount: 'Conta Corrente',
      destinationAccount: 'Poupança',
      date: '2024-01-01',
      value: 100,
      category: 'Alimento-supermercado' as const,
      details: 'Teste',
      receipt: 'Texto do recibo',
      project: 'Teste',
    };

    const { getByText } = render(
      <OperationForm 
        editOperation={mockEditOperation}
        onSuccess={jest.fn()}
      />
    );

    // Verificar se o formulário renderiza
    expect(getByText('Natureza')).toBeTruthy();
  });
}); 