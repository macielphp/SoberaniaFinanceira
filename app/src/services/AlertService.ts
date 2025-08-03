import { Account } from '../database/accounts';
import { AccountBalance } from './AccountService';

export interface AccountAlert {
  accountId: string;
  accountName: string;
  type: 'low_balance' | 'credit_limit' | 'negative_balance';
  message: string;
  severity: 'warning' | 'error';
  value: number;
  threshold: number;
}

export class AlertService {
  /**
   * Verifica alertas para uma conta específica
   */
  static checkAccountAlerts(account: Account, balance: AccountBalance, creditLimit?: number): AccountAlert[] {
    const alerts: AccountAlert[] = [];

    // Alerta de saldo baixo (menos de R$ 100)
    if (account.type === 'propria' && balance.currentBalance < 100 && balance.currentBalance > 0) {
      alerts.push({
        accountId: account.id,
        accountName: account.name,
        type: 'low_balance',
        message: `Saldo baixo na conta ${account.name}`,
        severity: 'warning',
        value: balance.currentBalance,
        threshold: 100,
      });
    }

    // Alerta de saldo negativo
    if (account.type === 'propria' && balance.currentBalance < 0) {
      alerts.push({
        accountId: account.id,
        accountName: account.name,
        type: 'negative_balance',
        message: `Saldo negativo na conta ${account.name}`,
        severity: 'error',
        value: balance.currentBalance,
        threshold: 0,
      });
    }

    // Alerta de limite de crédito próximo (80% do limite)
    if (creditLimit && account.name.toLowerCase().includes('cartão')) {
      const usedAmount = Math.abs(balance.currentBalance);
      const usagePercentage = (usedAmount / creditLimit) * 100;
      
      if (usagePercentage >= 80) {
        alerts.push({
          accountId: account.id,
          accountName: account.name,
          type: 'credit_limit',
          message: `Limite de crédito próximo do esgotamento (${usagePercentage.toFixed(1)}%)`,
          severity: usagePercentage >= 95 ? 'error' : 'warning',
          value: usedAmount,
          threshold: creditLimit * 0.8,
        });
      }
    }

    return alerts;
  }

  /**
   * Verifica alertas para todas as contas
   */
  static checkAllAccountAlerts(accounts: Account[], balances: AccountBalance[], creditLimits?: { [accountId: string]: number }): AccountAlert[] {
    const allAlerts: AccountAlert[] = [];

    accounts.forEach(account => {
      const balance = balances.find(b => b.accountId === account.id);
      if (balance) {
        const creditLimit = creditLimits?.[account.id];
        const alerts = this.checkAccountAlerts(account, balance, creditLimit);
        allAlerts.push(...alerts);
      }
    });

    return allAlerts.sort((a, b) => {
      // Priorizar erros sobre warnings
      if (a.severity !== b.severity) {
        return a.severity === 'error' ? -1 : 1;
      }
      // Ordenar por valor (mais crítico primeiro)
      return Math.abs(a.value) - Math.abs(b.value);
    });
  }

  /**
   * Formata mensagem de alerta
   */
  static formatAlertMessage(alert: AccountAlert): string {
    switch (alert.type) {
      case 'low_balance':
        return `⚠️ ${alert.message}: R$ ${alert.value.toFixed(2)}`;
      case 'negative_balance':
        return `🚨 ${alert.message}: R$ ${alert.value.toFixed(2)}`;
      case 'credit_limit':
        const percentage = ((alert.value / alert.threshold) * 100).toFixed(1);
        return `💳 ${alert.message} (${percentage}% usado)`;
      default:
        return alert.message;
    }
  }

  /**
   * Verifica se há alertas críticos
   */
  static hasCriticalAlerts(alerts: AccountAlert[]): boolean {
    return alerts.some(alert => alert.severity === 'error');
  }

  /**
   * Obtém resumo de alertas
   */
  static getAlertsSummary(alerts: AccountAlert[]): {
    total: number;
    warnings: number;
    errors: number;
    criticalAccounts: string[];
  } {
    const warnings = alerts.filter(a => a.severity === 'warning').length;
    const errors = alerts.filter(a => a.severity === 'error').length;
    const criticalAccounts = alerts
      .filter(a => a.severity === 'error')
      .map(a => a.accountName);

    return {
      total: alerts.length,
      warnings,
      errors,
      criticalAccounts,
    };
  }
} 