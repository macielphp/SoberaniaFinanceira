// Service Registry
// Registro centralizado de todos os serviços da aplicação

import { Container, ServiceIdentifier } from './Container';

export interface ServiceRegistration {
  identifier: ServiceIdentifier<any>;
  factory: () => any;
  singleton: boolean;
  dependencies?: ServiceIdentifier<any>[];
}

export class ServiceRegistry {
  private container: Container;
  private registrations: ServiceRegistration[] = [];

  constructor(container: Container) {
    this.container = container;
  }

  // Registrar serviço singleton
  registerSingleton<T>(identifier: ServiceIdentifier<T>, factory: () => T, dependencies?: ServiceIdentifier<any>[]): ServiceRegistry {
    this.registrations.push({
      identifier,
      factory,
      singleton: true,
      dependencies
    });
    return this;
  }

  // Registrar serviço transient
  registerTransient<T>(identifier: ServiceIdentifier<T>, factory: () => T, dependencies?: ServiceIdentifier<any>[]): ServiceRegistry {
    this.registrations.push({
      identifier,
      factory,
      singleton: false,
      dependencies
    });
    return this;
  }

  // Configurar todos os serviços no container
  configure(): void {
    this.registrations.forEach(registration => {
      if (registration.singleton) {
        this.container.registerSingleton(registration.identifier, registration.factory);
      } else {
        this.container.registerTransient(registration.identifier, registration.factory);
      }
    });
  }

  // Verificar dependências circulares
  validateDependencies(): void {
    const visited = new Set<ServiceIdentifier<any>>();
    const recursionStack = new Set<ServiceIdentifier<any>>();

    this.registrations.forEach(registration => {
      if (registration.dependencies) {
        this.checkCircularDependencies(registration.identifier, visited, recursionStack);
      }
    });
  }

  private checkCircularDependencies(
    identifier: ServiceIdentifier<any>,
    visited: Set<ServiceIdentifier<any>>,
    recursionStack: Set<ServiceIdentifier<any>>
  ): void {
    if (recursionStack.has(identifier)) {
      throw new Error(`Circular dependency detected: ${String(identifier)}`);
    }

    if (visited.has(identifier)) {
      return;
    }

    visited.add(identifier);
    recursionStack.add(identifier);

    const registration = this.registrations.find(r => r.identifier === identifier);
    if (registration?.dependencies) {
      registration.dependencies.forEach(dep => {
        this.checkCircularDependencies(dep, visited, recursionStack);
      });
    }

    recursionStack.delete(identifier);
  }

  // Limpar registros
  clear(): void {
    this.registrations = [];
  }

  // Obter lista de serviços registrados
  getRegistrations(): ServiceRegistration[] {
    return [...this.registrations];
  }
}

// Registry global
export const serviceRegistry = new ServiceRegistry(new Container()); 