// Repository Interface: IBudgetRepository
// Define o contrato para operações de persistência de Budget

import { Budget } from '../entities/Budget';

export interface IBudgetRepository {
  /**
   * Salva ou atualiza um orçamento
   * @param budget - O orçamento a ser salvo
   * @returns Promise<Budget> - O orçamento salvo
   */
  save(budget: Budget): Promise<Budget>;

  /**
   * Busca um orçamento pelo ID
   * @param id - ID do orçamento
   * @returns Promise<Budget | null> - O orçamento encontrado ou null
   */
  findById(id: string): Promise<Budget | null>;

  /**
   * Busca todos os orçamentos
   * @returns Promise<Budget[]> - Lista de todos os orçamentos
   */
  findAll(): Promise<Budget[]>;

  /**
   * Busca orçamentos por usuário
   * @param userId - ID do usuário
   * @returns Promise<Budget[]> - Lista de orçamentos do usuário
   */
  findByUser(userId: string): Promise<Budget[]>;

  /**
   * Busca orçamentos ativos por usuário
   * @param userId - ID do usuário
   * @returns Promise<Budget[]> - Lista de orçamentos ativos do usuário
   */
  findActiveByUser(userId: string): Promise<Budget[]>;

  /**
   * Busca orçamentos por intervalo de datas
   * @param startDate - Data inicial
   * @param endDate - Data final
   * @returns Promise<Budget[]> - Lista de orçamentos no período
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Budget[]>;

  /**
   * Remove um orçamento pelo ID
   * @param id - ID do orçamento a ser removido
   * @returns Promise<boolean> - true se removido, false se não encontrado
   */
  delete(id: string): Promise<boolean>;

  /**
   * Conta o total de orçamentos
   * @returns Promise<number> - Total de orçamentos
   */
  count(): Promise<number>;

  /**
   * Remove todos os orçamentos (para testes)
   * @returns Promise<void>
   */
  deleteAll(): Promise<void>;
}
