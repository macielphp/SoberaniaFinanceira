// Repository Interface: IOperationRepository
// Define o contrato para operações de persistência de Operation

import { Operation } from '../entities/Operation';

export interface IOperationRepository {
  /**
   * Salva ou atualiza uma operação
   * @param operation - A operação a ser salva
   * @returns Promise<Operation> - A operação salva
   */
  save(operation: Operation): Promise<Operation>;

  /**
   * Busca uma operação pelo ID
   * @param id - ID da operação
   * @returns Promise<Operation | null> - A operação encontrada ou null
   */
  findById(id: string): Promise<Operation | null>;

  /**
   * Busca todas as operações
   * @returns Promise<Operation[]> - Lista de todas as operações
   */
  findAll(): Promise<Operation[]>;

  /**
   * Busca operações por intervalo de datas
   * @param startDate - Data inicial
   * @param endDate - Data final
   * @returns Promise<Operation[]> - Lista de operações no período
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Operation[]>;

  /**
   * Busca operações por conta (origem ou destino)
   * @param accountId - ID da conta
   * @returns Promise<Operation[]> - Lista de operações da conta
   */
  findByAccount(accountId: string): Promise<Operation[]>;

  /**
   * Busca operações por categoria
   * @param category - Nome da categoria
   * @returns Promise<Operation[]> - Lista de operações da categoria
   */
  findByCategory(category: string): Promise<Operation[]>;

  /**
   * Remove uma operação pelo ID
   * @param id - ID da operação a ser removida
   * @returns Promise<boolean> - true se removida, false se não encontrada
   */
  delete(id: string): Promise<boolean>;

  /**
   * Conta o total de operações
   * @returns Promise<number> - Total de operações
   */
  count(): Promise<number>;
} 