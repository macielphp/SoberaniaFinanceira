import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { CreateUserUseCase } from '../../domain/use-cases/CreateUserUseCase';
import { UpdateUserUseCase } from '../../domain/use-cases/UpdateUserUseCase';
import { DeleteUserUseCase } from '../../domain/use-cases/DeleteUserUseCase';
import { GetUserUseCase } from '../../domain/use-cases/GetUserUseCase';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class UserViewModel {
  public loading: boolean = false;
  public error: string | null = null;
  private currentUser: User | null = null;

  private createUserUseCase: CreateUserUseCase;
  private updateUserUseCase: UpdateUserUseCase;
  private deleteUserUseCase: DeleteUserUseCase;
  private getUserUseCase: GetUserUseCase;

  constructor(userRepository: IUserRepository) {
    this.createUserUseCase = new CreateUserUseCase(userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(userRepository);
    this.getUserUseCase = new GetUserUseCase(userRepository);
  }

  async createUser(data: CreateUserData): Promise<User> {
    try {
      this.loading = true;
      this.error = null;

      const result = await this.createUserUseCase.execute({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      return result;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao criar usuário';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    try {
      this.loading = true;
      this.error = null;

      const result = await this.updateUserUseCase.execute(userId, data);
      return result;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao atualizar usuário';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      this.loading = true;
      this.error = null;

      await this.deleteUserUseCase.execute(userId);
      return true;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao deletar usuário';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      this.loading = true;
      this.error = null;

      const result = await this.getUserUseCase.execute(userId);
      return result;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Erro ao buscar usuário';
      throw error;
    } finally {
      this.loading = false;
    }
  }

  validateForm(data: CreateUserData): ValidationResult {
    const errors: Record<string, string> = {};

    // Validar nome
    if (!data.name || data.name.trim() === '') {
      errors.name = 'Nome é obrigatório';
    }

    // Validar email
    if (!data.email || data.email.trim() === '') {
      errors.email = 'Email é obrigatório';
    } else if (!this.isValidEmail(data.email)) {
      errors.email = 'Email deve ter um formato válido';
    }

    // Validar senha
    if (!data.password || data.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // User session management
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  setCurrentUser(user: User): void {
    this.currentUser = user;
  }

  logout(): void {
    this.currentUser = null;
  }

  // Getters for reactive properties
  get isLoading(): boolean {
    return this.loading;
  }

  setError(error: string): void {
    this.error = error;
  }

  clearError(): void {
    this.error = null;
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
  }
}
