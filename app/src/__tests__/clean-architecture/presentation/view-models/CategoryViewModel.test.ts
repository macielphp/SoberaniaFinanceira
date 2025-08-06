import { CategoryViewModel } from '../../../../clean-architecture/presentation/view-models/CategoryViewModel';
import { ICategoryRepository } from '../../../../clean-architecture/domain/repositories/ICategoryRepository';
import { Category, CategoryProps } from '../../../../clean-architecture/domain/entities/Category';

describe('CategoryViewModel', () => {
  let viewModel: CategoryViewModel;
  let mockCategoryRepository: jest.Mocked<ICategoryRepository>;

  beforeEach(() => {
    mockCategoryRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByType: jest.fn(),
      findByName: jest.fn(),
      findDefault: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      countByType: jest.fn(),
    } as any;
    viewModel = new CategoryViewModel(mockCategoryRepository);
  });

  it('deve inicializar com lista de categorias vazia', () => {
    expect(viewModel.categories).toEqual([]);
  });

  it('deve buscar todas as categorias do repositório', async () => {
    const mockCategories = [
      new Category({
        id: '1',
        name: 'Alimentação',
        type: 'expense',
        isDefault: true,
        createdAt: new Date(),
      }),
    ];
    mockCategoryRepository.findAll.mockResolvedValue(mockCategories);
    await viewModel.loadCategories();
    expect(viewModel.categories).toEqual(mockCategories);
    expect(mockCategoryRepository.findAll).toHaveBeenCalled();
  });

  it('deve criar uma nova categoria e atualizar a lista', async () => {
    const categoryProps: CategoryProps = {
      id: '2',
      name: 'Transporte',
      type: 'expense',
      isDefault: false,
      createdAt: new Date(),
    };
    const newCategory = new Category(categoryProps);
    mockCategoryRepository.save.mockResolvedValue(newCategory);
    mockCategoryRepository.findAll.mockResolvedValue([newCategory]);
    await viewModel.createCategory(categoryProps);
    expect(mockCategoryRepository.save).toHaveBeenCalledWith(expect.any(Category));
    expect(viewModel.categories).toEqual([newCategory]);
  });

  it('deve atualizar uma categoria existente e atualizar a lista', async () => {
    const originalCategoryProps: CategoryProps = {
      id: '3',
      name: 'Educação',
      type: 'expense',
      isDefault: false,
      createdAt: new Date(),
    };
    const updatedCategoryProps: CategoryProps = {
      ...originalCategoryProps,
      name: 'Educação Atualizada',
      isDefault: true,
    };
    const updatedCategory = new Category(updatedCategoryProps);
    mockCategoryRepository.save.mockResolvedValue(updatedCategory);
    mockCategoryRepository.findAll.mockResolvedValue([updatedCategory]);
    await viewModel.updateCategory(updatedCategoryProps);
    expect(mockCategoryRepository.save).toHaveBeenCalledWith(expect.any(Category));
    expect(viewModel.categories).toEqual([updatedCategory]);
  });

  it('deve remover uma categoria pelo id e atualizar a lista', async () => {
    const categoryId = '4';
    mockCategoryRepository.delete.mockResolvedValue(true);
    mockCategoryRepository.findAll.mockResolvedValue([]);
    await viewModel.deleteCategory(categoryId);
    expect(mockCategoryRepository.delete).toHaveBeenCalledWith(categoryId);
    expect(viewModel.categories).toEqual([]);
  });
});