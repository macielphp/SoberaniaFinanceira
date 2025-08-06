import { container } from './Container';
import { SQLiteOperationRepository } from '../../data/repositories/SQLiteOperationRepository';
import { SQLiteAccountRepository } from '../../data/repositories/SQLiteAccountRepository';
import { SQLiteCategoryRepository } from '../../data/repositories/SQLiteCategoryRepository';
import { SQLiteGoalRepository } from '../../data/repositories/SQLiteGoalRepository';
import { OperationViewModel } from '../../presentation/view-models/OperationViewModel';
import { AccountViewModel } from '../../presentation/view-models/AccountViewModel';
import { CategoryViewModel } from '../../presentation/view-models/CategoryViewModel';
import { GoalViewModel } from '../../presentation/view-models/GoalViewModel';
import { OperationSummaryViewModel } from '../../presentation/view-models/OperationSummaryViewModel';

export function configureServices(): void {
  // Registrar repositórios
  container.registerSingleton('IOperationRepository', () => new SQLiteOperationRepository());
  container.registerSingleton('IAccountRepository', () => new SQLiteAccountRepository());
  container.registerSingleton('ICategoryRepository', () => new SQLiteCategoryRepository());
  container.registerSingleton('IGoalRepository', () => new SQLiteGoalRepository());

  // Registrar ViewModels
  container.registerTransient('OperationViewModel', () => {
    const operationRepository = container.resolve('IOperationRepository');
    return new OperationViewModel(operationRepository);
  });

  container.registerTransient('AccountViewModel', () => {
    const accountRepository = container.resolve('IAccountRepository');
    return new AccountViewModel(accountRepository);
  });

  container.registerTransient('CategoryViewModel', () => {
    const categoryRepository = container.resolve('ICategoryRepository');
    return new CategoryViewModel(categoryRepository);
  });

  container.registerTransient('GoalViewModel', () => {
    const goalRepository = container.resolve('IGoalRepository');
    return new GoalViewModel(goalRepository);
  });

  container.registerTransient('OperationSummaryViewModel', () => {
    const operationRepository = container.resolve('IOperationRepository');
    const categoryRepository = container.resolve('ICategoryRepository');
    
    // Por enquanto, vamos criar com dados vazios
    // TODO: Implementar carregamento real de dados
    return new OperationSummaryViewModel([], []);
  });
} 