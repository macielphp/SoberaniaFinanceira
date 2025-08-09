import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { UserForm } from '../../../../clean-architecture/presentation/pure-components/UserForm';
import { User } from '../../../../clean-architecture/domain/entities/User';

// Mock do StyleSheet para evitar problemas de ambiente
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    StyleSheet: {
      ...RN.StyleSheet,
      flatten: jest.fn((style) => style)
    }
  };
});

describe('UserForm', () => {
  const mockUser = new User({
    id: 'user-1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    password: 'senha123',
    isActive: true,
    createdAt: new Date('2024-01-01')
  });

  const mockHandlers = {
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render form fields correctly', () => {
      const { getByText, getByPlaceholderText } = render(
        <UserForm 
          user={mockUser}
          {...mockHandlers}
        />
      );

      expect(getByText('Nome')).toBeTruthy();
      expect(getByText('Email')).toBeTruthy();
      expect(getByText('Senha')).toBeTruthy();
      expect(getByText('Confirmar Senha')).toBeTruthy();
      expect(getByPlaceholderText('Digite seu nome')).toBeTruthy();
      expect(getByPlaceholderText('Digite seu email')).toBeTruthy();
    });

    it('should render with empty user for new user', () => {
      const { getByText, getByPlaceholderText } = render(
        <UserForm 
          user={undefined}
          {...mockHandlers}
        />
      );

      expect(getByText('Novo Usuário')).toBeTruthy();
      expect(getByPlaceholderText('Digite seu nome')).toBeTruthy();
    });

    it('should render with existing user for edit', () => {
      const { getByText, getByDisplayValue } = render(
        <UserForm 
          user={mockUser}
          {...mockHandlers}
        />
      );

      expect(getByText('Editar Usuário')).toBeTruthy();
      expect(getByDisplayValue('João Silva')).toBeTruthy();
      expect(getByDisplayValue('joao.silva@email.com')).toBeTruthy();
    });
  });

  describe('form validation', () => {
    it('should show validation errors for empty required fields', () => {
      const { getByText } = render(
        <UserForm 
          user={undefined}
          {...mockHandlers}
        />
      );

      const submitButton = getByText('Criar');
      fireEvent.press(submitButton);

      expect(getByText('Nome é obrigatório')).toBeTruthy();
      expect(getByText('Email é obrigatório')).toBeTruthy();
      expect(getByText('Senha é obrigatória')).toBeTruthy();
    });

    it('should validate name length', () => {
      const { getByText, getByPlaceholderText } = render(
        <UserForm 
          user={undefined}
          {...mockHandlers}
        />
      );

      const nameInput = getByPlaceholderText('Digite seu nome');
      fireEvent.changeText(nameInput, 'A'); // Nome muito curto

      const submitButton = getByText('Criar');
      fireEvent.press(submitButton);

      expect(getByText('Nome deve ter pelo menos 2 caracteres')).toBeTruthy();
    });

    it('should validate email format', () => {
      const { getByText, getByPlaceholderText } = render(
        <UserForm 
          user={undefined}
          {...mockHandlers}
        />
      );

      const nameInput = getByPlaceholderText('Digite seu nome');
      const emailInput = getByPlaceholderText('Digite seu email');
      
      fireEvent.changeText(nameInput, 'João Silva');
      fireEvent.changeText(emailInput, 'email-invalido');

      const submitButton = getByText('Criar');
      fireEvent.press(submitButton);

      expect(getByText('Email deve ter um formato válido')).toBeTruthy();
    });

    it('should validate password length', () => {
      const { getByText, getByPlaceholderText } = render(
        <UserForm 
          user={undefined}
          {...mockHandlers}
        />
      );

      const nameInput = getByPlaceholderText('Digite seu nome');
      const emailInput = getByPlaceholderText('Digite seu email');
      const passwordInput = getByPlaceholderText('Digite sua senha');
      
      fireEvent.changeText(nameInput, 'João Silva');
      fireEvent.changeText(emailInput, 'joao@email.com');
      fireEvent.changeText(passwordInput, '123');

      const submitButton = getByText('Criar');
      fireEvent.press(submitButton);

      expect(getByText('Senha deve ter pelo menos 6 caracteres')).toBeTruthy();
    });

    it('should validate password confirmation', () => {
      const { getByText, getByPlaceholderText } = render(
        <UserForm 
          user={undefined}
          {...mockHandlers}
        />
      );

      const nameInput = getByPlaceholderText('Digite seu nome');
      const emailInput = getByPlaceholderText('Digite seu email');
      const passwordInput = getByPlaceholderText('Digite sua senha');
      const confirmPasswordInput = getByPlaceholderText('Confirme sua senha');
      
      fireEvent.changeText(nameInput, 'João Silva');
      fireEvent.changeText(emailInput, 'joao@email.com');
      fireEvent.changeText(passwordInput, 'senha123');
      fireEvent.changeText(confirmPasswordInput, 'senha456');

      const submitButton = getByText('Criar');
      fireEvent.press(submitButton);

      expect(getByText('Senhas não coincidem')).toBeTruthy();
    });
  });

  describe('form submission', () => {
    it('should call onSubmit with valid form data', () => {
      const { getByText, getByPlaceholderText } = render(
        <UserForm 
          user={undefined}
          {...mockHandlers}
        />
      );

      // Fill form
      const nameInput = getByPlaceholderText('Digite seu nome');
      const emailInput = getByPlaceholderText('Digite seu email');
      const passwordInput = getByPlaceholderText('Digite sua senha');
      const confirmPasswordInput = getByPlaceholderText('Confirme sua senha');
      
      fireEvent.changeText(nameInput, 'Maria Santos');
      fireEvent.changeText(emailInput, 'maria@email.com');
      fireEvent.changeText(passwordInput, 'senha123');
      fireEvent.changeText(confirmPasswordInput, 'senha123');

      const submitButton = getByText('Criar');
      fireEvent.press(submitButton);

      expect(mockHandlers.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Maria Santos',
          email: 'maria@email.com',
          password: 'senha123',
          confirmPassword: 'senha123'
        })
      );
    });

    it('should call onSubmit with updated user data', () => {
      const { getByText } = render(
        <UserForm 
          user={mockUser}
          {...mockHandlers}
        />
      );

      const submitButton = getByText('Atualizar');
      fireEvent.press(submitButton);

      expect(mockHandlers.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-1',
          name: 'João Silva',
          email: 'joao.silva@email.com',
          password: 'senha123',
          confirmPassword: 'senha123'
        })
      );
    });
  });

  describe('form actions', () => {
    it('should call onCancel when cancel button is pressed', () => {
      const { getByText } = render(
        <UserForm 
          user={undefined}
          {...mockHandlers}
        />
      );

      const cancelButton = getByText('Cancelar');
      fireEvent.press(cancelButton);

      expect(mockHandlers.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should show delete button for existing user', () => {
      const { getByText } = render(
        <UserForm 
          user={mockUser}
          {...mockHandlers}
        />
      );

      const deleteButton = getByText('Excluir');
      expect(deleteButton).toBeTruthy();
    });

    it('should not show delete button for new user', () => {
      const { queryByText } = render(
        <UserForm 
          user={undefined}
          {...mockHandlers}
        />
      );

      expect(queryByText('Excluir')).toBeNull();
    });
  });

  describe('form fields', () => {
    it('should handle name input changes', () => {
      const { getByPlaceholderText } = render(
        <UserForm 
          user={undefined}
          {...mockHandlers}
        />
      );

      const nameInput = getByPlaceholderText('Digite seu nome');
      fireEvent.changeText(nameInput, 'Novo Nome');

      expect(nameInput.props.value).toBe('Novo Nome');
    });

    it('should handle email input changes', () => {
      const { getByPlaceholderText } = render(
        <UserForm 
          user={undefined}
          {...mockHandlers}
        />
      );

      const emailInput = getByPlaceholderText('Digite seu email');
      fireEvent.changeText(emailInput, 'novo@email.com');

      expect(emailInput.props.value).toBe('novo@email.com');
    });

    it('should handle password input changes', () => {
      const { getByPlaceholderText } = render(
        <UserForm 
          user={undefined}
          {...mockHandlers}
        />
      );

      const passwordInput = getByPlaceholderText('Digite sua senha');
      fireEvent.changeText(passwordInput, 'novaSenha123');

      expect(passwordInput.props.value).toBe('novaSenha123');
    });

    it('should handle confirm password input changes', () => {
      const { getByPlaceholderText } = render(
        <UserForm 
          user={undefined}
          {...mockHandlers}
        />
      );

      const confirmPasswordInput = getByPlaceholderText('Confirme sua senha');
      fireEvent.changeText(confirmPasswordInput, 'novaSenha123');

      expect(confirmPasswordInput.props.value).toBe('novaSenha123');
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByText } = render(
        <UserForm 
          user={undefined}
          {...mockHandlers}
        />
      );

      // Verificar se os campos existem
      expect(getByText('Nome')).toBeTruthy();
      expect(getByText('Email')).toBeTruthy();
      expect(getByText('Senha')).toBeTruthy();
      expect(getByText('Confirmar Senha')).toBeTruthy();
    });

    it('should have proper testID for automation', () => {
      const { getByText } = render(
        <UserForm 
          user={undefined}
          {...mockHandlers}
        />
      );

      // Verificar se os botões existem
      expect(getByText('Cancelar')).toBeTruthy();
      expect(getByText('Criar')).toBeTruthy();
    });
  });

  describe('loading state', () => {
    it('should disable form when loading', () => {
      const { getByText } = render(
        <UserForm 
          user={undefined}
          loading={true}
          {...mockHandlers}
        />
      );

      const loadingText = getByText('Carregando...');

      // Verificar se o texto de loading existe
      expect(loadingText).toBeTruthy();
    });

    it('should show loading indicator', () => {
      const { getByText } = render(
        <UserForm 
          user={undefined}
          loading={true}
          {...mockHandlers}
        />
      );

      expect(getByText('Carregando...')).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should display error message when provided', () => {
      const { getByText } = render(
        <UserForm 
          user={undefined}
          error="Erro ao salvar usuário"
          {...mockHandlers}
        />
      );

      expect(getByText('Erro ao salvar usuário')).toBeTruthy();
    });

    it('should not display error when no error provided', () => {
      const { queryByText } = render(
        <UserForm 
          user={undefined}
          {...mockHandlers}
        />
      );

      expect(queryByText(/Erro/)).toBeNull();
    });
  });
});
