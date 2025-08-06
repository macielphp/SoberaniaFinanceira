import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { Category, CategoryProps } from '../../domain/entities/Category';

export class CategoryViewModel {
  public categories: Category[] = [];
  private categoryRepository: ICategoryRepository;

  constructor(categoryRepository: ICategoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async loadCategories(): Promise<void> {
    this.categories = await this.categoryRepository.findAll();
  }

  async createCategory(categoryProps: CategoryProps): Promise<void> {
    const category = new Category(categoryProps);
    await this.categoryRepository.save(category);
    this.categories = await this.categoryRepository.findAll();
  }

  async updateCategory(categoryProps: CategoryProps): Promise<void> {
    const category = new Category(categoryProps);
    await this.categoryRepository.save(category);
    this.categories = await this.categoryRepository.findAll();
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await this.categoryRepository.delete(categoryId);
    this.categories = await this.categoryRepository.findAll();
  }
}