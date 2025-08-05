// Tests for CategoryMapper
import { CategoryMapper } from '../../../../clean-architecture/data/mappers/CategoryMapper';
import { Category } from '../../../../clean-architecture/domain/entities/Category';
import { CategoryDTO } from '../../../../clean-architecture/data/dto/CategoryDTO';

describe('CategoryMapper', () => {
  let mapper: CategoryMapper;

  beforeEach(() => {
    mapper = new CategoryMapper();
  });

  describe('toDomain', () => {
    it('should map CategoryDTO to Category entity', () => {
      const categoryDTO: CategoryDTO = {
        id: 'cat-123',
        name: 'Alimentação',
        type: 'expense',
        isDefault: true,
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      const category = mapper.toDomain(categoryDTO);

      expect(category).toBeInstanceOf(Category);
      expect(category.id).toBe('cat-123');
      expect(category.name).toBe('Alimentação');
      expect(category.type).toBe('expense');
      expect(category.isDefault).toBe(true);
      expect(category.createdAt).toEqual(new Date('2024-01-01T00:00:00.000Z'));
    });

    it('should handle income category', () => {
      const categoryDTO: CategoryDTO = {
        id: 'cat-456',
        name: 'Salário',
        type: 'income',
        isDefault: false,
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      const category = mapper.toDomain(categoryDTO);

      expect(category.type).toBe('income');
      expect(category.isDefault).toBe(false);
    });
  });

  describe('toDTO', () => {
    it('should map Category entity to CategoryDTO', () => {
      const category = new Category({
        id: 'cat-123',
        name: 'Alimentação',
        type: 'expense',
        isDefault: true,
        createdAt: new Date('2024-01-01T00:00:00.000Z')
      });

      const categoryDTO = mapper.toDTO(category);

      expect(categoryDTO.id).toBe('cat-123');
      expect(categoryDTO.name).toBe('Alimentação');
      expect(categoryDTO.type).toBe('expense');
      expect(categoryDTO.isDefault).toBe(true);
      expect(categoryDTO.createdAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should handle income category', () => {
      const category = new Category({
        id: 'cat-456',
        name: 'Salário',
        type: 'income',
        isDefault: false,
        createdAt: new Date('2024-01-01T00:00:00.000Z')
      });

      const categoryDTO = mapper.toDTO(category);

      expect(categoryDTO.type).toBe('income');
      expect(categoryDTO.isDefault).toBe(false);
    });
  });

  describe('toDomainList', () => {
    it('should map array of CategoryDTO to array of Category entities', () => {
      const categoryDTOs: CategoryDTO[] = [
        {
          id: 'cat-1',
          name: 'Categoria 1',
          type: 'expense',
          isDefault: true,
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'cat-2',
          name: 'Categoria 2',
          type: 'income',
          isDefault: false,
          createdAt: '2024-01-02T00:00:00.000Z'
        }
      ];

      const categories = mapper.toDomainList(categoryDTOs);

      expect(categories).toHaveLength(2);
      expect(categories[0]).toBeInstanceOf(Category);
      expect(categories[1]).toBeInstanceOf(Category);
      expect(categories[0].name).toBe('Categoria 1');
      expect(categories[1].name).toBe('Categoria 2');
    });

    it('should return empty array for empty input', () => {
      const categories = mapper.toDomainList([]);

      expect(categories).toHaveLength(0);
    });
  });

  describe('toDTOList', () => {
    it('should map array of Category entities to array of CategoryDTO', () => {
      const categories = [
        new Category({
          id: 'cat-1',
          name: 'Categoria 1',
          type: 'expense',
          isDefault: true,
          createdAt: new Date('2024-01-01T00:00:00.000Z')
        }),
        new Category({
          id: 'cat-2',
          name: 'Categoria 2',
          type: 'income',
          isDefault: false,
          createdAt: new Date('2024-01-02T00:00:00.000Z')
        })
      ];

      const categoryDTOs = mapper.toDTOList(categories);

      expect(categoryDTOs).toHaveLength(2);
      expect(categoryDTOs[0].name).toBe('Categoria 1');
      expect(categoryDTOs[1].name).toBe('Categoria 2');
    });

    it('should return empty array for empty input', () => {
      const categoryDTOs = mapper.toDTOList([]);

      expect(categoryDTOs).toHaveLength(0);
    });
  });
}); 