// Tests for UpdateCategoryUseCase
import { UpdateCategoryUseCase } from '../../../../clean-architecture/domain/use-cases/UpdateCategoryUseCase';
import { ICategoryRepository } from '../../../../clean-architecture/domain/repositories/ICategoryRepository';
import { Category, CategoryProps } from '../../../../clean-architecture/domain/entities/Category';

describe('UpdateCategoryUseCase', () => {
  let updateCategoryUseCase: UpdateCategoryUseCase;
  let mockCategoryRepository: jest.Mocked<ICategoryRepository>;
  let mockCategory: Category;

  beforeEach(() => {
    mockCategoryRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      findByName: jest.fn(),
      findByType: jest.fn(),
      findDefault: jest.fn(),
      count: jest.fn(),
      countByType: jest.fn(),
    };

    updateCategoryUseCase = new UpdateCategoryUseCase(mockCategoryRepository);

    mockCategory = new Category({
      id: '1',
      name: 'Alimentação',
      type: 'expense',
      isDefault: false,
    });
  });

  describe('execute', () => {
    it('should update an existing category successfully', async () => {
      // Arrange
      const categoryId = '1';
      const updateData: Partial<CategoryProps> = {
        name: 'Alimentação Atualizada',
        type: 'income',
      };

      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(mockCategory);

      // Act
      const result = await updateCategoryUseCase.execute(categoryId, updateData);

      // Assert
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: categoryId,
          name: 'Alimentação Atualizada',
          type: 'income',
        })
      );
      expect(result).toBeDefined();
      expect(result.id).toBe(categoryId);
      expect(result.name).toBe('Alimentação Atualizada');
    });

    it('should throw error when category is not found', async () => {
      // Arrange
      const categoryId = '999';
      const updateData: Partial<CategoryProps> = {
        name: 'Categoria Inexistente',
      };

      mockCategoryRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(updateCategoryUseCase.execute(categoryId, updateData))
        .rejects
        .toThrow('Category not found');

      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });

    it('should validate category data before updating', async () => {
      // Arrange
      const categoryId = '1';
      const invalidUpdateData: Partial<CategoryProps> = {
        name: '', // Nome vazio é inválido
      };

      mockCategoryRepository.findById.mockResolvedValue(mockCategory);

      // Act & Assert
      await expect(updateCategoryUseCase.execute(categoryId, invalidUpdateData))
        .rejects
        .toThrow('Category name cannot be empty');

      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });

    it('should preserve existing properties when updating partial data', async () => {
      // Arrange
      const categoryId = '1';
      const updateData: Partial<CategoryProps> = {
        name: 'Novo Nome',
      };

      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(mockCategory);

      // Act
      const result = await updateCategoryUseCase.execute(categoryId, updateData);

      // Assert
      expect(result.name).toBe('Novo Nome');
      expect(result.type).toBe('expense'); // Preservado
      expect(result.isDefault).toBe(false); // Preservado
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const categoryId = '1';
      const updateData: Partial<CategoryProps> = {
        name: 'Test Category',
      };

      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(updateCategoryUseCase.execute(categoryId, updateData))
        .rejects
        .toThrow('Database error');
    });
  });
}); 