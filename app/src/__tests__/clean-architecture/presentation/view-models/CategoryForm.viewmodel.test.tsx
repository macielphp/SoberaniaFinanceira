import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CategoryForm from '../../../components/CategoryForm/CategoryForm';
import { Category } from '../../../clean-architecture/domain/entities/Category';

// Mock do useCategoryViewModelAdapter
const mockCategory = new Category({
  id: '1',
  name: 'Alimentação',
  type: 'expense',
});

const mockUseCategoryViewModelAdapter = {
  categories: [mockCategory],
  loading: false,
  error: null,
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
  loadCategories: jest.fn(),
};

jest.mock('../../../clean-architecture/presentation/ui-adapters/useCategoryViewModelAdapter', () => () => mockUseCategoryViewModelAdapter);

describe('CategoryForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar formulário para criar nova categoria', () => {
    const { getByText, getByPlaceholderText } = render(<CategoryForm />);
    
    expect(getByText('Nova Categoria')).toBeTruthy();
    expect(getByPlaceholderText('Nome da categoria')).toBeTruthy();
    expect(getByText('Tipo')).toBeTruthy();
    expect(getByText('Salvar')).toBeTruthy();
    expect(getByText('Cancelar')).toBeTruthy();
  });

  it('deve renderizar formulário para editar categoria existente', () => {
    const { getByText, getByDisplayValue } = render(
      <CategoryForm category={mockCategory} />
    );
    
    expect(getByText('Editar Categoria')).toBeTruthy();
    expect(getByDisplayValue('Alimentação')).toBeTruthy();
    expect(getByText('Salvar')).toBeTruthy();
    expect(getByText('Cancelar')).toBeTruthy();
  });

  it('deve permitir inserir nome da categoria', () => {
    const { getByPlaceholderText } = render(<CategoryForm />);
    
    const nameInput = getByPlaceholderText('Nome da categoria');
    fireEvent.changeText(nameInput, 'Transporte');
    
    expect(nameInput.props.value).toBe('Transporte');
  });

  it('deve permitir selecionar tipo da categoria', () => {
    const { getByText } = render(<CategoryForm />);
    
    const typePicker = getByText('Tipo');
    fireEvent.press(typePicker);
    
    // Verificar se as opções de tipo estão disponíveis
    expect(getByText('Receita')).toBeTruthy();
    expect(getByText('Despesa')).toBeTruthy();
  });

  it('deve validar campos obrigatórios', async () => {
    const { getByText } = render(<CategoryForm />);
    
    const saveButton = getByText('Salvar');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(getByText('Nome é obrigatório')).toBeTruthy();
    });
  });

  it('deve criar nova categoria quando formulário é válido', async () => {
    const mockOnSave = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <CategoryForm onSave={mockOnSave} />
    );
    
    const nameInput = getByPlaceholderText('Nome da categoria');
    fireEvent.changeText(nameInput, 'Transporte');
    
    const saveButton = getByText('Salvar');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'Transporte',
        type: 'expense',
      });
    });
  });

  it('deve atualizar categoria existente', async () => {
    const mockOnSave = jest.fn();
    const { getByDisplayValue, getByText } = render(
      <CategoryForm category={mockCategory} onSave={mockOnSave} />
    );
    
    const nameInput = getByDisplayValue('Alimentação');
    fireEvent.changeText(nameInput, 'Alimentação Atualizada');
    
    const saveButton = getByText('Salvar');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        id: '1',
        name: 'Alimentação Atualizada',
        type: 'expense',
      });
    });
  });

  it('deve permitir cancelar operação', () => {
    const mockOnCancel = jest.fn();
    const { getByText } = render(<CategoryForm onCancel={mockOnCancel} />);
    
    const cancelButton = getByText('Cancelar');
    fireEvent.press(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('deve mostrar loading quando estiver processando', () => {
    const { getByText } = render(<CategoryForm loading={true} />);
    
    expect(getByText('Salvando...')).toBeTruthy();
  });

  it('deve desabilitar campos quando loading', () => {
    const { getByPlaceholderText, getByText } = render(<CategoryForm loading={true} />);
    
    const nameInput = getByPlaceholderText('Nome da categoria');
    const saveButton = getByText('Salvando...');
    
    expect(nameInput.props.editable).toBe(false);
    expect(saveButton.props.disabled).toBe(true);
  });

  it('deve mostrar erro quando houver erro', () => {
    const { getByText } = render(<CategoryForm error="Erro ao salvar categoria" />);
    
    expect(getByText('Erro ao salvar categoria')).toBeTruthy();
  });

  it('deve permitir deletar categoria existente', () => {
    const mockOnDelete = jest.fn();
    const { getByText } = render(
      <CategoryForm category={mockCategory} onDelete={mockOnDelete} />
    );
    
    const deleteButton = getByText('Excluir');
    fireEvent.press(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockCategory);
  });

  it('deve mostrar confirmação antes de deletar', () => {
    const mockOnDelete = jest.fn();
    const { getByText } = render(
      <CategoryForm category={mockCategory} onDelete={mockOnDelete} />
    );
    
    const deleteButton = getByText('Excluir');
    fireEvent.press(deleteButton);
    
    // Verificar se o alerta de confirmação aparece
    expect(getByText('Confirmar exclusão')).toBeTruthy();
  });

  it('deve validar nome mínimo de caracteres', async () => {
    const { getByPlaceholderText, getByText } = render(<CategoryForm />);
    
    const nameInput = getByPlaceholderText('Nome da categoria');
    fireEvent.changeText(nameInput, 'A');
    
    const saveButton = getByText('Salvar');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(getByText('Nome deve ter pelo menos 3 caracteres')).toBeTruthy();
    });
  });

  it('deve validar nome máximo de caracteres', async () => {
    const { getByPlaceholderText, getByText } = render(<CategoryForm />);
    
    const nameInput = getByPlaceholderText('Nome da categoria');
    fireEvent.changeText(nameInput, 'A'.repeat(51));
    
    const saveButton = getByText('Salvar');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(getByText('Nome deve ter no máximo 50 caracteres')).toBeTruthy();
    });
  });

  it('deve permitir selecionar cor da categoria', () => {
    const { getByText } = render(<CategoryForm />);
    
    const colorButton = getByText('Selecionar Cor');
    fireEvent.press(colorButton);
    
    // Verificar se o seletor de cor aparece
    expect(getByText('Cores Disponíveis')).toBeTruthy();
  });

  it('deve permitir selecionar ícone da categoria', () => {
    const { getByText } = render(<CategoryForm />);
    
    const iconButton = getByText('Selecionar Ícone');
    fireEvent.press(iconButton);
    
    // Verificar se o seletor de ícone aparece
    expect(getByText('Ícones Disponíveis')).toBeTruthy();
  });

  it('deve mostrar preview da categoria', () => {
    const { getByText } = render(<CategoryForm />);
    
    const nameInput = getByText('Nome da categoria');
    fireEvent.changeText(nameInput, 'Transporte');
    
    // Verificar se o preview aparece
    expect(getByText('Preview:')).toBeTruthy();
    expect(getByText('Transporte')).toBeTruthy();
  });

  it('deve permitir marcar categoria como padrão', () => {
    const { getByText } = render(<CategoryForm />);
    
    const defaultSwitch = getByText('Categoria Padrão');
    fireEvent.press(defaultSwitch);
    
    // Verificar se o switch foi ativado
    expect(defaultSwitch.props.value).toBe(true);
  });

  it('deve limpar formulário após salvar com sucesso', async () => {
    const mockOnSave = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <CategoryForm onSave={mockOnSave} />
    );
    
    const nameInput = getByPlaceholderText('Nome da categoria');
    fireEvent.changeText(nameInput, 'Transporte');
    
    const saveButton = getByText('Salvar');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(nameInput.props.value).toBe('');
    });
  });
}); 