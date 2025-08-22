import { Alert } from '../../domain/entities/Alert';
import { AlertDTO } from '../dto/AlertDTO';
import { Money } from '../../shared/utils/Money';

export class AlertMapper {
  static toDomain(dto: AlertDTO): Alert {
    return new Alert({
      id: dto.id,
      accountId: dto.account_id,
      accountName: dto.account_name,
      type: dto.type,
      message: dto.message,
      severity: dto.severity,
      value: dto.value < 0 ? Money.fromNegativeValue(dto.value, 'BRL') : new Money(dto.value, 'BRL'),
      threshold: new Money(dto.threshold, 'BRL'),
      isDismissed: Boolean(dto.is_dismissed),
      createdAt: new Date(dto.created_at),
      dismissedAt: dto.dismissed_at ? new Date(dto.dismissed_at) : undefined
    });
  }

  static toDTO(alert: Alert): AlertDTO {
    return {
      id: alert.id,
      account_id: alert.accountId,
      account_name: alert.accountName,
      type: alert.type,
      message: alert.message,
      severity: alert.severity,
      value: alert.value.value,
      threshold: alert.threshold.value,
      is_dismissed: alert.isDismissed ? 1 : 0,
      created_at: alert.createdAt.toISOString(),
      dismissed_at: alert.dismissedAt ? alert.dismissedAt.toISOString() : null
    };
  }

  static toDomainList(dtos: AlertDTO[]): Alert[] {
    return dtos.map(dto => this.toDomain(dto));
  }
}
