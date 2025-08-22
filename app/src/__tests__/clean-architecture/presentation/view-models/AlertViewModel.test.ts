import { AlertViewModel } from '../../../../clean-architecture/presentation/view-models/AlertViewModel';
import { Alert, AlertType, AlertSeverity } from '../../../../clean-architecture/domain/entities/Alert';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock repository
const mockRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByAccount: jest.fn(),
  findByType: jest.fn(),
  findBySeverity: jest.fn(),
  findActive: jest.fn(),
  findDismissed: jest.fn(),
  dismiss: jest.fn(),
  delete: jest.fn(),
  deleteAll: jest.fn(),
  count: jest.fn()
};

describe('AlertViewModel', () => {
  let viewModel: AlertViewModel;

  beforeEach(() => {
    viewModel = new AlertViewModel(mockRepository);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty state', () => {
      expect(viewModel.alerts).toEqual([]);
      expect(viewModel.loading).toBe(false);
      expect(viewModel.error).toBeNull();
      expect(viewModel.activeAlerts).toEqual([]);
      expect(viewModel.dismissedAlerts).toEqual([]);
    });
  });

  describe('Loading State Management', () => {
    it('should set loading state', () => {
      viewModel.setLoading(true);
      expect(viewModel.loading).toBe(true);

      viewModel.setLoading(false);
      expect(viewModel.loading).toBe(false);
    });
  });

  describe('Error State Management', () => {
    it('should set error state', () => {
      const errorMessage = 'Failed to load alerts';
      viewModel.setError(errorMessage);
      expect(viewModel.error).toBe(errorMessage);
    });

    it('should clear error state', () => {
      viewModel.setError('Some error');
      viewModel.clearError();
      expect(viewModel.error).toBeNull();
    });
  });

  describe('Alert Management', () => {
    const mockAlert = new Alert({
      id: 'alert-123',
      accountId: 'account-456',
      accountName: 'Conta Corrente',
      type: 'low_balance',
      message: 'Saldo baixo na conta Conta Corrente',
      severity: 'warning',
      value: new Money(50, 'BRL'),
      threshold: new Money(100, 'BRL')
    });

    const mockDismissedAlert = new Alert({
      id: 'alert-456',
      accountId: 'account-789',
      accountName: 'Cartão de Crédito',
      type: 'credit_limit',
      message: 'Limite próximo do cartão',
      severity: 'error',
      value: new Money(900, 'BRL'),
      threshold: new Money(800, 'BRL'),
      isDismissed: true,
      dismissedAt: new Date()
    });

    describe('loadAlerts', () => {
      it('should load all alerts successfully', async () => {
        const alerts = [mockAlert, mockDismissedAlert];
        mockRepository.findAll.mockResolvedValue(alerts);

        await viewModel.loadAlerts();

        expect(mockRepository.findAll).toHaveBeenCalled();
        expect(viewModel.alerts).toEqual(alerts);
        expect(viewModel.activeAlerts).toEqual([mockAlert]);
        expect(viewModel.dismissedAlerts).toEqual([mockDismissedAlert]);
        expect(viewModel.loading).toBe(false);
        expect(viewModel.error).toBeNull();
      });

      it('should handle loading error', async () => {
        const error = new Error('Database connection failed');
        mockRepository.findAll.mockRejectedValue(error);

        await viewModel.loadAlerts();

        expect(viewModel.error).toBe('Database connection failed');
        expect(viewModel.loading).toBe(false);
        expect(viewModel.alerts).toEqual([]);
      });

      it('should set loading state during operation', async () => {
        mockRepository.findAll.mockResolvedValue([]);

        const loadPromise = viewModel.loadAlerts();
        expect(viewModel.loading).toBe(true);

        await loadPromise;
        expect(viewModel.loading).toBe(false);
      });
    });

    describe('loadActiveAlerts', () => {
      it('should load only active alerts', async () => {
        const activeAlerts = [mockAlert];
        mockRepository.findActive.mockResolvedValue(activeAlerts);

        await viewModel.loadActiveAlerts();

        expect(mockRepository.findActive).toHaveBeenCalled();
        expect(viewModel.activeAlerts).toEqual(activeAlerts);
        expect(viewModel.loading).toBe(false);
        expect(viewModel.error).toBeNull();
      });
    });

    describe('loadDismissedAlerts', () => {
      it('should load only dismissed alerts', async () => {
        const dismissedAlerts = [mockDismissedAlert];
        mockRepository.findDismissed.mockResolvedValue(dismissedAlerts);

        await viewModel.loadDismissedAlerts();

        expect(mockRepository.findDismissed).toHaveBeenCalled();
        expect(viewModel.dismissedAlerts).toEqual(dismissedAlerts);
        expect(viewModel.loading).toBe(false);
        expect(viewModel.error).toBeNull();
      });
    });

    describe('saveAlert', () => {
      it('should save alert successfully', async () => {
        mockRepository.save.mockResolvedValue(mockAlert);

        const result = await viewModel.saveAlert(mockAlert);

        expect(mockRepository.save).toHaveBeenCalledWith(mockAlert);
        expect(result).toEqual(mockAlert);
        expect(viewModel.error).toBeNull();
      });

      it('should handle save error', async () => {
        const error = new Error('Save failed');
        mockRepository.save.mockRejectedValue(error);

        await expect(viewModel.saveAlert(mockAlert)).rejects.toThrow('Save failed');
        expect(viewModel.error).toBe('Save failed');
      });
    });

    describe('dismissAlert', () => {
      it('should dismiss alert successfully', async () => {
        const dismissedAlert = mockAlert.dismiss();
        mockRepository.dismiss.mockResolvedValue(dismissedAlert);

        const result = await viewModel.dismissAlert('alert-123');

        expect(mockRepository.dismiss).toHaveBeenCalledWith('alert-123');
        expect(result).toEqual(dismissedAlert);
        expect(viewModel.error).toBeNull();
      });

      it('should handle dismiss error', async () => {
        const error = new Error('Dismiss failed');
        mockRepository.dismiss.mockRejectedValue(error);

        await expect(viewModel.dismissAlert('alert-123')).rejects.toThrow('Dismiss failed');
        expect(viewModel.error).toBe('Dismiss failed');
      });
    });

    describe('deleteAlert', () => {
      it('should delete alert successfully', async () => {
        mockRepository.delete.mockResolvedValue(true);

        const result = await viewModel.deleteAlert('alert-123');

        expect(mockRepository.delete).toHaveBeenCalledWith('alert-123');
        expect(result).toBe(true);
        expect(viewModel.error).toBeNull();
      });

      it('should handle delete error', async () => {
        const error = new Error('Delete failed');
        mockRepository.delete.mockRejectedValue(error);

        await expect(viewModel.deleteAlert('alert-123')).rejects.toThrow('Delete failed');
        expect(viewModel.error).toBe('Delete failed');
      });
    });

    describe('findAlertById', () => {
      it('should find alert by id', async () => {
        mockRepository.findById.mockResolvedValue(mockAlert);

        const result = await viewModel.findAlertById('alert-123');

        expect(mockRepository.findById).toHaveBeenCalledWith('alert-123');
        expect(result).toEqual(mockAlert);
      });

      it('should return null when alert not found', async () => {
        mockRepository.findById.mockResolvedValue(null);

        const result = await viewModel.findAlertById('non-existent');

        expect(result).toBeNull();
      });
    });

    describe('findAlertsByAccount', () => {
      it('should find alerts by account', async () => {
        const accountAlerts = [mockAlert];
        mockRepository.findByAccount.mockResolvedValue(accountAlerts);

        const result = await viewModel.findAlertsByAccount('account-456');

        expect(mockRepository.findByAccount).toHaveBeenCalledWith('account-456');
        expect(result).toEqual(accountAlerts);
      });
    });

    describe('findAlertsByType', () => {
      it('should find alerts by type', async () => {
        const typeAlerts = [mockAlert];
        mockRepository.findByType.mockResolvedValue(typeAlerts);

        const result = await viewModel.findAlertsByType('low_balance');

        expect(mockRepository.findByType).toHaveBeenCalledWith('low_balance');
        expect(result).toEqual(typeAlerts);
      });
    });

    describe('findAlertsBySeverity', () => {
      it('should find alerts by severity', async () => {
        const severityAlerts = [mockAlert];
        mockRepository.findBySeverity.mockResolvedValue(severityAlerts);

        const result = await viewModel.findAlertsBySeverity('warning');

        expect(mockRepository.findBySeverity).toHaveBeenCalledWith('warning');
        expect(result).toEqual(severityAlerts);
      });
    });

    describe('getAlertCount', () => {
      it('should get total alert count', async () => {
        mockRepository.count.mockResolvedValue(5);

        const result = await viewModel.getAlertCount();

        expect(mockRepository.count).toHaveBeenCalled();
        expect(result).toBe(5);
      });
    });

    describe('clearAllAlerts', () => {
      it('should clear all alerts', async () => {
        mockRepository.deleteAll.mockResolvedValue(undefined);

        await viewModel.clearAllAlerts();

        expect(mockRepository.deleteAll).toHaveBeenCalled();
        expect(viewModel.alerts).toEqual([]);
        expect(viewModel.activeAlerts).toEqual([]);
        expect(viewModel.dismissedAlerts).toEqual([]);
      });
    });
  });

  describe('Computed Properties', () => {
    beforeEach(() => {
      const activeAlert = new Alert({
        id: 'alert-1',
        accountId: 'account-1',
        accountName: 'Conta Corrente',
        type: 'low_balance',
        message: 'Saldo baixo',
        severity: 'warning',
        value: new Money(50, 'BRL'),
        threshold: new Money(100, 'BRL')
      });

      const dismissedAlert = new Alert({
        id: 'alert-2',
        accountId: 'account-2',
        accountName: 'Cartão de Crédito',
        type: 'credit_limit',
        message: 'Limite próximo',
        severity: 'error',
        value: new Money(900, 'BRL'),
        threshold: new Money(800, 'BRL'),
        isDismissed: true,
        dismissedAt: new Date()
      });

      viewModel.updateAlerts([activeAlert, dismissedAlert]);
    });

    it('should filter active alerts correctly', () => {
      expect(viewModel.activeAlerts).toHaveLength(1);
      expect(viewModel.activeAlerts[0].isActive()).toBe(true);
    });

    it('should filter dismissed alerts correctly', () => {
      expect(viewModel.dismissedAlerts).toHaveLength(1);
      expect(viewModel.dismissedAlerts[0].isDismissed).toBe(true);
    });

    it('should get critical alerts', () => {
      const criticalAlerts = viewModel.getCriticalAlerts();
      expect(criticalAlerts).toHaveLength(1);
      expect(criticalAlerts[0].isCritical()).toBe(true);
    });

    it('should get warning alerts', () => {
      const warningAlerts = viewModel.getWarningAlerts();
      expect(warningAlerts).toHaveLength(1);
      expect(warningAlerts[0].severity).toBe('warning');
    });

    it('should get alerts by account', () => {
      const accountAlerts = viewModel.getAlertsByAccount('account-1');
      expect(accountAlerts).toHaveLength(1);
      expect(accountAlerts[0].accountId).toBe('account-1');
    });

    it('should get alerts by type', () => {
      const typeAlerts = viewModel.getAlertsByType('low_balance');
      expect(typeAlerts).toHaveLength(1);
      expect(typeAlerts[0].type).toBe('low_balance');
    });
  });

  describe('State Updates', () => {
    it('should update alerts list', () => {
      const newAlert = new Alert({
        id: 'alert-789',
        accountId: 'account-999',
        accountName: 'Nova Conta',
        type: 'negative_balance',
        message: 'Saldo negativo',
        severity: 'error',
        value: Money.fromNegativeValue(-100, 'BRL'),
        threshold: new Money(0, 'BRL')
      });
      const newAlerts = [newAlert];
      viewModel.updateAlerts(newAlerts);

      expect(viewModel.alerts).toEqual(newAlerts);
    });

    it('should add alert to list', () => {
      const initialAlert = new Alert({
        id: 'alert-123',
        accountId: 'account-456',
        accountName: 'Conta Corrente',
        type: 'low_balance',
        message: 'Saldo baixo na conta Conta Corrente',
        severity: 'warning',
        value: new Money(50, 'BRL'),
        threshold: new Money(100, 'BRL')
      });
      const initialAlerts = [initialAlert];
      viewModel.updateAlerts(initialAlerts);

      const newAlert = new Alert({
        id: 'alert-789',
        accountId: 'account-999',
        accountName: 'Nova Conta',
        type: 'negative_balance',
        message: 'Saldo negativo',
        severity: 'error',
        value: Money.fromNegativeValue(-100, 'BRL'),
        threshold: new Money(0, 'BRL')
      });

      viewModel.addAlert(newAlert);

      expect(viewModel.alerts).toHaveLength(2);
      expect(viewModel.alerts).toContain(newAlert);
    });

    it('should remove alert from list', () => {
      const alert = new Alert({
        id: 'alert-123',
        accountId: 'account-456',
        accountName: 'Conta Corrente',
        type: 'low_balance',
        message: 'Saldo baixo na conta Conta Corrente',
        severity: 'warning',
        value: new Money(50, 'BRL'),
        threshold: new Money(100, 'BRL')
      });
      const alerts = [alert];
      viewModel.updateAlerts(alerts);

      viewModel.removeAlert('alert-123');

      expect(viewModel.alerts).toHaveLength(0);
    });

    it('should update specific alert', () => {
      const alert = new Alert({
        id: 'alert-123',
        accountId: 'account-456',
        accountName: 'Conta Corrente',
        type: 'low_balance',
        message: 'Saldo baixo na conta Conta Corrente',
        severity: 'warning',
        value: new Money(50, 'BRL'),
        threshold: new Money(100, 'BRL')
      });
      const alerts = [alert];
      viewModel.updateAlerts(alerts);

      const updatedAlert = new Alert({
        id: 'alert-123',
        accountId: 'account-456',
        accountName: 'Conta Corrente',
        type: 'low_balance',
        message: 'Mensagem atualizada',
        severity: 'warning',
        value: new Money(50, 'BRL'),
        threshold: new Money(100, 'BRL')
      });

      viewModel.updateAlert(updatedAlert);

      expect(viewModel.alerts[0].message).toBe('Mensagem atualizada');
    });
  });

  describe('Validation', () => {
    it('should validate alert data', () => {
      const validData = {
        accountId: 'account-123',
        accountName: 'Conta Teste',
        type: 'low_balance' as AlertType,
        message: 'Teste de validação',
        severity: 'warning' as AlertSeverity,
        value: new Money(50, 'BRL'),
        threshold: new Money(100, 'BRL')
      };

      const result = viewModel.validateAlertData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return validation errors for invalid data', () => {
      const invalidData = {
        accountId: '',
        accountName: '',
        type: 'invalid_type' as any,
        message: '',
        severity: 'invalid_severity' as any,
        value: new Money(50, 'BRL'),
        threshold: new Money(100, 'BRL')
      };

      const result = viewModel.validateAlertData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
