// Use Case: UpdateAccountUseCase
// Responsável por atualizar uma conta existente

import { IAccountRepository } from '../repositories/IAccountRepository';
import { Account, AccountProps } from '../entities/Account';

export class UpdateAccountUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(accountId: string, updateData: Partial<AccountProps>): Promise<Account> {
    // Buscar conta existente
    const existingAccount = await this.accountRepository.findById(accountId);
    if (!existingAccount) {
      throw new Error('Account not found');
    }

    // Validar dados de atualização
    this.validateUpdateData(updateData);

    // Criar nova conta com dados atualizados
    const updatedAccountProps: AccountProps = {
      id: accountId,
      name: updateData.name || existingAccount.name,
      type: updateData.type || existingAccount.type,
      balance: updateData.balance || existingAccount.balance,
      description: updateData.description || existingAccount.description,
      color: updateData.color || existingAccount.color,
      isActive: updateData.isActive !== undefined ? updateData.isActive : existingAccount.isActive,
      isDefault: updateData.isDefault !== undefined ? updateData.isDefault : existingAccount.isDefault,
      createdAt: existingAccount.createdAt, // Preservar data de criação original
    };

    // Criar nova instância da conta
    const updatedAccount = new Account(updatedAccountProps);

    // Salvar no repositório
    const savedAccount = await this.accountRepository.save(updatedAccount);

    return savedAccount;
  }

  private validateUpdateData(updateData: Partial<AccountProps>): void {
    // Validar nome se fornecido
    if (updateData.name && updateData.name.trim() === '') {
      throw new Error('Account name cannot be empty');
    }

    // Validar tipo se fornecido
    if (updateData.type && !this.isValidAccountType(updateData.type)) {
      throw new Error('Invalid account type');
    }

    // Validar saldo se fornecido
    if (updateData.balance && updateData.balance.value < 0) {
      throw new Error('Account balance cannot be negative');
    }
  }

  private isValidAccountType(type: string): boolean {
    const validTypes = ['corrente', 'poupanca', 'investimento', 'cartao_credito', 'dinheiro'];
    return validTypes.includes(type);
  }
} 