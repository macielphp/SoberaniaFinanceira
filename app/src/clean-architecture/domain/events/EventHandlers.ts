import { EventBus } from '../../shared/events/EventBus';
import { DomainEventType, DomainEventFactory, EventTypeGuards } from './DomainEvents';
import { Operation } from '../entities/Operation';
import { Account } from '../entities/Account';
import { Category } from '../entities/Category';
import { Goal } from '../entities/Goal';

// Base interface for event handlers
export interface EventHandler<T extends DomainEventType = DomainEventType> {
  handle(event: T): void | Promise<void>;
}

// Operation Event Handlers
export class OperationEventHandler implements EventHandler {
  constructor(private eventBus: EventBus) {}

  handle(event: DomainEventType): void {
    if (!EventTypeGuards.isOperationEvent(event)) {
      return;
    }

    switch (event.type) {
      case 'OperationCreated':
        this.handleOperationCreated(event);
        break;
      case 'OperationUpdated':
        this.handleOperationUpdated(event);
        break;
      case 'OperationDeleted':
        this.handleOperationDeleted(event);
        break;
    }
  }

  private handleOperationCreated(event: any): void {
    const operation = event.data as Operation;
    console.log(`Operation created: ${operation.id} - ${operation.details}`);
    
    // Publish notification event
    this.eventBus.publish('NotificationSent', {
      type: 'success',
      message: `Operação "${operation.details}" criada com sucesso`,
      timestamp: new Date(),
    });
  }

  private handleOperationUpdated(event: any): void {
    const operation = event.data as Operation;
    console.log(`Operation updated: ${operation.id} - ${operation.details}`);
    
    // Publish notification event
    this.eventBus.publish('NotificationSent', {
      type: 'info',
      message: `Operação "${operation.details}" atualizada com sucesso`,
      timestamp: new Date(),
    });
  }

  private handleOperationDeleted(event: any): void {
    const { operationId } = event.data;
    console.log(`Operation deleted: ${operationId}`);
    
    // Publish notification event
    this.eventBus.publish('NotificationSent', {
      type: 'warning',
      message: 'Operação excluída com sucesso',
      timestamp: new Date(),
    });
  }
}

// Account Event Handlers
export class AccountEventHandler implements EventHandler {
  constructor(private eventBus: EventBus) {}

  handle(event: DomainEventType): void {
    if (!EventTypeGuards.isAccountEvent(event)) {
      return;
    }

    switch (event.type) {
      case 'AccountCreated':
        this.handleAccountCreated(event);
        break;
      case 'AccountUpdated':
        this.handleAccountUpdated(event);
        break;
      case 'AccountDeleted':
        this.handleAccountDeleted(event);
        break;
    }
  }

  private handleAccountCreated(event: any): void {
    const account = event.data as Account;
    console.log(`Account created: ${account.id} - ${account.name}`);
    
    // Publish notification event
    this.eventBus.publish('NotificationSent', {
      type: 'success',
      message: `Conta "${account.name}" criada com sucesso`,
      timestamp: new Date(),
    });
  }

  private handleAccountUpdated(event: any): void {
    const account = event.data as Account;
    console.log(`Account updated: ${account.id} - ${account.name}`);
    
    // Publish notification event
    this.eventBus.publish('NotificationSent', {
      type: 'info',
      message: `Conta "${account.name}" atualizada com sucesso`,
      timestamp: new Date(),
    });
  }

  private handleAccountDeleted(event: any): void {
    const { accountId } = event.data;
    console.log(`Account deleted: ${accountId}`);
    
    // Publish notification event
    this.eventBus.publish('NotificationSent', {
      type: 'warning',
      message: 'Conta excluída com sucesso',
      timestamp: new Date(),
    });
  }
}

// Category Event Handlers
export class CategoryEventHandler implements EventHandler {
  constructor(private eventBus: EventBus) {}

  handle(event: DomainEventType): void {
    if (!EventTypeGuards.isCategoryEvent(event)) {
      return;
    }

    switch (event.type) {
      case 'CategoryCreated':
        this.handleCategoryCreated(event);
        break;
      case 'CategoryUpdated':
        this.handleCategoryUpdated(event);
        break;
      case 'CategoryDeleted':
        this.handleCategoryDeleted(event);
        break;
    }
  }

  private handleCategoryCreated(event: any): void {
    const category = event.data as Category;
    console.log(`Category created: ${category.id} - ${category.name}`);
    
    // Publish notification event
    this.eventBus.publish('NotificationSent', {
      type: 'success',
      message: `Categoria "${category.name}" criada com sucesso`,
      timestamp: new Date(),
    });
  }

