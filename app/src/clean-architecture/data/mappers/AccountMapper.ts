// Mapper for Account entity
// Converts between DTO (database) and Domain Entity

import { Account, AccountType } from '../../domain/entities/Account';
import { AccountDTO } from '../dto/AccountDTO';
import { Money } from '../../shared/utils/Money';

export class AccountMapper {
  /**
   * Converts AccountDTO to Account domain entity
   */
  toDomain(dto: AccountDTO): Account {
    // Map database types to domain types
    const mapType = (dbType: 'propria' | 'externa'): AccountType => {
      switch (dbType) {
        case 'propria':
          return 'corrente';
        case 'externa':
          return 'cartao_credito';
        default:
          return 'corrente';
      }
    };

    return new Account({
      id: dto.id,
      name: dto.name,
      type: mapType(dto.type),
      balance: new Money(dto.saldo || 0, 'BRL'),
      isActive: true,
      createdAt: new Date(dto.createdAt)
    });
  }

  /**
   * Converts Account domain entity to AccountDTO
   */
  toDTO(account: Account): AccountDTO {
    // Map domain types to database types
    const mapType = (domainType: AccountType): 'propria' | 'externa' => {
      switch (domainType) {
        case 'corrente':
        case 'poupanca':
        case 'investimento':
        case 'dinheiro':
          return 'propria';
        case 'cartao_credito':
          return 'externa';
        default:
          return 'propria';
      }
    };

    return {
      id: account.id,
      name: account.name,
      type: mapType(account.type),
      saldo: account.type !== 'cartao_credito' ? account.balance.value : null,
      isDefault: false, // Domain doesn't have isDefault, default to false
      createdAt: account.createdAt.toISOString()
    };
  }

  /**
   * Converts array of AccountDTO to array of Account entities
   */
  toDomainList(dtos: AccountDTO[]): Account[] {
    return dtos.map(dto => this.toDomain(dto));
  }

  /**
   * Converts array of Account entities to array of AccountDTO
   */
  toDTOList(accounts: Account[]): AccountDTO[] {
    return accounts.map(account => this.toDTO(account));
  }
} 