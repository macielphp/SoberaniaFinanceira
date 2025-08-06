import { AccountViewModel } from '../../../../clean-architecture/presentation/view-models/AccountViewModel';
import { IAccountRepository } from '../../../../clean-architecture/domain/repositories/IAccountRepository';
import { Account, AccountProps } from '../../../../clean-architecture/domain/entities/Account';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('AccountViewModel', () => {
  let viewModel: AccountViewModel;
  let mockAccountRepository: jest.Mocked<IAccountRepository>;

  beforeEach(() => {
    mockAccountRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findActive: jest.fn(),
      findByType: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      countActive: jest.fn(),
    } as any;
    viewModel = new AccountViewModel(mockAccountRepository);
  });

  it('deve inicializar com lista de contas vazia', () => {
    expect(viewModel.accounts).toEqual([]);
  });

  it('deve buscar todas as contas do repositório', async () => {
    const mockAccounts = [
      new Account({
        id: '1',
        name: 'Conta Corrente',
        type: 'corrente',
        balance: new Money(1000),
        isActive: true,
        createdAt: new Date(),
      }),
    ];
    mockAccountRepository.findAll.mockResolvedValue(mockAccounts);
    await viewModel.loadAccounts();
    expect(viewModel.accounts).toEqual(mockAccounts);
    expect(mockAccountRepository.findAll).toHaveBeenCalled();
  });

  it('deve criar uma nova conta e atualizar a lista', async () => {
    const accountProps: AccountProps = {
      id: '2',
      name: 'Conta Poupança',
      type: 'poupanca',
      balance: new Money(2000),
      isActive: true,
      createdAt: new Date(),
    };
    const newAccount = new Account(accountProps);
    mockAccountRepository.save.mockResolvedValue(newAccount);
    mockAccountRepository.findAll.mockResolvedValue([newAccount]);
    await viewModel.createAccount(accountProps);
    expect(mockAccountRepository.save).toHaveBeenCalledWith(expect.any(Account));
    expect(viewModel.accounts).toEqual([newAccount]);
  });

  it('deve atualizar uma conta existente e atualizar a lista', async () => {
    const originalAccountProps: AccountProps = {
      id: '3',
      name: 'Conta Investimento',
      type: 'investimento',
      balance: new Money(5000),
      isActive: true,
      createdAt: new Date(),
    };
    const updatedAccountProps: AccountProps = {
      ...originalAccountProps,
      name: 'Conta Investimento Atualizada',
      balance: new Money(6000),
    };
    const updatedAccount = new Account(updatedAccountProps);
    mockAccountRepository.save.mockResolvedValue(updatedAccount);
    mockAccountRepository.findAll.mockResolvedValue([updatedAccount]);
    await viewModel.updateAccount(updatedAccountProps);
    expect(mockAccountRepository.save).toHaveBeenCalledWith(expect.any(Account));
    expect(viewModel.accounts).toEqual([updatedAccount]);
  });

  it('deve remover uma conta pelo id e atualizar a lista', async () => {
    const accountId = '4';
    mockAccountRepository.delete.mockResolvedValue(true);
    mockAccountRepository.findAll.mockResolvedValue([]);
    await viewModel.deleteAccount(accountId);
    expect(mockAccountRepository.delete).toHaveBeenCalledWith(accountId);
    expect(viewModel.accounts).toEqual([]);
  });
});