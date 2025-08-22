import { SQLiteAlertRepository } from '../../../../clean-architecture/data/repositories/SQLiteAlertRepository';
import { Alert } from '../../../../clean-architecture/domain/entities/Alert';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

// Mock SQLite database
const mockDatabase = {
  execAsync: jest.fn(),
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  close: jest.fn()
};

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => mockDatabase)
}));

describe('SQLiteAlertRepository', () => {
  let repository: SQLiteAlertRepository;

  beforeEach(() => {
    repository = new SQLiteAlertRepository();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Note: Database initialization is not explicitly tested in other repositories
  // as it's called in the constructor and handled internally

  describe('save', () => {
    it('should save a new alert', async () => {
      const alert = new Alert({
        id: 'alert-123',
        accountId: 'account-456',
        accountName: 'Conta Corrente',
        type: 'low_balance',
        message: 'Saldo baixo na conta Conta Corrente',
        severity: 'warning',
        value: new Money(50, 'BRL'),
        threshold: new Money(100, 'BRL'),
        isDismissed: false,
        createdAt: new Date('2024-01-01T10:00:00Z')
      });

      mockDatabase.runAsync.mockResolvedValue({ changes: 1 });

      const savedAlert = await repository.save(alert);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO alerts'),
        expect.arrayContaining([
          'alert-123',
          'account-456',
          'Conta Corrente',
          'low_balance',
          'Saldo baixo na conta Conta Corrente',
          'warning',
          50,
          100,
          0, // isDismissed as integer
          '2024-01-01T10:00:00.000Z',
          null // dismissedAt
        ])
      );
      expect(savedAlert).toEqual(alert);
    });

    it('should save a dismissed alert', async () => {
      const dismissedAt = new Date('2024-01-01T12:00:00Z');
      const alert = new Alert({
        id: 'alert-123',
        accountId: 'account-456',
        accountName: 'Conta Corrente',
        type: 'negative_balance',
        message: 'Saldo negativo na conta Conta Corrente',
        severity: 'error',
        value: Money.fromNegativeValue(-100, 'BRL'),
        threshold: new Money(0, 'BRL'),
        isDismissed: true,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        dismissedAt: dismissedAt
      });

      mockDatabase.runAsync.mockResolvedValue({ changes: 1 });

      const savedAlert = await repository.save(alert);

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO alerts'),
        expect.arrayContaining([
          'alert-123',
          'account-456',
          'Conta Corrente',
          'negative_balance',
          'Saldo negativo na conta Conta Corrente',
          'error',
          -100,
          0,
          1, // isDismissed as integer
          '2024-01-01T10:00:00.000Z',
          '2024-01-01T12:00:00.000Z'
        ])
      );
      expect(savedAlert).toEqual(alert);
    });
  });

  describe('findById', () => {
    it('should find alert by id', async () => {
      const alertData = {
        id: 'alert-123',
        account_id: 'account-456',
        account_name: 'Conta Corrente',
        type: 'low_balance',
        message: 'Saldo baixo na conta Conta Corrente',
        severity: 'warning',
        value: 50,
        threshold: 100,
        is_dismissed: 0,
        created_at: '2024-01-01T10:00:00.000Z',
        dismissed_at: null
      };

      mockDatabase.getFirstAsync.mockResolvedValue(alertData);

      const alert = await repository.findById('alert-123');

      expect(mockDatabase.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM alerts WHERE id = ?'),
        ['alert-123']
      );
      expect(alert).toBeInstanceOf(Alert);
      expect(alert?.id).toBe('alert-123');
      expect(alert?.accountId).toBe('account-456');
      expect(alert?.type).toBe('low_balance');
      expect(alert?.severity).toBe('warning');
      expect(alert?.isDismissed).toBe(false);
    });

    it('should return null when alert not found', async () => {
      mockDatabase.getFirstAsync.mockResolvedValue(null);

      const alert = await repository.findById('non-existent');

      expect(alert).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all alerts', async () => {
      const alertsData = [
        {
          id: 'alert-1',
          account_id: 'account-1',
          account_name: 'Conta Corrente',
          type: 'low_balance',
          message: 'Saldo baixo',
          severity: 'warning',
          value: 50,
          threshold: 100,
          is_dismissed: 0,
          created_at: '2024-01-01T10:00:00.000Z',
          dismissed_at: null
        },
        {
          id: 'alert-2',
          account_id: 'account-2',
          account_name: 'Cartão de Crédito',
          type: 'credit_limit',
          message: 'Limite próximo',
          severity: 'error',
          value: 900,
          threshold: 800,
          is_dismissed: 1,
          created_at: '2024-01-01T11:00:00.000Z',
          dismissed_at: '2024-01-01T12:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(alertsData);

      const alerts = await repository.findAll();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM alerts')
      );
      expect(alerts).toHaveLength(2);
      expect(alerts[0]).toBeInstanceOf(Alert);
      expect(alerts[1]).toBeInstanceOf(Alert);
      expect(alerts[0].id).toBe('alert-1');
      expect(alerts[1].id).toBe('alert-2');
      expect(alerts[1].isDismissed).toBe(true);
    });

    it('should return empty array when no alerts found', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([]);

      const alerts = await repository.findAll();

      expect(alerts).toEqual([]);
    });
  });

  describe('findByAccount', () => {
    it('should find alerts by account id', async () => {
      const alertsData = [
        {
          id: 'alert-1',
          account_id: 'account-456',
          account_name: 'Conta Corrente',
          type: 'low_balance',
          message: 'Saldo baixo',
          severity: 'warning',
          value: 50,
          threshold: 100,
          is_dismissed: 0,
          created_at: '2024-01-01T10:00:00.000Z',
          dismissed_at: null
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(alertsData);

      const alerts = await repository.findByAccount('account-456');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM alerts WHERE account_id = ?'),
        ['account-456']
      );
      expect(alerts).toHaveLength(1);
      expect(alerts[0].accountId).toBe('account-456');
    });
  });

  describe('findByType', () => {
    it('should find alerts by type', async () => {
      const alertsData = [
        {
          id: 'alert-1',
          account_id: 'account-1',
          account_name: 'Conta Corrente',
          type: 'low_balance',
          message: 'Saldo baixo',
          severity: 'warning',
          value: 50,
          threshold: 100,
          is_dismissed: 0,
          created_at: '2024-01-01T10:00:00.000Z',
          dismissed_at: null
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(alertsData);

      const alerts = await repository.findByType('low_balance');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM alerts WHERE type = ?'),
        ['low_balance']
      );
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('low_balance');
    });
  });

  describe('findBySeverity', () => {
    it('should find alerts by severity', async () => {
      const alertsData = [
        {
          id: 'alert-1',
          account_id: 'account-1',
          account_name: 'Conta Corrente',
          type: 'negative_balance',
          message: 'Saldo negativo',
          severity: 'error',
          value: -100,
          threshold: 0,
          is_dismissed: 0,
          created_at: '2024-01-01T10:00:00.000Z',
          dismissed_at: null
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(alertsData);

      const alerts = await repository.findBySeverity('error');

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM alerts WHERE severity = ?'),
        ['error']
      );
      expect(alerts).toHaveLength(1);
      expect(alerts[0].severity).toBe('error');
    });
  });

  describe('findActive', () => {
    it('should find active (non-dismissed) alerts', async () => {
      const alertsData = [
        {
          id: 'alert-1',
          account_id: 'account-1',
          account_name: 'Conta Corrente',
          type: 'low_balance',
          message: 'Saldo baixo',
          severity: 'warning',
          value: 50,
          threshold: 100,
          is_dismissed: 0,
          created_at: '2024-01-01T10:00:00.000Z',
          dismissed_at: null
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(alertsData);

      const alerts = await repository.findActive();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM alerts WHERE is_dismissed = 0')
      );
      expect(alerts).toHaveLength(1);
      expect(alerts[0].isActive()).toBe(true);
    });
  });

  describe('findDismissed', () => {
    it('should find dismissed alerts', async () => {
      const alertsData = [
        {
          id: 'alert-1',
          account_id: 'account-1',
          account_name: 'Conta Corrente',
          type: 'low_balance',
          message: 'Saldo baixo',
          severity: 'warning',
          value: 50,
          threshold: 100,
          is_dismissed: 1,
          created_at: '2024-01-01T10:00:00.000Z',
          dismissed_at: '2024-01-01T12:00:00.000Z'
        }
      ];

      mockDatabase.getAllAsync.mockResolvedValue(alertsData);

      const alerts = await repository.findDismissed();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM alerts WHERE is_dismissed = 1')
      );
      expect(alerts).toHaveLength(1);
      expect(alerts[0].isDismissed).toBe(true);
    });
  });

  describe('dismiss', () => {
    it('should dismiss an alert', async () => {
      const alertData = {
        id: 'alert-123',
        account_id: 'account-456',
        account_name: 'Conta Corrente',
        type: 'low_balance',
        message: 'Saldo baixo na conta Conta Corrente',
        severity: 'warning',
        value: 50,
        threshold: 100,
        is_dismissed: 0,
        created_at: '2024-01-01T10:00:00.000Z',
        dismissed_at: null
      };

      mockDatabase.getFirstAsync.mockResolvedValue(alertData);
      mockDatabase.runAsync.mockResolvedValue({ changes: 1 });

      const dismissedAlert = await repository.dismiss('alert-123');

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE alerts'),
        expect.arrayContaining([expect.any(String), 'alert-123'])
      );
      expect(dismissedAlert.isDismissed).toBe(true);
      expect(dismissedAlert.dismissedAt).toBeInstanceOf(Date);
    });
  });

  describe('delete', () => {
    it('should delete alert by id', async () => {
      mockDatabase.runAsync.mockResolvedValue({ changes: 1 });

      const result = await repository.delete('alert-123');

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM alerts WHERE id = ?'),
        ['alert-123']
      );
      expect(result).toBe(true);
    });

    it('should return false when alert not found', async () => {
      mockDatabase.runAsync.mockResolvedValue({ changes: 0 });

      const result = await repository.delete('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('deleteAll', () => {
    it('should delete all alerts', async () => {
      mockDatabase.runAsync.mockResolvedValue({ changes: 5 });

      await repository.deleteAll();

      expect(mockDatabase.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM alerts')
      );
    });
  });

  describe('count', () => {
    it('should count all alerts', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([{ count: 3 }]);

      const count = await repository.count();

      expect(mockDatabase.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count FROM alerts')
      );
      expect(count).toBe(3);
    });

    it('should return 0 when no alerts', async () => {
      mockDatabase.getAllAsync.mockResolvedValue([{ count: 0 }]);

      const count = await repository.count();

      expect(count).toBe(0);
    });
  });
});
