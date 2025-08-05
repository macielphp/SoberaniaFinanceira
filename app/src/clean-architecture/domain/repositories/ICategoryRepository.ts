// Repository Interface: ICategoryRepository
// Define o contrato para operações de persistência de Category

import { Category } from '../entities/Category';

export interface ICategoryRepository {
  /**
   * Salva ou atualiza uma categoria
   * @param category - A categoria a ser salva
   * @returns Promise<Category> - A categoria salva
   */
  save(category: Category): Promise<Category>;

  /**
   * Busca uma categoria pelo ID
   * @param id - ID da categoria
   * @returns Promise<Category | null> - A categoria encontrada ou null
   */
  findById(id: string): Promise<Category | null>;

  /**
   * Busca todas as categorias
   * @returns Promise<Category[]> - Lista de todas as categorias
   */
  findAll(): Promise<Category[]>;

  /**
   * Busca categorias por tipo
   * @param type - Tipo da categoria (income, expense)
   * @returns Promise<Category[]> - Lista de categorias do tipo especificado
   */
  findByType(type: string): Promise<Category[]>;

  /**
   * Busca categorias por nome (busca parcial)
   * @param name - Nome ou parte do nome da categoria
   * @returns Promise<Category[]> - Lista de categorias que correspondem ao nome
   */
  findByName(name: string): Promise<Category[]>;

  /**
   * Busca apenas categorias padrão
   * @returns Promise<Category[]> - Lista de categorias padrão
   */
  findDefault(): Promise<Category[]>;

  /**
   * Remove uma categoria pelo ID
   * @param id - ID da categoria a ser removida
   * @returns Promise<boolean> - true se removida, false se não encontrada
   */
  delete(id: string): Promise<boolean>;

  /**
   * Conta o total de categorias
   * @returns Promise<number> - Total de categorias
   */
  count(): Promise<number>;

  /**
   * Conta o total de categorias por tipo
   * @param type - Tipo da categoria
   * @returns Promise<number> - Total de categorias do tipo especificado
   */
  countByType(type: string): Promise<number>;
} 