// Use Case: UpdateCategoryUseCase
// Responsável por atualizar uma categoria existente

import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { Category, CategoryProps } from '../entities/Category';

export class UpdateCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(categoryId: string, updateData: Partial<CategoryProps>): Promise<Category> {
    // Buscar categoria existente
    const existingCategory = await this.categoryRepository.findById(categoryId);
    if (!existingCategory) {
      throw new Error('Category not found');
    }

    // Validar dados de atualização
    this.validateUpdateData(updateData);

    // Criar nova categoria com dados atualizados
    const updatedCategoryProps: CategoryProps = {
      id: categoryId,
      name: updateData.name || existingCategory.name,
      type: updateData.type || existingCategory.type,
      isDefault: updateData.isDefault !== undefined ? updateData.isDefault : existingCategory.isDefault,
      createdAt: existingCategory.createdAt,
    };

    const updatedCategory = new Category(updatedCategoryProps);

    // Salvar no repositório
    await this.categoryRepository.save(updatedCategory);

    return updatedCategory;
  }

  private validateUpdateData(updateData: Partial<CategoryProps>): void {
    if (updateData.name !== undefined && updateData.name.trim() === '') {
      throw new Error('Category name cannot be empty');
    }

    if (updateData.type !== undefined && !['income', 'expense'].includes(updateData.type)) {
      throw new Error('Invalid category type');
    }
  }
} 