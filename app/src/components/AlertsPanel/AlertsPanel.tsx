import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AccountAlert } from '../../services/AlertService';
import { colors, spacing, typography } from '../../styles/themes';

interface AlertsPanelProps {
  alerts: AccountAlert[];
  onViewAllAlerts?: () => void;
  onDismissAlert?: (alertId: string) => void;
  maxAlerts?: number;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onViewAllAlerts,
  onDismissAlert,
  maxAlerts = 3,
}) => {
  if (alerts.length === 0) {
    return null;
  }

  const displayedAlerts = alerts.slice(0, maxAlerts);
  const hasMoreAlerts = alerts.length > maxAlerts;

  const getAlertIcon = (alert: AccountAlert) => {
    switch (alert.type) {
      case 'low_balance':
        return 'warning';
      case 'negative_balance':
        return 'alert-circle';
      case 'credit_limit':
        return 'card';
      default:
        return 'information-circle';
    }
  };

  const getAlertColor = (alert: AccountAlert) => {
    return alert.severity === 'error' ? colors.error[500] : colors.warning[500];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Ionicons name="notifications" size={20} color={colors.warning[500]} />
          <Text style={styles.title}>Alertas</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{alerts.length}</Text>
          </View>
        </View>
        {onViewAllAlerts && hasMoreAlerts && (
          <TouchableOpacity onPress={onViewAllAlerts}>
            <Text style={styles.viewAllText}>Ver Todos</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.alertsList}>
        {displayedAlerts.map((alert, index) => (
          <View key={`${alert.accountId}-${alert.type}`} style={styles.alertItem}>
            <View style={styles.alertIcon}>
              <Ionicons 
                name={getAlertIcon(alert) as any} 
                size={16} 
                color={getAlertColor(alert)} 
              />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertMessage} numberOfLines={2}>
                {alert.message}
              </Text>
              <Text style={styles.alertAccount}>
                {alert.accountName}
              </Text>
            </View>
            {onDismissAlert && (
              <TouchableOpacity 
                style={styles.dismissButton}
                onPress={() => onDismissAlert(`${alert.accountId}-${alert.type}`)}
              >
                <Ionicons name="close" size={16} color={colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {hasMoreAlerts && onViewAllAlerts && (
        <TouchableOpacity style={styles.moreAlertsButton} onPress={onViewAllAlerts}>
          <Text style={styles.moreAlertsText}>
            Ver mais {alerts.length - maxAlerts} alerta{alerts.length - maxAlerts !== 1 ? 's' : ''}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary[500]} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.default,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  badge: {
    backgroundColor: colors.warning[500],
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  viewAllText: {
    fontSize: typography.body2.fontSize,
    color: colors.primary[500],
    fontWeight: '600',
  },
  alertsList: {
    gap: spacing.sm,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  alertIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: typography.body2.fontSize,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  alertAccount: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
  },
  dismissButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  moreAlertsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  moreAlertsText: {
    fontSize: typography.body2.fontSize,
    color: colors.primary[500],
    fontWeight: '600',
  },
});

export default AlertsPanel; 