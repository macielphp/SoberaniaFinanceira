// Interface for MonthlyFinanceSummary Repository
// Defines the contract for MonthlyFinanceSummary data access operations

import { MonthlyFinanceSummary } from '../entities/MonthlyFinanceSummary';

export interface IMonthlyFinanceSummaryRepository {
  save(monthlyFinanceSummary: MonthlyFinanceSummary): Promise<MonthlyFinanceSummary>;
  findById(id: string): Promise<MonthlyFinanceSummary | null>;
  findAll(): Promise<MonthlyFinanceSummary[]>;
  findByUser(userId: string): Promise<MonthlyFinanceSummary[]>;
  findByMonth(month: string): Promise<MonthlyFinanceSummary[]>;
  findByUserAndMonth(userId: string, month: string): Promise<MonthlyFinanceSummary[]>;
  delete(id: string): Promise<boolean>;
  deleteAll(): Promise<void>;
  count(): Promise<number>;
}
