import { Account } from '../database/accounts';
import { Operation } from './FinanceService';

export interface AccountBalance {
  accountId: string;
  accountName: string;
  currentBalance: number;
  monthlyVariation: number;
  lastTransaction?: string;
}

export class AccountService {
  /**
   * Calcula o saldo atual de uma conta baseado nas operações
   */
  static calculateAccountBalance(account: Account, operations: Operation[]): number {
    return operations
      .filter(op => {
        // Só considera operações concluídas
        const isCompleted = ['recebido', 'pago', 'transferido'].includes(op.state);
        // Verifica se a operação afeta esta conta
        const affectsAccount = op.sourceAccount === account.name || op.destinationAccount === account.name;
        return isCompleted && affectsAccount;
      })
      .reduce((balance, op) => {
        if (op.sourceAccount === account.name) {
          // Saída de dinheiro da conta
          return balance + (op.value < 0 ? op.value : -op.value);
        } else {
          // Entrada de dinheiro na conta
          return balance + Math.abs(op.value);
        }
      }, account.saldo || 0);
  }

  /**
   * Calcula a variação mensal de uma conta
   */
  static calculateMonthlyVariation(account: Account, operations: Operation[]): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return operations
      .filter(op => {
        // Só considera operações concluídas do mês atual
        const isCompleted = ['recebido', 'pago', 'transferido'].includes(op.state);
        const affectsAccount = op.sourceAccount === account.name || op.destinationAccount === account.name;
        
        if (!isCompleted || !affectsAccount) return false;
        
        const opDate = new Date(op.date);
        return opDate.getMonth() === currentMonth && opDate.getFullYear() === currentYear;
      })
      .reduce((variation, op) => {
        if (op.sourceAccount === account.name) {
          // Saída de dinheiro da conta
          return variation + (op.value < 0 ? op.value : -op.value);
        } else {
          // Entrada de dinheiro na conta
          return variation + Math.abs(op.value);
        }
      }, 0);
  }

  /**
   * Obtém o saldo detalhado de todas as contas
   */
  static getAccountsBalance(accounts: Account[], operations: Operation[]): AccountBalance[] {
    return accounts.map(account => {
      const currentBalance = this.calculateAccountBalance(account, operations);
      const monthlyVariation = this.calculateMonthlyVariation(account, operations);
      
      // Encontra a última transação
      const lastTransaction = operations
        .filter(op => {
          const isCompleted = ['recebido', 'pago', 'transferido'].includes(op.state);
          const affectsAccount = op.sourceAccount === account.name || op.destinationAccount === account.name;
          return isCompleted && affectsAccount;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date;

      return {
        accountId: account.id,
        accountName: account.name,
        currentBalance,
        monthlyVariation,
        lastTransaction,
      };
    });
  }

  /**
   * Obtém o saldo total de todas as contas próprias
   */
  static getTotalBalance(accounts: Account[], operations: Operation[]): number {
    const ownAccounts = accounts.filter(account => account.type === 'propria');
    return ownAccounts.reduce((total, account) => {
      return total + this.calculateAccountBalance(account, operations);
    }, 0);
  }

  /**
   * Formata valor monetário
   */
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Formata variação monetária
   */
  static formatVariation(value: number): string {
    const formatted = this.formatCurrency(Math.abs(value));
    return value >= 0 ? `+${formatted}` : `-${formatted}`;
  }

  /**
   * Valida se uma operação pode ser realizada baseada no saldo da conta origem
   */
  static validateOperationBalance(
    sourceAccount: Account,
    operationValue: number,
    operations: Operation[]
  ): { isValid: boolean; currentBalance: number; requiredBalance: number; errorMessage?: string } {
    const currentBalance = this.calculateAccountBalance(sourceAccount, operations);
    const requiredBalance = Math.abs(operationValue);
    
    // Para contas próprias, verifica se há saldo suficiente
    if (sourceAccount.type === 'propria') {
      if (currentBalance < requiredBalance) {
        return {
          isValid: false,
          currentBalance,
          requiredBalance,
          errorMessage: `Saldo insuficiente! Saldo atual: ${this.formatCurrency(currentBalance)}, Valor necessário: ${this.formatCurrency(requiredBalance)}`
        };
      }
    }
    
    return {
      isValid: true,
      currentBalance,
      requiredBalance
    };
  }

  /**
   * Verifica se uma operação deixaria a conta com saldo negativo
   */
  static wouldLeaveNegativeBalance(
    sourceAccount: Account,
    operationValue: number,
    operations: Operation[]
  ): boolean {
    const currentBalance = this.calculateAccountBalance(sourceAccount, operations);
    const newBalance = currentBalance - Math.abs(operationValue);
    return newBalance < 0;
  }
} 