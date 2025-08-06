import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MonthlySummary from '../../../components/MonthlySummary/MonthlySummary';
import { Operation } from '../../../clean-architecture/domain/entities/Operation';
import { Money } from '../../../clean-architecture/shared/utils/Money';

// Mock do useOperationSummaryViewModelAdapter
const mockOperations = [
  new Operation({
    id: '1',
    description: 'Salário',
    amount: new Money(3000),
    nature: 'receita',
    state: 'recebido',
    date: new Date('2024-01-15'),
    accountId: '1',
    categoryId: '1',
    receipt: null,
  }),
  new Operation({
    id: '2',
    description: 'Aluguel',
    amount: new Money(800),
    nature: 'despesa',
    state: 'pago',
    date: new Date('2024-01-10'),
    accountId: '1',
    categoryId: '2',
    receipt: null,
  }),
  new Operation({
    id: '3',
    description: 'Supermercado',
    amount: new Money(400),
    nature: 'despesa',
    state: 'pago',
    date: new Date('2024-01-20'),
    accountId: '1',
    categoryId: '3',
    receipt: null,
  }),
];

const mockUseOperationSummaryViewModelAdapter = {
  operations: mockOperations,
  loading: false,
  error: null,
  getTotalIncomeForMonth: jest.fn(() => new Money(3000)),
  getTotalExpensesForMonth: jest.fn(() => new Money(1200)),
  getNetBalanceForMonth: jest.fn(() => new Money(1800)),
  getAccountSummary: jest.fn(() => ({
    accountId: '1',
    totalIncome: new Money(3000),
    totalExpenses: new Money(1200),
    netBalance: new Money(1800),
  })),
  getPeriodSummary: jest.fn(() => ({
    totalIncome: new Money(3000),
    totalExpenses: new Money(1200),
    netBalance: new Money(1800),
    operationCount: 3,
  })),
};

jest.mock('../../../clean-architecture/presentation/ui-adapters/useOperationSummaryViewModelAdapter', () => () => mockUseOperationSummaryViewModelAdapter);

// Mock do AccountService
jest.mock('../../../services/AccountService', () => ({
  AccountService: {
    formatCurrency: jest.fn((value) => `R$ ${value.toFixed(2)}`),
  },
}));

