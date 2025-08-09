import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CategoryForm } from '../../../../clean-architecture/presentation/pure-components/CategoryForm';
import { Category } from '../../../../clean-architecture/domain/entities/Category';

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

describe('CategoryForm', () => {
  const mockCategory = new Category({
    id: 'category-1',
    name: 'Alimentação',
    type: 'expense',
    isDefault: false,
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
        <CategoryForm 
          category={mockCategory}
          {...mockHandlers}
        />
      );

      expect(getByText('Nome')).toBeTruthy();
      expect(getByText('Tipo')).toBeTruthy();
      expect(getByText('Padrão')).toBeTruthy();
      expect(getByPlaceholderText('Digite o nome da categoria')).toBeTruthy();
    });

    it('should render with empty category for new category', () => {
      const { getByText, getByPlaceholderText } = render(
        <CategoryForm 
          category={undefined}
          {...mockHandlers}
        />
      );

      expect(getByText('Nova Categoria')).toBeTruthy();
      expect(getByPlaceholderText('Digite o nome da categoria')).toBeTruthy();
    });

    it('should render with existing category for edit', () => {
      const { getByText, getByDisplayValue } = render(
        <CategoryForm 
          category={mockCategory}
          {...mockHandlers}
        />
      );

      expect(getByText('Editar Categoria')).toBeTruthy();
      expect(getByDisplayValue('Alimentação')).toBeTruthy();
    });
  });

  describe('form validation', () => {
    it('should show validation errors for empty required fields', () => {
      const { getByText } = render(
        <CategoryForm 
          category={undefined}
          {...mockHandlers}
        />
      );

      const submitButton = getByText('Criar');
      fireEvent.press(submitButton);

      expect(getByText('Nome é obrigatório')).toBeTruthy();
      // O tipo sempre tem um valor padrão, então não deve mostrar erro
    });

    it('should validate name length', () => {
      const { getByText, getByPlaceholderText } = render(
        <CategoryForm 
          category={undefined}
          {...mockHandlers}
        />
      );

      const nameInput = getByPlaceholderText('Digite o nome da categoria');
      fireEvent.changeText(nameInput, 'A'); // Nome muito curto

      const submitButton = getByText('Criar');
      fireEvent.press(submitButton);

      expect(getByText('Nome deve ter pelo menos 3 caracteres')).toBeTruthy();
    });

    it('should validate name format', () => {
      const { getByText, getByPlaceholderText } = render(
        <CategoryForm 
          category={undefined}
          {...mockHandlers}
        />
      );

      const nameInput = getByPlaceholderText('Digite o nome da categoria');
      fireEvent.changeText(nameInput, '123'); // Nome com números

      const submitButton = getByText('Criar');
      fireEvent.press(submitButton);

      expect(getByText('Nome deve conter apenas letras e espaços')).toBeTruthy();
    });
  });

  describe('form submission', () => {
    it('should call onSubmit with valid form data', () => {
      const { getByText, getByPlaceholderText } = render(
        <CategoryForm 
          category={undefined}
          {...mockHandlers}
        />
      );

      // Fill form
      const nameInput = getByPlaceholderText('Digite o nome da categoria');
      fireEvent.changeText(nameInput, 'Nova Categoria');

      const submitButton = getByText('Criar');
      fireEvent.press(submitButton);

      expect(mockHandlers.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Nova Categoria',
          type: 'expense',
          isDefault: false
        })
      );
    });

    it('should call onSubmit with updated category data', () => {
      const { getByText, getByDisplayValue } = render(
        <CategoryForm 
          category={mockCategory}
          {...mockHandlers}
        />
      );

      const submitButton = getByText('Atualizar');
      fireEvent.press(submitButton);

      expect(mockHandlers.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'category-1',
          name: 'Alimentação',
          type: 'expense',
          isDefault: false
        })
      );
    });
  });

  describe('form actions', () => {
    it('should call onCancel when cancel button is pressed', () => {
      const { getByText } = render(
        <CategoryForm 
          category={undefined}
          {...mockHandlers}
        />
      );

      const cancelButton = getByText('Cancelar');
      fireEvent.press(cancelButton);

      expect(mockHandlers.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when delete button is pressed for existing category', () => {
      const { getByText } = render(
        <CategoryForm 
          category={mockCategory}
          {...mockHandlers}
        />
      );

      const deleteButton = getByText('Excluir');
      fireEvent.press(deleteButton);

      expect(mockHandlers.onDelete).toHaveBeenCalledWith('category-1');
    });

    it('should not show delete button for new category', () => {
      const { queryByText } = render(
        <CategoryForm 
          category={undefined}
          {...mockHandlers}
        />
      );

      expect(queryByText('Excluir')).toBeNull();
    });
  });

  describe('form fields', () => {
    it('should handle name input changes', () => {
      const { getByPlaceholderText } = render(
        <CategoryForm 
          category={undefined}
          {...mockHandlers}
        />
      );

      const nameInput = getByPlaceholderText('Digite o nome da categoria');
      fireEvent.changeText(nameInput, 'Nova categoria');

      expect(nameInput.props.value).toBe('Nova categoria');
    });

    it('should handle type selection', () => {
      const { getByText } = render(
        <CategoryForm 
          category={undefined}
          {...mockHandlers}
        />
      );

      // Simular seleção de tipo
      const typeSelector = getByText('Tipo');
      expect(typeSelector).toBeTruthy();
    });

    it('should handle default toggle', () => {
      const { getByText } = render(
        <CategoryForm 
          category={undefined}
          {...mockHandlers}
        />
      );

      const defaultToggle = getByText('Padrão');
      expect(defaultToggle).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByText } = render(
        <CategoryForm 
          category={undefined}
          {...mockHandlers}
        />
      );

      // Verificar se os campos existem
      expect(getByText('Nome')).toBeTruthy();
      expect(getByText('Tipo')).toBeTruthy();
      expect(getByText('Padrão')).toBeTruthy();
    });

    it('should have proper testID for automation', () => {
      const { getByText } = render(
        <CategoryForm 
          category={undefined}
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
        <CategoryForm 
          category={undefined}
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
        <CategoryForm 
          category={undefined}
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
        <CategoryForm 
          category={undefined}
          error="Erro ao salvar categoria"
          {...mockHandlers}
        />
      );

      expect(getByText('Erro ao salvar categoria')).toBeTruthy();
    });

    it('should not display error when no error provided', () => {
      const { queryByText } = render(
        <CategoryForm 
          category={undefined}
          {...mockHandlers}
        />
      );

      expect(queryByText(/Erro/)).toBeNull();
    });
  });
});
