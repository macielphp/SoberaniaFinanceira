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