// Repository Interface: IAccountRepository
// Define o contrato para operações de persistência de Account

import { Account } from '../entities/Account';

export interface IAccountRepository {
  /**
   * Salva ou atualiza uma conta
   * @param account - A conta a ser salva
   * @returns Promise<Account> - A conta salva
   */
  save(account: Account): Promise<Account>;

  /**
   * Busca uma conta pelo ID
   * @param id - ID da conta
   * @returns Promise<Account | null> - A conta encontrada ou null
   */
  findById(id: string): Promise<Account | null>;

  /**
   * Busca todas as contas
   * @returns Promise<Account[]> - Lista de todas as contas
   */
  findAll(): Promise<Account[]>;

  /**
   * Busca apenas contas ativas
   * @returns Promise<Account[]> - Lista de contas ativas
   */
  findActive(): Promise<Account[]>;

  /**
   * Busca contas por tipo
   * @param type - Tipo da conta (corrente, poupanca, etc.)
   * @returns Promise<Account[]> - Lista de contas do tipo especificado
   */
  findByType(type: string): Promise<Account[]>;

  /**
   * Busca contas por nome (busca parcial)
   * @param name - Nome ou parte do nome da conta
   * @returns Promise<Account[]> - Lista de contas que correspondem ao nome
   */
  findByName(name: string): Promise<Account[]>;

  /**
   * Remove uma conta pelo ID
   * @param id - ID da conta a ser removida
   * @returns Promise<boolean> - true se removida, false se não encontrada
   */
  delete(id: string): Promise<boolean>;

  /**
   * Conta o total de contas
   * @returns Promise<number> - Total de contas
   */
  count(): Promise<number>;

  /**
   * Conta o total de contas ativas
   * @returns Promise<number> - Total de contas ativas
   */
  countActive(): Promise<number>;
} 