import { IUserRepository } from '../repositories/IUserRepository';
import { User } from '../entities/User';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreateUserResponse {
  user: User;
}

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: CreateUserRequest): Promise<User> {
    try {
      this.validateCreateData(request);

      // Check if user with same email already exists
      const existingUser = await this.userRepository.findByEmail(request.email);
      if (existingUser) {
        throw new Error('Email já está em uso');
      }

      // Create new user
      const user = new User({
        id: this.generateId(),
        name: request.name,
        email: request.email,
        password: request.password,
        isActive: true,
        createdAt: new Date(),
      });

      // Save to repository
      const savedUser = await this.userRepository.save(user);
      return savedUser;
    } catch (error) {
      if (error instanceof Error) {
        // Re-throw validation errors as-is
        if (error.message.includes('Nome do usuário é obrigatório') || 
            error.message.includes('Formato de email inválido') ||
            error.message.includes('Senha deve ter pelo menos 6 caracteres') ||
            error.message.includes('Email já está em uso')) {
          throw error;
        }
        // Wrap repository errors
        throw new Error('Erro ao salvar usuário');
      }
      throw new Error('Erro ao salvar usuário');
    }
  }

  private validateCreateData(request: CreateUserRequest): void {
    if (!request.name || request.name.trim() === '') {
      throw new Error('Nome do usuário é obrigatório');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
      throw new Error('Formato de email inválido');
    }

    if (!request.password || request.password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
