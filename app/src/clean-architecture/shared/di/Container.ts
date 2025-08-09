// Dependency Injection Container
// Container simples para gerenciar dependências da aplicação

export type ServiceIdentifier<T> = string | symbol | (new (...args: any[]) => T);

export interface ServiceDescriptor<T = any> {
  identifier: ServiceIdentifier<T>;
  factory: () => T;
  singleton: boolean;
  instance?: T;
}

export class Container {
  private services: Map<ServiceIdentifier<any>, ServiceDescriptor> = new Map();

  // Registrar serviço como singleton
  registerSingleton<T>(identifier: ServiceIdentifier<T>, factory: () => T): Container {
    this.services.set(identifier, {
      identifier,
      factory,
      singleton: true
    });
    return this;
  }

  // Registrar serviço como transient (nova instância a cada resolução)
  registerTransient<T>(identifier: ServiceIdentifier<T>, factory: () => T): Container {
    this.services.set(identifier, {
      identifier,
      factory,
      singleton: false
    });
    return this;
  }

  // Resolver serviço
  resolve<T>(identifier: ServiceIdentifier<T>): T {
    const descriptor = this.services.get(identifier);
    
    if (!descriptor) {
      throw new Error(`Service not registered: ${String(identifier)}`);
    }

    // Se é singleton e já tem instância, retorna a instância
    if (descriptor.singleton && descriptor.instance) {
      return descriptor.instance;
    }

    // Cria nova instância
    const instance = descriptor.factory();

    // Se é singleton, armazena a instância
    if (descriptor.singleton) {
      descriptor.instance = instance;
    }

    return instance;
  }

  // Verificar se serviço está registrado
  isRegistered<T>(identifier: ServiceIdentifier<T>): boolean {
    return this.services.has(identifier);
  }

  // Limpar todas as instâncias singleton
  clear(): void {
    this.services.forEach(descriptor => {
      if (descriptor.singleton) {
        delete descriptor.instance;
      }
    });
  }

  // Remover serviço específico
  unregister<T>(identifier: ServiceIdentifier<T>): boolean {
    return this.services.delete(identifier);
  }

  // Obter lista de serviços registrados
  getRegisteredServices(): ServiceIdentifier<any>[] {
    return Array.from(this.services.keys());
  }
}

// Container global da aplicação
export const container = new Container();

// Método de inicialização para registrar todos os serviços
export function initializeContainer(): void {
  try {
    // Importações dinâmicas para evitar dependências circulares
    const { AccountViewModel } = require('../../presentation/view-models/AccountViewModel');
    const { OperationViewModel } = require('../../presentation/view-models/OperationViewModel');
    const { GoalViewModel } = require('../../presentation/view-models/GoalViewModel');
    const { CategoryViewModel } = require('../../presentation/view-models/CategoryViewModel');
    
    // Importar repositórios
    const { SQLiteAccountRepository } = require('../../data/repositories/SQLiteAccountRepository');
    const { SQLiteOperationRepository } = require('../../data/repositories/SQLiteOperationRepository');
    const { SQLiteGoalRepository } = require('../../data/repositories/SQLiteGoalRepository');
    const { SQLiteCategoryRepository } = require('../../data/repositories/SQLiteCategoryRepository');
    
    // Importar Use Cases
    const { CreateOperationUseCase } = require('../../domain/use-cases/CreateOperationUseCase');
    const { UpdateOperationUseCase } = require('../../domain/use-cases/UpdateOperationUseCase');
    const { GetOperationByIdUseCase } = require('../../domain/use-cases/GetOperationByIdUseCase');
    const { GetOperationsUseCase } = require('../../domain/use-cases/GetOperationsUseCase');
    const { GetAccountsUseCase } = require('../../domain/use-cases/GetAccountsUseCase');
    
    // Registrar repositórios como singletons
    container.registerSingleton('AccountRepository', () => new SQLiteAccountRepository());
    container.registerSingleton('OperationRepository', () => new SQLiteOperationRepository());
    container.registerSingleton('GoalRepository', () => new SQLiteGoalRepository());
    container.registerSingleton('CategoryRepository', () => new SQLiteCategoryRepository());
    
    // Registrar Use Cases como singletons
    container.registerSingleton('CreateOperationUseCase', () => {
      const operationRepo = container.resolve('OperationRepository');
      return new CreateOperationUseCase(operationRepo);
    });
    
    container.registerSingleton('UpdateOperationUseCase', () => {
      const operationRepo = container.resolve('OperationRepository');
      return new UpdateOperationUseCase(operationRepo);
    });
    
    container.registerSingleton('GetOperationByIdUseCase', () => {
      const operationRepo = container.resolve('OperationRepository');
      return new GetOperationByIdUseCase(operationRepo);
    });
    
    container.registerSingleton('GetOperationsUseCase', () => {
      const operationRepo = container.resolve('OperationRepository');
      return new GetOperationsUseCase(operationRepo);
    });
    
    container.registerSingleton('GetAccountsUseCase', () => {
      const accountRepo = container.resolve('AccountRepository');
      return new GetAccountsUseCase(accountRepo);
    });
    
    // Registrar ViewModels como singletons
    container.registerSingleton('AccountViewModel', () => {
      const accountRepo = container.resolve('AccountRepository');
      return new AccountViewModel(accountRepo);
    });
    
    container.registerSingleton('OperationViewModel', () => {
      const createOperationUseCase = container.resolve('CreateOperationUseCase');
      const updateOperationUseCase = container.resolve('UpdateOperationUseCase');
      const getOperationByIdUseCase = container.resolve('GetOperationByIdUseCase');
      const getOperationsUseCase = container.resolve('GetOperationsUseCase');
      return new OperationViewModel(
        createOperationUseCase,
        updateOperationUseCase,
        getOperationByIdUseCase,
        getOperationsUseCase
      );
    });
    
    container.registerSingleton('GoalViewModel', () => {
      const goalRepo = container.resolve('GoalRepository');
      return new GoalViewModel(goalRepo);
    });
    
    container.registerSingleton('CategoryViewModel', () => {
      const categoryRepo = container.resolve('CategoryRepository');
      return new CategoryViewModel(categoryRepo);
    });
    
    console.log('🏗️ Container DI inicializado com sucesso!');
    console.log('📦 Serviços registrados:', container.getRegisteredServices());
  } catch (error) {
    console.error('❌ Erro ao inicializar Container DI:', error);
    throw error;
  }
}

// Decorator para injeção automática (opcional)
export function Inject<T>(identifier: ServiceIdentifier<T>) {
  return function (target: any, propertyKey: string | symbol) {
    Object.defineProperty(target, propertyKey, {
      get: function () {
        return container.resolve(identifier);
      },
      enumerable: true,
      configurable: true
    });
  };
} 