import { IUserRepository } from '../repositories/IUserRepository';
import { User, UserProps } from '../entities/User';

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, updateData: Partial<UserProps>): Promise<User> {
    // Buscar usuário existente
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Validar dados de atualização
    this.validateUpdateData(updateData);

    // Criar novo usuário com dados atualizados
    const updatedUserProps: UserProps = {
      id: userId,
      name: updateData.name || existingUser.name,
      email: updateData.email || existingUser.email,
      password: updateData.password || existingUser.password,
      isActive: updateData.isActive !== undefined ? updateData.isActive : existingUser.isActive,
      createdAt: existingUser.createdAt, // Preservar data de criação original
    };

    // Criar nova instância do usuário
    const updatedUser = new User(updatedUserProps);

    // Salvar no repositório
    const savedUser = await this.userRepository.save(updatedUser);

    return savedUser;
  }

  private validateUpdateData(updateData: Partial<UserProps>): void {
    // Validar nome se fornecido
    if (updateData.name && updateData.name.trim() === '') {
      throw new Error('User name cannot be empty');
    }

    // Validar email se fornecido
    if (updateData.email && !this.isValidEmail(updateData.email)) {
      throw new Error('Invalid email format');
    }

    // Validar senha se fornecida
    if (updateData.password && updateData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