describe('MonthlySummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar resumo mensal com informações básicas', () => {
    const { getByText } = render(<MonthlySummary />);
    
    expect(getByText('Resumo do Mês')).toBeTruthy();
    expect(getByText('Receitas')).toBeTruthy();
    expect(getByText('Despesas')).toBeTruthy();
    expect(getByText('Saldo')).toBeTruthy();
  });

  it('deve mostrar valores formatados corretamente', () => {
    const { getByText } = render(<MonthlySummary />);
    
    expect(getByText('R$ 3.000,00')).toBeTruthy(); // Receitas
    expect(getByText('R$ 1.200,00')).toBeTruthy(); // Despesas
    expect(getByText('R$ 1.800,00')).toBeTruthy(); // Saldo
  });

  it('deve mostrar número de operações', () => {
    const { getByText } = render(<MonthlySummary />);
    
    expect(getByText('3 operações')).toBeTruthy();
  });

  it('deve permitir selecionar mês', () => {
    const { getByText } = render(<MonthlySummary />);
    
    const monthPicker = getByText('Janeiro 2024');
    fireEvent.press(monthPicker);
    
    // Verificar se o seletor de mês aparece
    expect(getByText('Selecionar Mês')).toBeTruthy();
  });

  it('deve mostrar loading quando estiver carregando', () => {
    const loadingMock = {
      ...mockUseOperationSummaryViewModelAdapter,
      loading: true,
    };
    
    jest.doMock('../../../clean-architecture/presentation/ui-adapters/useOperationSummaryViewModelAdapter', () => () => loadingMock);
    
    const { getByText } = render(<MonthlySummary />);
    
    expect(getByText('Carregando...')).toBeTruthy();
  });

  it('deve mostrar erro quando houver erro', () => {
    const errorMock = {
      ...mockUseOperationSummaryViewModelAdapter,
      error: 'Erro ao carregar dados',
    };
    
    jest.doMock('../../../clean-architecture/presentation/ui-adapters/useOperationSummaryViewModelAdapter', () => () => errorMock);
    
    const { getByText } = render(<MonthlySummary />);
    
    expect(getByText('Erro ao carregar dados')).toBeTruthy();
  });

  it('deve permitir refresh dos dados', async () => {
    const { getByTestId } = render(<MonthlySummary />);
    
    // Simular pull to refresh
    const scrollView = getByTestId('monthly-summary-scroll');
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 100 },
        contentSize: { height: 500, width: 100 },
        layoutMeasurement: { height: 100, width: 100 },
      },
    });
    
    await waitFor(() => {
      expect(mockUseOperationSummaryViewModelAdapter.getPeriodSummary).toHaveBeenCalled();
    });
  });

  it('deve mostrar gráfico de distribuição', () => {
    const { getByTestId } = render(<MonthlySummary />);
    
    const chart = getByTestId('monthly-chart');
    expect(chart).toBeTruthy();
  });

  it('deve mostrar lista de operações', () => {
    const { getByTestId } = render(<MonthlySummary />);
    
    const operationsList = getByTestId('operations-list');
    expect(operationsList).toBeTruthy();
  });

  it('deve permitir filtrar por categoria', () => {
    const { getByText } = render(<MonthlySummary />);
    
    const filterButton = getByText('Filtrar por Categoria');
    fireEvent.press(filterButton);
    
    // Verificar se o filtro aparece
    expect(getByText('Categorias')).toBeTruthy();
  });

  it('deve permitir ordenar operações', () => {
    const { getByText } = render(<MonthlySummary />);
    
    const sortButton = getByText('Ordenar');
    fireEvent.press(sortButton);
    
    // Verificar se as opções de ordenação aparecem
    expect(getByText('Por Data')).toBeTruthy();
    expect(getByText('Por Valor')).toBeTruthy();
    expect(getByText('Por Categoria')).toBeTruthy();
  });

  it('deve mostrar estatísticas por conta', () => {
    const { getByText } = render(<MonthlySummary />);
    
    expect(getByText('Por Conta')).toBeTruthy();
    expect(getByText('Conta Corrente')).toBeTruthy();
    expect(getByText('R$ 1.800,00')).toBeTruthy(); // Saldo da conta
  });

  it('deve mostrar estatísticas por categoria', () => {
    const { getByText } = render(<MonthlySummary />);
    
    expect(getByText('Por Categoria')).toBeTruthy();
    expect(getByText('Alimentação')).toBeTruthy();
    expect(getByText('R$ 400,00')).toBeTruthy(); // Valor da categoria
  });

  it('deve permitir exportar relatório', () => {
    const { getByText } = render(<MonthlySummary />);
    
    const exportButton = getByText('Exportar');
    fireEvent.press(exportButton);
    
    // Verificar se as opções de exportação aparecem
    expect(getByText('PDF')).toBeTruthy();
    expect(getByText('Excel')).toBeTruthy();
  });

  it('deve mostrar alerta quando não há operações', () => {
    const emptyMock = {
      ...mockUseOperationSummaryViewModelAdapter,
      operations: [],
    };
    
    jest.doMock('../../../clean-architecture/presentation/ui-adapters/useOperationSummaryViewModelAdapter', () => () => emptyMock);
    
    const { getByText } = render(<MonthlySummary />);
    
    expect(getByText('Nenhuma operação encontrada')).toBeTruthy();
    expect(getByText('Adicione operações para ver o resumo')).toBeTruthy();
  });

  it('deve mostrar comparação com mês anterior', () => {
    const { getByText } = render(<MonthlySummary />);
    
    expect(getByText('Comparação com Dezembro')).toBeTruthy();
    expect(getByText('+15%')).toBeTruthy(); // Variação percentual
  });

  it('deve permitir visualizar detalhes da operação', () => {
    const { getByTestId } = render(<MonthlySummary />);
    
    const operationItem = getByTestId('operation-item-1');
    fireEvent.press(operationItem);
    
    // Verificar se os detalhes da operação aparecem
    expect(getByText('Detalhes da Operação')).toBeTruthy();
    expect(getByText('Salário')).toBeTruthy();
    expect(getByText('R$ 3.000,00')).toBeTruthy();
  });

  it('deve mostrar progresso das metas', () => {
    const { getByText } = render(<MonthlySummary />);
    
    expect(getByText('Progresso das Metas')).toBeTruthy();
    expect(getByText('Economia Mensal')).toBeTruthy();
    expect(getByText('75%')).toBeTruthy(); // Progresso
  });

  it('deve permitir compartilhar resumo', () => {
    const { getByText } = render(<MonthlySummary />);
    
    const shareButton = getByText('Compartilhar');
    fireEvent.press(shareButton);
    
    // Verificar se as opções de compartilhamento aparecem
    expect(getByText('WhatsApp')).toBeTruthy();
    expect(getByText('Email')).toBeTruthy();
  });
}); 