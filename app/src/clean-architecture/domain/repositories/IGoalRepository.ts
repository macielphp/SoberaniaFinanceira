// Repository Interface: IGoalRepository
// Define o contrato para operações de persistência de Goal

import { Goal } from '../entities/Goal';

export interface IGoalRepository {
  /**
   * Salva ou atualiza uma meta
   * @param goal - A meta a ser salva
   * @returns Promise<Goal> - A meta salva
   */
  save(goal: Goal): Promise<Goal>;

  /**
   * Busca uma meta pelo ID
   * @param id - ID da meta
   * @returns Promise<Goal | null> - A meta encontrada ou null
   */
  findById(id: string): Promise<Goal | null>;

  /**
   * Busca todas as metas
   * @returns Promise<Goal[]> - Lista de todas as metas
   */
  findAll(): Promise<Goal[]>;

  /**
   * Busca metas por usuário
   * @param userId - ID do usuário
   * @returns Promise<Goal[]> - Lista de metas do usuário
   */
  findByUserId(userId: string): Promise<Goal[]>;

  /**
   * Busca metas por tipo
   * @param type - Tipo da meta (economia, compra)
   * @returns Promise<Goal[]> - Lista de metas do tipo especificado
   */
  findByType(type: string): Promise<Goal[]>;

  /**
   * Busca metas por status
   * @param status - Status da meta (active, completed, paused, cancelled)
   * @returns Promise<Goal[]> - Lista de metas com o status especificado
   */
  findByStatus(status: string): Promise<Goal[]>;

  /**
   * Busca apenas metas ativas
   * @returns Promise<Goal[]> - Lista de metas ativas
   */
  findActive(): Promise<Goal[]>;

  /**
   * Busca metas por intervalo de datas
   * @param startDate - Data inicial
   * @param endDate - Data final
   * @returns Promise<Goal[]> - Lista de metas no período
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Goal[]>;

  /**
   * Remove uma meta pelo ID
   * @param id - ID da meta a ser removida
   * @returns Promise<boolean> - true se removida, false se não encontrada
   */
  delete(id: string): Promise<boolean>;

  /**
   * Conta o total de metas
   * @returns Promise<number> - Total de metas
   */
  count(): Promise<number>;

  /**
   * Conta o total de metas por usuário
   * @param userId - ID do usuário
   * @returns Promise<number> - Total de metas do usuário
   */
  countByUserId(userId: string): Promise<number>;

  /**
   * Conta o total de metas ativas
   * @returns Promise<number> - Total de metas ativas
   */
  countActive(): Promise<number>;
} 