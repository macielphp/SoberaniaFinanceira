import { IUserRepository } from '../repositories/IUserRepository';
import { User } from '../entities/User';

export interface DeleteUserRequest {
  id: string;
}

export interface DeleteUserResponse {
  success: boolean;
}

export class DeleteUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    try {
      if (!userId || userId.trim() === '') {
        throw new Error('ID do usuário é obrigatório');
      }

      const user = await this.userRepository.findById(userId);
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      await this.userRepository.delete(userId);
    } catch (error) {
      if (error instanceof Error) {
        // Re-throw validation errors as-is
        if (error.message.includes('ID do usuário é obrigatório') || 
            error.message.includes('Usuário não encontrado')) {
          throw error;
        }
        // Wrap repository errors
        throw new Error('Erro ao deletar usuário');
      }
      throw new Error('Erro ao deletar usuário');
    }
  }
}
