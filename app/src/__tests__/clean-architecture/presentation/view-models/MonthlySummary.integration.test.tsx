import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import MonthlySummary from '../../../components/MonthlySummary/MonthlySummary';
import { Operation } from '../../../clean-architecture/domain/entities/Operation';
import { Category } from '../../../clean-architecture/domain/entities/Category';
import { Money } from '../../../clean-architecture/shared/utils/Money';
import { configureServices } from '../../../clean-architecture/shared/di/ServiceConfiguration';

// Mock dos repositórios
const mockOperationRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
};

const mockCategoryRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
};

// Mock do container
jest.mock('../../../clean-architecture/shared/di/Container', () => ({
  container: {
    resolve: jest.fn((service: string) => {
      if (service === 'IOperationRepository') return mockOperationRepository;
      if (service === 'ICategoryRepository') return mockCategoryRepository;
      return null;
    }),
  },
}));

describe('MonthlySummary Integration', () => {
  const mockOperations: Operation[] = [
    {
      id: '1',
      nature: 'receita',
      state: 'recebido',
      paymentMethod: 'Pix',
      sourceAccount: 'account1',
      destinationAccount: 'account2',
      date: new Date(2024, 0, 15), // Janeiro 2024
      value: new Money(3000),
      category: 'category1',
      details: 'Salário',
      receipt: null,
      project: 'default',
      goal_id: null,
    },
    {
      id: '2',
      nature: 'despesa',
      state: 'pago',
      paymentMethod: 'Cartão',
      sourceAccount: 'account1',
      destinationAccount: 'account2',
      date: new Date(2024, 0, 20), // Janeiro 2024
      value: new Money(500),
      category: 'category2',
      details: 'Aluguel',
      receipt: null,
      project: 'default',
      goal_id: null,
    },
    {
      id: '3',
      nature: 'despesa',
      state: 'pago',
      paymentMethod: 'Dinheiro',
      sourceAccount: 'account1',
      destinationAccount: 'account2',
      date: new Date(2024, 0, 25), // Janeiro 2024
      value: new Money(200),
      category: 'category3',
      details: 'Alimentação',
      receipt: null,
      project: 'default',
      goal_id: null,
    },
  ];

  const mockCategories: Category[] = [
    {
      id: 'category1',
      name: 'Salário',
      type: 'receita',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'category2',
      name: 'Moradia',
      type: 'despesa',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'category3',
      name: 'Alimentação',
      type: 'despesa',
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockOperationRepository.findAll.mockResolvedValue(mockOperations);
    mockCategoryRepository.findAll.mockResolvedValue(mockCategories);
  });

  it('should render monthly summary with real data', async () => {
    render(<MonthlySummary selectedMonth={new Date(2024, 0, 1)} />);

    // Aguardar carregamento
    await waitFor(() => {
      expect(screen.getByText('Resumo do Mês')).toBeTruthy();
    });

    // Verificar se os dados são exibidos corretamente
    expect(screen.getByText('Receitas')).toBeTruthy();
    expect(screen.getByText('Despesas')).toBeTruthy();
    expect(screen.getByText('Saldo')).toBeTruthy();
    expect(screen.getByText('Estatísticas')).toBeTruthy();
    expect(screen.getByText('Operações')).toBeTruthy();
  });

  it('should display correct income amount', async () => {
    render(<MonthlySummary selectedMonth={new Date(2024, 0, 1)} />);

    await waitFor(() => {
      expect(screen.getByText('R$ 3.000,00')).toBeTruthy();
    });
  });

  it('should display correct expenses amount', async () => {
    render(<MonthlySummary selectedMonth={new Date(2024, 0, 1)} />);

    await waitFor(() => {
      expect(screen.getByText('R$ 700,00')).toBeTruthy();
    });
  });

  it('should display correct net balance', async () => {
    render(<MonthlySummary selectedMonth={new Date(2024, 0, 1)} />);

    await waitFor(() => {
      expect(screen.getByText('R$ 2.300,00')).toBeTruthy();
    });
  });

  it('should display operation count', async () => {
    render(<MonthlySummary selectedMonth={new Date(2024, 0, 1)} />);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeTruthy(); // 3 operações em janeiro
    });
  });

  it('should display operation details', async () => {
    render(<MonthlySummary selectedMonth={new Date(2024, 0, 1)} />);

    await waitFor(() => {
      expect(screen.getByText('Salário')).toBeTruthy();
      expect(screen.getByText('Aluguel')).toBeTruthy();
      expect(screen.getByText('Alimentação')).toBeTruthy();
    });
  });

  it('should handle refresh', async () => {
    render(<MonthlySummary selectedMonth={new Date(2024, 0, 1)} />);

    await waitFor(() => {
      expect(screen.getByText('Resumo do Mês')).toBeTruthy();
    });

    // Simular pull-to-refresh
    const scrollView = screen.getByTestId('monthly-summary-scroll');
    fireEvent(scrollView, 'refresh');

    // Verificar se os repositórios foram chamados novamente
    await waitFor(() => {
      expect(mockOperationRepository.findAll).toHaveBeenCalledTimes(2);
      expect(mockCategoryRepository.findAll).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle month change', async () => {
    const onMonthChange = jest.fn();
    render(
      <MonthlySummary 
        selectedMonth={new Date(2024, 0, 1)} 
        onMonthChange={onMonthChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Janeiro 2024')).toBeTruthy();
    });

    // Clicar no seletor de mês
    const monthSelector = screen.getByText('Janeiro 2024');
    fireEvent.press(monthSelector);

    expect(onMonthChange).toHaveBeenCalled();
  });

  it('should handle operation press', async () => {
    const onOperationPress = jest.fn();
    render(
      <MonthlySummary 
        selectedMonth={new Date(2024, 0, 1)} 
        onOperationPress={onOperationPress}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Salário')).toBeTruthy();
    });

    // Clicar em uma operação
    const operationItem = screen.getByTestId('operation-item-1');
    fireEvent.press(operationItem);

    expect(onOperationPress).toHaveBeenCalledWith('1');
  });

  it('should display empty state when no operations', async () => {
    mockOperationRepository.findAll.mockResolvedValue([]);
    mockCategoryRepository.findAll.mockResolvedValue([]);

    render(<MonthlySummary selectedMonth={new Date(2024, 0, 1)} />);

    await waitFor(() => {
      expect(screen.getByText('Nenhuma operação encontrada')).toBeTruthy();
      expect(screen.getByText('Adicione operações para ver o resumo')).toBeTruthy();
    });
  });

  it('should display loading state', async () => {
    // Mock para simular carregamento lento
    mockOperationRepository.findAll.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockOperations), 100))
    );

    render(<MonthlySummary selectedMonth={new Date(2024, 0, 1)} />);

    // Verificar se o loading é exibido
    expect(screen.getByText('Carregando...')).toBeTruthy();

    // Aguardar carregamento
    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).toBeFalsy();
    });
  });

  it('should display error state', async () => {
    mockOperationRepository.findAll.mockRejectedValue(new Error('Erro de conexão'));

    render(<MonthlySummary selectedMonth={new Date(2024, 0, 1)} />);

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar operações')).toBeTruthy();
    });
  });
}); 