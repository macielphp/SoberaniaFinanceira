import { Alert } from '../../../../clean-architecture/domain/entities/Alert';
import { Money } from '../../../../clean-architecture/shared/utils/Money';
import { AlertType, AlertSeverity } from '../../../../clean-architecture/domain/entities/Alert';

describe('Alert Entity', () => {
  const mockAlertData = {
    id: 'alert-123',
    accountId: 'account-456',
    accountName: 'Conta Corrente',
    type: 'low_balance' as AlertType,
    message: 'Saldo baixo na conta Conta Corrente',
    severity: 'warning' as AlertSeverity,
    value: new Money(50, 'BRL'),
    threshold: new Money(100, 'BRL'),
    isDismissed: false,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    dismissedAt: undefined
  };

  describe('Creation', () => {
    it('should create a valid alert', () => {
      const alert = new Alert(mockAlertData);

      expect(alert.id).toBe('alert-123');
      expect(alert.accountId).toBe('account-456');
      expect(alert.accountName).toBe('Conta Corrente');
      expect(alert.type).toBe('low_balance');
      expect(alert.message).toBe('Saldo baixo na conta Conta Corrente');
      expect(alert.severity).toBe('warning');
      expect(alert.value).toEqual(new Money(50, 'BRL'));
      expect(alert.threshold).toEqual(new Money(100, 'BRL'));
      expect(alert.isDismissed).toBe(false);
      expect(alert.isActive()).toBe(true);
    });

    it('should create alert with required fields only', () => {
      const alert = new Alert({
        id: 'alert-123',
        accountId: 'account-456',
        accountName: 'Conta Corrente',
        type: 'negative_balance',
        message: 'Saldo negativo',
        severity: 'error',
        value: Money.fromNegativeValue(-100, 'BRL'),
        threshold: new Money(0, 'BRL')
      });

      expect(alert.id).toBe('alert-123');
      expect(alert.isDismissed).toBe(false);
      expect(alert.createdAt).toBeInstanceOf(Date);
      expect(alert.dismissedAt).toBeUndefined();
    });

    it('should throw error for invalid alert type', () => {
      expect(() => {
        new Alert({
          ...mockAlertData,
          type: 'invalid_type' as any
        });
      }).toThrow('Invalid alert type');
    });

    it('should throw error for invalid severity', () => {
      expect(() => {
        new Alert({
          ...mockAlertData,
          severity: 'invalid_severity' as any
        });
      }).toThrow('Invalid alert severity');
    });

    it('should throw error for empty message', () => {
      expect(() => {
        new Alert({
          ...mockAlertData,
          message: ''
        });
      }).toThrow('Alert message cannot be empty');
    });

    it('should throw error for empty account name', () => {
      expect(() => {
        new Alert({
          ...mockAlertData,
          accountName: ''
        });
      }).toThrow('Account name cannot be empty');
    });
  });

  describe('Alert Status', () => {
    it('should be active when not dismissed', () => {
      const alert = new Alert(mockAlertData);
      expect(alert.isActive()).toBe(true);
    });

    it('should not be active when dismissed', () => {
      const alert = new Alert({
        ...mockAlertData,
        isDismissed: true,
        dismissedAt: new Date()
      });
      expect(alert.isActive()).toBe(false);
    });

    it('should identify critical alerts', () => {
      const criticalAlert = new Alert({
        ...mockAlertData,
        severity: 'error'
      });
      expect(criticalAlert.isCritical()).toBe(true);
    });

    it('should not identify warning alerts as critical', () => {
      const warningAlert = new Alert({
        ...mockAlertData,
        severity: 'warning'
      });
      expect(warningAlert.isCritical()).toBe(false);
    });
  });

  describe('Alert Actions', () => {
    it('should dismiss alert', () => {
      const alert = new Alert(mockAlertData);
      const dismissedAlert = alert.dismiss();

      expect(dismissedAlert.isDismissed).toBe(true);
      expect(dismissedAlert.isActive()).toBe(false);
      expect(dismissedAlert.dismissedAt).toBeInstanceOf(Date);
      expect(dismissedAlert.dismissedAt?.getTime()).toBeGreaterThan(alert.createdAt.getTime());
    });

    it('should not dismiss already dismissed alert', () => {
      const dismissedAlert = new Alert({
        ...mockAlertData,
        isDismissed: true,
        dismissedAt: new Date()
      });

      expect(() => dismissedAlert.dismiss()).toThrow('Alert is already dismissed');
    });
  });

  describe('Alert Information', () => {
    it('should get formatted message', () => {
      const alert = new Alert(mockAlertData);
      const formattedMessage = alert.getFormattedMessage();

      expect(formattedMessage).toContain('Saldo baixo na conta Conta Corrente');
      expect(formattedMessage).toContain('R$');
      expect(formattedMessage).toContain('50');
    });

    it('should get correct icon for low balance alert', () => {
      const alert = new Alert(mockAlertData);
      expect(alert.getIcon()).toBe('⚠️');
    });

    it('should get correct icon for negative balance alert', () => {
      const alert = new Alert({
        ...mockAlertData,
        type: 'negative_balance'
      });
      expect(alert.getIcon()).toBe('🚨');
    });

    it('should get correct icon for credit limit alert', () => {
      const alert = new Alert({
        ...mockAlertData,
        type: 'credit_limit'
      });
      expect(alert.getIcon()).toBe('💳');
    });

    it('should get correct color for warning severity', () => {
      const alert = new Alert(mockAlertData);
      expect(alert.getColor()).toBe('#FF9800'); // warning color
    });

    it('should get correct color for error severity', () => {
      const alert = new Alert({
        ...mockAlertData,
        severity: 'error'
      });
      expect(alert.getColor()).toBe('#F44336'); // error color
    });
  });

  describe('Alert Types', () => {
    it('should handle low balance alert type', () => {
      const alert = new Alert({
        ...mockAlertData,
        type: 'low_balance'
      });
      expect(alert.type).toBe('low_balance');
    });

    it('should handle negative balance alert type', () => {
      const alert = new Alert({
        ...mockAlertData,
        type: 'negative_balance'
      });
      expect(alert.type).toBe('negative_balance');
    });

    it('should handle credit limit alert type', () => {
      const alert = new Alert({
        ...mockAlertData,
        type: 'credit_limit'
      });
      expect(alert.type).toBe('credit_limit');
    });
  });

  describe('Alert Severity', () => {
    it('should handle warning severity', () => {
      const alert = new Alert({
        ...mockAlertData,
        severity: 'warning'
      });
      expect(alert.severity).toBe('warning');
      expect(alert.isCritical()).toBe(false);
    });

    it('should handle error severity', () => {
      const alert = new Alert({
        ...mockAlertData,
        severity: 'error'
      });
      expect(alert.severity).toBe('error');
      expect(alert.isCritical()).toBe(true);
    });
  });

  describe('Value and Threshold', () => {
    it('should handle positive values', () => {
      const alert = new Alert(mockAlertData);
      expect(alert.value.value).toBe(50);
      expect(alert.threshold.value).toBe(100);
    });

    it('should handle negative values for negative balance alerts', () => {
      const alert = new Alert({
        ...mockAlertData,
        type: 'negative_balance',
        value: Money.fromNegativeValue(-100, 'BRL'),
        threshold: new Money(0, 'BRL')
      });
      expect(alert.value.value).toBe(-100);
      expect(alert.threshold.value).toBe(0);
    });

    it('should handle zero threshold', () => {
      const alert = new Alert({
        ...mockAlertData,
        threshold: new Money(0, 'BRL')
      });
      expect(alert.threshold.value).toBe(0);
    });
  });
});