  private handleCategoryUpdated(event: any): void {
    const category = event.data as Category;
    console.log(`Category updated: ${category.id} - ${category.name}`);
    
    // Publish notification event
    this.eventBus.publish('NotificationSent', {
      type: 'info',
      message: `Categoria "${category.name}" atualizada com sucesso`,
      timestamp: new Date(),
    });
  }

  private handleCategoryDeleted(event: any): void {
    const { categoryId } = event.data;
    console.log(`Category deleted: ${categoryId}`);
    
    // Publish notification event
    this.eventBus.publish('NotificationSent', {
      type: 'warning',
      message: 'Categoria excluída com sucesso',
      timestamp: new Date(),
    });
  }
}

// Goal Event Handlers
export class GoalEventHandler implements EventHandler {
  constructor(private eventBus: EventBus) {}

  handle(event: DomainEventType): void {
    if (!EventTypeGuards.isGoalEvent(event)) {
      return;
    }

    switch (event.type) {
      case 'GoalCreated':
        this.handleGoalCreated(event);
        break;
      case 'GoalUpdated':
        this.handleGoalUpdated(event);
        break;
      case 'GoalDeleted':
        this.handleGoalDeleted(event);
        break;
      case 'GoalCompleted':
        this.handleGoalCompleted(event);
        break;
    }
  }

  private handleGoalCreated(event: any): void {
    const goal = event.data as Goal;
    console.log(`Goal created: ${goal.id} - ${goal.description}`);
    
    // Publish notification event
    this.eventBus.publish('NotificationSent', {
      type: 'success',
      message: `Meta "${goal.description}" criada com sucesso`,
      timestamp: new Date(),
    });
  }

  private handleGoalUpdated(event: any): void {
    const goal = event.data as Goal;
    console.log(`Goal updated: ${goal.id} - ${goal.description}`);
    
    // Publish notification event
    this.eventBus.publish('NotificationSent', {
      type: 'info',
      message: `Meta "${goal.description}" atualizada com sucesso`,
      timestamp: new Date(),
    });
  }

  private handleGoalDeleted(event: any): void {
    const { goalId } = event.data;
    console.log(`Goal deleted: ${goalId}`);
    
    // Publish notification event
    this.eventBus.publish('NotificationSent', {
      type: 'warning',
      message: 'Meta excluída com sucesso',
      timestamp: new Date(),
    });
  }

  private handleGoalCompleted(event: any): void {
    const goal = event.data as Goal;
    console.log(`Goal completed: ${goal.id} - ${goal.description}`);
    
    // Publish notification event
    this.eventBus.publish('NotificationSent', {
      type: 'success',
      message: `Parabéns! Meta "${goal.description}" foi concluída!`,
      timestamp: new Date(),
    });

    // Publish achievement event
    this.eventBus.publish('AchievementUnlocked', {
      type: 'goal_completed',
      data: {
        goalId: goal.id,
        goalDescription: goal.description,
        completedAt: new Date(),
      },
      timestamp: new Date(),
    });
  }
}

// Notification Event Handler
export class NotificationEventHandler implements EventHandler {
  handle(event: DomainEventType): void {
    if (event.type === 'NotificationSent') {
      this.handleNotificationSent(event);
    }
  }

  private handleNotificationSent(event: any): void {
    const { type, message, timestamp } = event.data;
    console.log(`[${type.toUpperCase()}] ${message} - ${timestamp.toISOString()}`);
    
    // Here you would integrate with your notification system
    // For example: Toast notifications, Push notifications, etc.
  }
}

// Audit Event Handler
export class AuditEventHandler implements EventHandler {
  handle(event: DomainEventType): void {
    // Log all events for audit purposes
    console.log(`[AUDIT] ${event.type} - ${event.timestamp.toISOString()}`);
    
    // Here you would save to audit log
    // For example: Database, File, External service, etc.
  }
}

// Event Handler Registry
export class EventHandlerRegistry {
  private handlers: EventHandler[] = [];

  constructor(private eventBus: EventBus) {
    this.registerDefaultHandlers();
  }

  private registerDefaultHandlers(): void {
    this.registerHandler(new OperationEventHandler(this.eventBus));
    this.registerHandler(new AccountEventHandler(this.eventBus));
    this.registerHandler(new CategoryEventHandler(this.eventBus));
    this.registerHandler(new GoalEventHandler(this.eventBus));
    this.registerHandler(new NotificationEventHandler());
    this.registerHandler(new AuditEventHandler());
  }

  registerHandler(handler: EventHandler): void {
    this.handlers.push(handler);
  }

  handleEvent(event: DomainEventType): void {
    this.handlers.forEach(handler => {
      try {
        handler.handle(event);
      } catch (error) {
        console.error(`Error in event handler:`, error);
      }
    });
  }

  getHandlerCount(): number {
    return this.handlers.length;
  }

  clearHandlers(): void {
    this.handlers = [];
  }
} 