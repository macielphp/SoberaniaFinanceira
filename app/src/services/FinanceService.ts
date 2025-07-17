// app\src\services\FinanceService.ts
// Simple UUID generator without external dependencies
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Tipos básicos
export type Nature = 'despesa' | 'receita';

export type PaymentMethod = 
  | 'Cartão de débito'
  | 'Cartão de crédito'
  | 'Pix'
  | 'TED'
  | 'Estorno'
  | 'Transferência bancária';

export type State = 
  | 'receber'
  | 'recebido'
  | 'pagar'
  | 'pago'
  | 'transferir'
  | 'transferido';

export type Category =
  | 'Reparação'
  | 'Adiantamento-pessoal'
  | 'Movimentação interna'
  | 'Alimento-supermercado'
  | 'Aluguel'
  | 'Energia-elétrica'
  | 'Saneamento-básico'
  | 'Presente'
  | 'Doação'
  | 'Transporte-público'
  | 'Uber'
  | 'Combustível'
  | 'Salário-CLT'
  | 'PLR/Comissão'
  | 'Ajuda-custos-PJ'
  | 'Adiantamento-salário-CLT'
  | 'Vale-refeição'
  | 'Vale-alimentação'
  | 'Cashback'
  | 'Internet-e-plano-residência/móvel'
  | 'Lanche-rápido'
  | 'Vestuário'
  | 'Costura-roupa'
  | 'Curso-superior'
  | 'Curso-técnico'
  | 'Curso-profissionalizante'
  | 'Livro'
  | 'Dentista'
  | 'Remédio'
  | 'Oftalmologista'
  | 'Óculos-de-grau'
  | 'Suplemento-vitaminas'
  | 'Gás-cozinha'
  | 'Financiamento'
  | 'Consórcio'
  | 'Dívida'
  | 'Assinatura-digital-pessoal'
  | 'Assinatura-digital-profissional'
  | 'Acessório-celular';

// Interface principal
export interface Operation {
  id: string;
  user_id: string;
  nature: Nature;
  state: State;
  paymentMethod: PaymentMethod;
  sourceAccount: string;
  destinationAccount: string;
  date: string; // formato ISO 'YYYY-MM-DD'
  value: number;
  category: Category;
  details?: string;
  receipt?: Uint8Array | string;
  project?: string;
}

// Classe principal do serviço
export class FinanceService {
  // Cria uma operação simples
  createSimpleOperation(operation: Omit<Operation, 'id'>): Operation {
    return {
      id: generateUUID(),
      ...operation
    };
  }

  // Cria uma operação dupla (movimentação interna, adiantamento, reparação)
  createDoubleOperation({
    user_id,
    nature,
    paymentMethod,
    sourceAccount,
    destinationAccount,
    date,
    value,
    category,
    details,
    receipt,
    project
  }: Omit<Operation, 'id' | 'state'>): Operation[] {
    const baseId = generateUUID();
    const userId = user_id || 'user-1'; // Default user ID

    // Configurações baseadas na categoria
    let firstOperation: Operation;
    let secondOperation: Operation | undefined;

    switch (category) {
      case 'Movimentação interna':
        // Caso 2: Movimentação interna entre contas próprias
        firstOperation = {
          id: `${baseId}-1`,
          user_id: userId,
          nature: 'despesa',
          state: 'transferir',
          paymentMethod,
          sourceAccount,
          destinationAccount,
          date,
          value: -Math.abs(value),
          category,
          details,
          receipt,
          project
        };

        secondOperation = {
          id: `${baseId}-2`,
          user_id: userId,
          nature: 'receita',
          state: 'receber',
          paymentMethod,
          sourceAccount,
          destinationAccount,
          date,
          value: Math.abs(value),
          category,
          details,
          receipt,
          project
        };
        break;

      case 'Adiantamento-pessoal':
        // Caso 4: Adiantamento
        firstOperation = {
          id: `${baseId}-1`,
          user_id: userId,
          nature,
          state: nature === 'despesa' ? 'pagar' : 'recebido',
          paymentMethod,
          sourceAccount,
          destinationAccount,
          date,
          value: nature === 'despesa' ? -Math.abs(value) : value,
          category,
          details,
          receipt,
          project
        };

        secondOperation = {
          id: `${baseId}-2`,
          user_id: userId,
          nature: nature === 'despesa' ? 'receita' : 'despesa',
          state: nature === 'despesa' ? 'receber' : 'pagar',
          paymentMethod,
          sourceAccount: destinationAccount,
          destinationAccount: sourceAccount,
          date,
          value: nature === 'despesa' ? Math.abs(value) : -value,
          category,
          details,
          receipt,
          project
        };
        break;

      case 'Reparação':
        // Caso 5: Reparação
        firstOperation = {
          id: `${baseId}-1`,
          user_id: userId,
          nature,
          state: nature === 'despesa' ? 'pagar' : 'recebido',
          paymentMethod,
          sourceAccount,
          destinationAccount,
          date,
          value: nature === 'despesa' ? -Math.abs(value) : value,
          category,
          details,
          receipt,
          project
        };

        // Segunda operação só existe quando recebemos a reparação
        if (nature === 'receita') {
          secondOperation = {
            id: `${baseId}-2`,
            user_id: userId,
            nature: 'despesa',
            state: 'pagar',
            paymentMethod,
            sourceAccount: destinationAccount,
            destinationAccount: '', // será preenchido quando for comprar o item
            date,
            value: -Math.abs(value),
            category,
            details: `Compra para reposição - ${details}`,
            receipt,
            project
          };
        }
        break;
      default:
        throw new Error('Categoria não suporta operação dupla');
    }

    return secondOperation ? [firstOperation, secondOperation] : [firstOperation];
  }

