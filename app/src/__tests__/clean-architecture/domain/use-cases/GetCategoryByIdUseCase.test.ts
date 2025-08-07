import { GetCategoryByIdUseCase } from '../../../../clean-architecture/domain/use-cases/GetCategoryByIdUseCase';
import { ICategoryRepository } from '../../../../clean-architecture/domain/repositories/ICategoryRepository';
import { Category } from '../../../../clean-architecture/domain/entities/Category';
import { Money } from '../../../../clean-architecture/shared/utils/Money';

describe('GetCategoryByIdUseCase', () => {
  let getCategoryByIdUseCase: GetCategoryByIdUseCase;
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

    getCategoryByIdUseCase = new GetCategoryByIdUseCase(mockCategoryRepository);
  });

  it('should get category by id successfully', async () => {
    const categoryId = '1';
    const mockCategory = new Category({
      id: '1',
      name: 'Alimentação',
      type: 'expense',
      isDefault: false,
      createdAt: new Date(),
    });

    mockCategoryRepository.findById.mockResolvedValue(mockCategory);

    const result = await getCategoryByIdUseCase.execute(categoryId);

    expect(result).toBeInstanceOf(Category);
    expect(result.id).toBe(categoryId);
    expect(result.name).toBe('Alimentação');
    expect(result.type).toBe('expense');
    expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
  });

  it('should throw error when category not found', async () => {
    const categoryId = '999';

    mockCategoryRepository.findById.mockResolvedValue(null);

    await expect(getCategoryByIdUseCase.execute(categoryId)).rejects.toThrow(
      'Categoria não encontrada'
    );

    expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
  });

  it('should throw error when repository fails', async () => {
    const categoryId = '1';

    mockCategoryRepository.findById.mockRejectedValue(new Error('Database error'));

    await expect(getCategoryByIdUseCase.execute(categoryId)).rejects.toThrow(
      'Erro ao buscar categoria'
    );
  });
});
