// Screen: ManageSubScreen
// Responsável por gerenciar operações existentes com funcionalidades de filtro, busca, ordenação e paginação
// Integra com OperationViewModel, CategoryViewModel e AccountViewModel

import { OperationViewModel } from '../view-models/OperationViewModel';
import { CategoryViewModel } from '../view-models/CategoryViewModel';
import { AccountViewModel } from '../view-models/AccountViewModel';
import { Operation } from '../../domain/entities/Operation';

// Types for filters
export type FilterNature = 'all' | 'receita' | 'despesa';
export type FilterCategory = 'all' | string;
export type FilterDateRange = 'all' | 'today' | 'week' | 'month' | 'year';
export type SortField = 'date' | 'amount' | 'category' | 'nature';
export type SortDirection = 'asc' | 'desc';

export interface Filters {
  nature: FilterNature;
  category: FilterCategory;
  dateRange: FilterDateRange;
  minAmount: number;
  maxAmount: number;
}

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export class ManageSubScreen {
  private operations: Operation[] = [];
  private filteredOperations: Operation[] = [];
  private searchResults: Operation[] = [];
  private selectedOperation: Operation | null = null;
  private isEditing: boolean = false;
  private showFilters: boolean = false;
  private filters: Filters;
  private sortConfig: SortConfig;
  private searchQuery: string = '';

  constructor(
    private operationViewModel: OperationViewModel,
    private categoryViewModel: CategoryViewModel,
    private accountViewModel: AccountViewModel
  ) {
    this.filters = this.getDefaultFilters();
    this.sortConfig = { field: 'date', direction: 'desc' };
    this.operations = this.operationViewModel.operations || [];
    this.filteredOperations = [...this.operations];
  }

  // Getters
  getOperations(): Operation[] { return this.operations; }
  getFilteredOperations(): Operation[] { return this.filteredOperations; }
  getSearchResults(): Operation[] { return this.searchResults; }
  getSelectedOperation(): Operation | null { return this.selectedOperation; }
  getIsEditing(): boolean { return this.isEditing; }
  getShowFilters(): boolean { return this.showFilters; }
  getFilters(): Filters { return this.filters; }
  getSortConfig(): SortConfig { return this.sortConfig; }
  getSearchQuery(): string { return this.searchQuery; }

  // Operation management
  selectOperation(operation: Operation): void {
    this.selectedOperation = operation;
    this.isEditing = true;
  }

  clearSelectedOperation(): void {
    this.selectedOperation = null;
    this.isEditing = false;
  }

  async deleteOperation(operationId: string): Promise<boolean> {
    try {
      await this.operationViewModel.deleteOperation(operationId);
      
      // Remove from local arrays
      this.operations = this.operations.filter(op => op.id !== operationId);
      this.filteredOperations = this.filteredOperations.filter(op => op.id !== operationId);
      this.searchResults = this.searchResults.filter(op => op.id !== operationId);
      
      // Clear selection if the deleted operation was selected
      if (this.selectedOperation?.id === operationId) {
        this.clearSelectedOperation();
      }
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      this.operationViewModel.setError(errorMessage);
      return false;
    }
  }

  // Filtering
  setFilter<K extends keyof Filters>(key: K, value: Filters[K]): void {
    this.filters[key] = value;
  }

  applyFilters(): void {
    let filtered = [...this.operations];

    // Filter by nature
    if (this.filters.nature !== 'all') {
      filtered = filtered.filter(op => op.nature === this.filters.nature);
    }

    // Filter by category
    if (this.filters.category !== 'all') {
      filtered = filtered.filter(op => op.category === this.filters.category);
    }

    // Filter by amount range
    filtered = filtered.filter(op => 
      op.value.value >= this.filters.minAmount && 
      op.value.value <= this.filters.maxAmount
    );

    // Filter by date range
    if (this.filters.dateRange !== 'all') {
      filtered = this.filterByDateRange(filtered, this.filters.dateRange);
    }

    // Apply sorting
    this.applySorting(filtered);
    
    this.filteredOperations = filtered;
  }

  private filterByDateRange(operations: Operation[], dateRange: FilterDateRange): Operation[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateRange) {
      case 'today':
        return operations.filter(op => {
          const opDate = new Date(op.date.getFullYear(), op.date.getMonth(), op.date.getDate());
          return opDate.getTime() === today.getTime();
        });
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return operations.filter(op => op.date >= weekAgo);
      case 'month':
        const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        return operations.filter(op => op.date >= monthAgo);
      case 'year':
        const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        return operations.filter(op => op.date >= yearAgo);
      default:
        return operations;
    }
  }

  clearFilters(): void {
    this.filters = this.getDefaultFilters();
    this.filteredOperations = [...this.operations];
    // Don't apply sorting here to preserve original order
  }

  private getDefaultFilters(): Filters {
    return {
      nature: 'all',
      category: 'all',
      dateRange: 'all',
      minAmount: 0,
      maxAmount: Infinity,
    };
  }

  // Search functionality
  searchOperations(query: string): void {
    this.searchQuery = query;
    
    if (!query.trim()) {
      this.searchResults = [];
      return;
    }

    const searchTerm = query.toLowerCase();
    this.searchResults = this.operations.filter(op => 
      op.category.toLowerCase().includes(searchTerm) ||
      (op.details?.toLowerCase().includes(searchTerm) || false) ||
      op.sourceAccount.toLowerCase().includes(searchTerm) ||
      op.destinationAccount.toLowerCase().includes(searchTerm)
    );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
  }

  // Sorting
  sortOperations(field: SortField, direction: SortDirection): void {
    this.sortConfig = { field, direction };
    this.applySorting(this.filteredOperations);
  }

  private applySorting(operations: Operation[]): void {
    operations.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.sortConfig.field) {
        case 'date':
          aValue = a.date.getTime();
          bValue = b.date.getTime();
          break;
        case 'amount':
          aValue = a.value.value;
          bValue = b.value.value;
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'nature':
          aValue = a.nature;
          bValue = b.nature;
          break;
        default:
          return 0;
      }

      if (this.sortConfig.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  // Filter visibility
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  displayFilters(): void {
    this.showFilters = true;
  }

  hideFilters(): void {
    this.showFilters = false;
  }

  // Data loading
  async onMount(): Promise<void> {
    await this.loadData();
  }

  async loadOperations(): Promise<void> {
    try {
      await this.operationViewModel.loadOperations();
      this.operations = this.operationViewModel.operations || [];
      this.filteredOperations = [...this.operations];
      this.applySorting(this.filteredOperations);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Load failed';
      this.operationViewModel.setError(errorMessage);
    }
  }

  async loadData(): Promise<void> {
    try {
      await Promise.all([
        this.loadOperations(),
        this.categoryViewModel.loadCategories(),
        this.accountViewModel.getAllAccounts(),
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Load failed';
      this.operationViewModel.setError(errorMessage);
    }
  }

  async refreshData(): Promise<void> {
    await this.loadData();
  }

  // Statistics
  getTotalIncome(): number {
    return this.operations
      .filter(op => op.nature === 'receita')
      .reduce((total, op) => total + op.value.value, 0);
  }

  getTotalExpenses(): number {
    return this.operations
      .filter(op => op.nature === 'despesa')
      .reduce((total, op) => total + op.value.value, 0);
  }

  getNetAmount(): number {
    return this.getTotalIncome() - this.getTotalExpenses();
  }

  getOperationsCountByNature(): Record<string, number> {
    const counts: Record<string, number> = {};
    
    this.operations.forEach(op => {
      counts[op.nature] = (counts[op.nature] || 0) + 1;
    });
    
    return counts;
  }

  getOperationsCountByCategory(): Record<string, number> {
    const counts: Record<string, number> = {};
    
    this.operations.forEach(op => {
      counts[op.category] = (counts[op.category] || 0) + 1;
    });
    
    return counts;
  }

  // Pagination
  getPaginatedOperations(page: number, pageSize: number): Operation[] {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return this.filteredOperations.slice(startIndex, endIndex);
  }

  getTotalPages(pageSize: number): number {
    if (this.filteredOperations.length === 0) return 0;
    return Math.ceil(this.filteredOperations.length / pageSize);
  }

  // Error handling
  clearErrors(): void {
    this.operationViewModel.setError(null);
    this.categoryViewModel.setError(null);
    this.accountViewModel.clearError();
  }

  getLoading(): boolean {
    return this.operationViewModel.isLoading || 
           this.categoryViewModel.isLoading || 
           this.accountViewModel.isLoading;
  }

  getError(): string | null {
    return this.operationViewModel.error || 
           this.categoryViewModel.error || 
           this.accountViewModel.error;
  }
}