  // Atualiza o estado de uma operação
  updateOperationState(operation: Operation, newState: State): Operation {
    // Validações de mudança de estado
    const validStateTransitions: Record<State, State[]> = {
      'receber': ['recebido'],
      'recebido': [],
      'pagar': ['pago'],
      'pago': [],
      'transferir': ['transferido'],
      'transferido': []
    };

    // Verifica se a transição é válida
    if (!validStateTransitions[operation.state].includes(newState)) {
      throw new Error(`Transição de estado inválida: ${operation.state} -> ${newState}`);
    }

    return {
      ...operation,
      state: newState
    };
  }

  // Calcula o saldo de uma conta
  calculateBalance(operations: Operation[], account: string): number {
    return operations
      .filter(op => {
        // Só considera operações concluídas
        const isCompleted = ['recebido', 'pago', 'transferido'].includes(op.state);
        // Verifica se a operação afeta esta conta
        const affectsAccount = op.sourceAccount === account || op.destinationAccount === account;
        return isCompleted && affectsAccount;
      })
      .reduce((balance, op) => {
        if (op.sourceAccount === account) {
          // Saída de dinheiro da conta
          return balance + (op.value < 0 ? op.value : -op.value);
        } else {
          // Entrada de dinheiro na conta
          return balance + Math.abs(op.value);
        }
      }, 0);
  }

  // Método adicional: Obter operações por período
  getOperationsByPeriod(operations: Operation[], startDate: string, endDate: string): Operation[] {
    return operations.filter(op => {
      const opDate = new Date(op.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return opDate >= start && opDate <= end;
    });
  }

  // Método adicional: Obter operações por categoria
  getOperationsByCategory(operations: Operation[], category: Category): Operation[] {
    return operations.filter(op => op.category === category);
  }

  // Método adicional: Obter operações por estado
  getOperationsByState(operations: Operation[], state: State): Operation[] {
    return operations.filter(op => op.state === state);
  }

  // Método adicional: Calcular total de receitas em um período
  getTotalReceitas(operations: Operation[], startDate?: string, endDate?: string): number {
    let filteredOps = operations.filter(op => 
      op.nature === 'receita' && ['recebido'].includes(op.state)
    );

    if (startDate && endDate) {
      filteredOps = this.getOperationsByPeriod(filteredOps, startDate, endDate);
    }

    return filteredOps.reduce((total, op) => total + Math.abs(op.value), 0);
  }

  // Método adicional: Calcular total de despesas em um período
  getTotalDespesas(operations: Operation[], startDate?: string, endDate?: string): number {
    let filteredOps = operations.filter(op => 
      op.nature === 'despesa' && ['pago'].includes(op.state)
    );

    if (startDate && endDate) {
      filteredOps = this.getOperationsByPeriod(filteredOps, startDate, endDate);
    }

    return filteredOps.reduce((total, op) => total + Math.abs(op.value), 0);
  }

  // Método adicional: Obter resumo financeiro
  getFinancialSummary(operations: Operation[], startDate?: string, endDate?: string) {
    const totalReceitas = this.getTotalReceitas(operations, startDate, endDate);
    const totalDespesas = this.getTotalDespesas(operations, startDate, endDate);
    const saldoLiquido = totalReceitas - totalDespesas;

    const operacoesPendentes = operations.filter(op => 
      ['receber', 'pagar', 'transferir'].includes(op.state)
    );

    const receitasPendentes = operacoesPendentes
      .filter(op => op.nature === 'receita')
      .reduce((total, op) => total + Math.abs(op.value), 0);

    const despesasPendentes = operacoesPendentes
      .filter(op => op.nature === 'despesa')
      .reduce((total, op) => total + Math.abs(op.value), 0);

    return {
      totalReceitas,
      totalDespesas,
      saldoLiquido,
      receitasPendentes,
      despesasPendentes,
      totalOperacoes: operations.length,
      operacoesPendentes: operacoesPendentes.length
    };
  }

  // Método adicional: Validar operação antes de criar
  validateOperation(operation: Omit<Operation, 'id'>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validações básicas
    if (!operation.sourceAccount.trim()) {
      errors.push('Conta de origem é obrigatória');
    }

    if (!operation.destinationAccount.trim() && operation.category !== 'Movimentação interna') {
      errors.push('Conta de destino é obrigatória');
    }

    if (operation.value <= 0) {
      errors.push('Valor deve ser maior que zero');
    }

    if (!operation.date.trim()) {
      errors.push('Data é obrigatória');
    }

    // Validar formato da data
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (operation.date && !dateRegex.test(operation.date)) {
      errors.push('Data deve estar no formato YYYY-MM-DD');
    }

    // Validar se a data não é futura (opcional, dependendo da regra de negócio)
    if (operation.date) {
      const opDate = new Date(operation.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Fim do dia atual
      
      if (opDate > today) { 
        // Permitir datas futuras apenas para operações 'receber' e 'pagar'
        if (!['receber', 'pagar'].includes(operation.state)) {
          errors.push('Data não pode ser futura para operações já concluídas');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}