// Mapper for Category entity
// Converts between DTO (database) and Domain Entity

import { Category } from '../../domain/entities/Category';
import { CategoryDTO } from '../dto/CategoryDTO';

export class CategoryMapper {
  /**
   * Converts CategoryDTO to Category domain entity
   */
  toDomain(dto: CategoryDTO): Category {
    return new Category({
      id: dto.id,
      name: dto.name,
      type: dto.type,
      isDefault: dto.isDefault,
      createdAt: new Date(dto.createdAt)
    });
  }

  /**
   * Converts Category domain entity to CategoryDTO
   */
  toDTO(category: Category): CategoryDTO {
    return {
      id: category.id,
      name: category.name,
      type: category.type,
      isDefault: category.isDefault,
      createdAt: category.createdAt.toISOString()
    };
  }

  /**
   * Converts array of CategoryDTO to array of Category entities
   */
  toDomainList(dtos: CategoryDTO[]): Category[] {
    return dtos.map(dto => this.toDomain(dto));
  }

  /**
   * Converts array of Category entities to array of CategoryDTO
   */
  toDTOList(categories: Category[]): CategoryDTO[] {
    return categories.map(category => this.toDTO(category));
  }
} 