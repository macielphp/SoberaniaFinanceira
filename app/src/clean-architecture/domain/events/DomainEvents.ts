import { Operation } from '../entities/Operation';
import { Account } from '../entities/Account';
import { Category } from '../entities/Category';
import { Goal } from '../entities/Goal';

// Base interface for all domain events
export interface DomainEvent {
  type: string;
  data: any;
  timestamp: Date;
}

// Operation Events
export interface OperationCreatedEvent extends DomainEvent {
  type: 'OperationCreated';
  data: Operation;
}

export interface OperationUpdatedEvent extends DomainEvent {
  type: 'OperationUpdated';
  data: Operation;
}

export interface OperationDeletedEvent extends DomainEvent {
  type: 'OperationDeleted';
  data: { operationId: string };
}

// Account Events
export interface AccountCreatedEvent extends DomainEvent {
  type: 'AccountCreated';
  data: Account;
}

export interface AccountUpdatedEvent extends DomainEvent {
  type: 'AccountUpdated';
  data: Account;
}

export interface AccountDeletedEvent extends DomainEvent {
  type: 'AccountDeleted';
  data: { accountId: string };
}

// Category Events
export interface CategoryCreatedEvent extends DomainEvent {
  type: 'CategoryCreated';
  data: Category;
}

export interface CategoryUpdatedEvent extends DomainEvent {
  type: 'CategoryUpdated';
  data: Category;
}

export interface CategoryDeletedEvent extends DomainEvent {
  type: 'CategoryDeleted';
  data: { categoryId: string };
}

// Goal Events
export interface GoalCreatedEvent extends DomainEvent {
  type: 'GoalCreated';
  data: Goal;
}

export interface GoalUpdatedEvent extends DomainEvent {
  type: 'GoalUpdated';
  data: Goal;
}

export interface GoalDeletedEvent extends DomainEvent {
  type: 'GoalDeleted';
  data: { goalId: string };
}

export interface GoalCompletedEvent extends DomainEvent {
  type: 'GoalCompleted';
  data: Goal;
}

// Union type for all domain events
export type DomainEventType = 
  | OperationCreatedEvent
  | OperationUpdatedEvent
  | OperationDeletedEvent
  | AccountCreatedEvent
  | AccountUpdatedEvent
  | AccountDeletedEvent
  | CategoryCreatedEvent
  | CategoryUpdatedEvent
  | CategoryDeletedEvent
  | GoalCreatedEvent
  | GoalUpdatedEvent
  | GoalDeletedEvent
  | GoalCompletedEvent;

// Event factory functions
export class DomainEventFactory {
  static createOperationCreated(operation: Operation): OperationCreatedEvent {
    return {
      type: 'OperationCreated',
      data: operation,
      timestamp: new Date(),
    };
  }

  static createOperationUpdated(operation: Operation): OperationUpdatedEvent {
    return {
      type: 'OperationUpdated',
      data: operation,
      timestamp: new Date(),
    };
  }

  static createOperationDeleted(operationId: string): OperationDeletedEvent {
    return {
      type: 'OperationDeleted',
      data: { operationId },
      timestamp: new Date(),
    };
  }

  static createAccountCreated(account: Account): AccountCreatedEvent {
    return {
      type: 'AccountCreated',
      data: account,
      timestamp: new Date(),
    };
  }

  static createAccountUpdated(account: Account): AccountUpdatedEvent {
    return {
      type: 'AccountUpdated',
      data: account,
      timestamp: new Date(),
    };
  }

  static createAccountDeleted(accountId: string): AccountDeletedEvent {
    return {
      type: 'AccountDeleted',
      data: { accountId },
      timestamp: new Date(),
    };
  }

  static createCategoryCreated(category: Category): CategoryCreatedEvent {
    return {
      type: 'CategoryCreated',
      data: category,
      timestamp: new Date(),
    };
  }

  static createCategoryUpdated(category: Category): CategoryUpdatedEvent {
    return {
      type: 'CategoryUpdated',
      data: category,
      timestamp: new Date(),
    };
  }

  static createCategoryDeleted(categoryId: string): CategoryDeletedEvent {
    return {
      type: 'CategoryDeleted',
      data: { categoryId },
      timestamp: new Date(),
    };
  }

  static createGoalCreated(goal: Goal): GoalCreatedEvent {
    return {
      type: 'GoalCreated',
      data: goal,
      timestamp: new Date(),
    };
  }

  static createGoalUpdated(goal: Goal): GoalUpdatedEvent {
    return {
      type: 'GoalUpdated',
      data: goal,
      timestamp: new Date(),
    };
  }

  static createGoalDeleted(goalId: string): GoalDeletedEvent {
    return {
      type: 'GoalDeleted',
      data: { goalId },
      timestamp: new Date(),
    };
  }

  static createGoalCompleted(goal: Goal): GoalCompletedEvent {
    return {
      type: 'GoalCompleted',
      data: goal,
      timestamp: new Date(),
    };
  }
}

// Event type guards
export class EventTypeGuards {
  static isOperationEvent(event: DomainEventType): event is OperationCreatedEvent | OperationUpdatedEvent | OperationDeletedEvent {
    return event.type.startsWith('Operation');
  }

  static isAccountEvent(event: DomainEventType): event is AccountCreatedEvent | AccountUpdatedEvent | AccountDeletedEvent {
    return event.type.startsWith('Account');
  }

  static isCategoryEvent(event: DomainEventType): event is CategoryCreatedEvent | CategoryUpdatedEvent | CategoryDeletedEvent {
    return event.type.startsWith('Category');
  }

  static isGoalEvent(event: DomainEventType): event is GoalCreatedEvent | GoalUpdatedEvent | GoalDeletedEvent | GoalCompletedEvent {
    return event.type.startsWith('Goal');
  }

  static isCreatedEvent(event: DomainEventType): boolean {
    return event.type.endsWith('Created');
  }

  static isUpdatedEvent(event: DomainEventType): boolean {
    return event.type.endsWith('Updated');
  }

  static isDeletedEvent(event: DomainEventType): boolean {
    return event.type.endsWith('Deleted');
  }

  static isCompletedEvent(event: DomainEventType): boolean {
    return event.type.endsWith('Completed');
  }
} 