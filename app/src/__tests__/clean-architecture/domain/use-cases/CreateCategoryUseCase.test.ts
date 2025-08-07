// Tests for CreateCategoryUseCase
import { CreateCategoryUseCase } from '../../../../clean-architecture/domain/use-cases/CreateCategoryUseCase';
import { ICategoryRepository } from '../../../../clean-architecture/domain/repositories/ICategoryRepository';
import { Category } from '../../../../clean-architecture/domain/entities/Category';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('CreateCategoryUseCase', () => {
  let createCategoryUseCase: CreateCategoryUseCase;
  let mockCategoryRepository: jest.Mocked<ICategoryRepository>;

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

    createCategoryUseCase = new CreateCategoryUseCase(mockCategoryRepository);
  });

  it('should create a new category successfully', async () => {
    const categoryData = {
      name: 'Alimentação',
      type: 'expense' as const,
      isDefault: false,
    };

    const createdCategory = new Category({
      id: '1',
      name: 'Alimentação',
      type: 'expense',
      isDefault: false,
      createdAt: new Date(),
    });

    mockCategoryRepository.save.mockResolvedValue(createdCategory);
    mockCategoryRepository.findByName.mockResolvedValue([]);

    const result = await createCategoryUseCase.execute(categoryData);

    expect(result).toBeInstanceOf(Category);
    expect(result.name).toBe(categoryData.name);
    expect(result.type).toBe(categoryData.type);
    expect(result.isDefault).toBe(categoryData.isDefault);
    expect(mockCategoryRepository.save).toHaveBeenCalledWith(expect.any(Category));
    expect(mockCategoryRepository.findByName).toHaveBeenCalledWith(categoryData.name);
  });

  it('should throw error when category name is empty', async () => {
    const categoryData = {
      name: '',
      type: 'expense' as const,
      isDefault: false,
    };

    await expect(createCategoryUseCase.execute(categoryData)).rejects.toThrow(
      'Nome da categoria é obrigatório'
    );

    expect(mockCategoryRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when category name already exists', async () => {
    const categoryData = {
      name: 'Alimentação',
      type: 'expense' as const,
      isDefault: false,
    };

    const existingCategory = new Category({
      id: '1',
      name: 'Alimentação',
      type: 'expense',
      isDefault: false,
      createdAt: new Date(),
    });

    mockCategoryRepository.findByName.mockResolvedValue([existingCategory]);

    await expect(createCategoryUseCase.execute(categoryData)).rejects.toThrow(
      'Categoria com este nome já existe'
    );

    expect(mockCategoryRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when category type is invalid', async () => {
    const categoryData = {
      name: 'Alimentação',
      type: 'invalid' as any,
      isDefault: false,
    };

    await expect(createCategoryUseCase.execute(categoryData)).rejects.toThrow(
      'Tipo de categoria inválido'
    );

    expect(mockCategoryRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when repository save fails', async () => {
    const categoryData = {
      name: 'Alimentação',
      type: 'expense' as const,
      isDefault: false,
    };

    mockCategoryRepository.findByName.mockResolvedValue([]);
    mockCategoryRepository.save.mockRejectedValue(new Error('Database error'));

    await expect(createCategoryUseCase.execute(categoryData)).rejects.toThrow(
      'Erro ao salvar categoria'
    );
  });
}); 