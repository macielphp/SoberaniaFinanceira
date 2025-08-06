import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Account, AccountType } from '../../clean-architecture/domain/entities/Account';
import { colors, spacing, typography } from '../../styles/themes';
import { AccountService } from '../../services/AccountService';

interface AccountCardProps {
  account: Account;
  currentBalance?: number;
  monthlyVariation?: number;
  lastTransaction?: string;
  creditLimit?: number;
  usageFrequency?: number;
  onEdit?: (account: Account) => void;
  onDelete?: (account: Account) => void;
  onPress?: (account: Account) => void;
  showActions?: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  currentBalance = 0,
  monthlyVariation = 0,
  lastTransaction,
  creditLimit,
  usageFrequency,
  onEdit,
  onDelete,
  onPress,
  showActions = true,
}) => {
  const getAccountIcon = (accountName: string, type: string) => {
    const name = accountName.toLowerCase();
    
    if (name.includes('carteira') || name.includes('física')) return 'wallet';
    if (name.includes('nubank')) return 'card';
    if (name.includes('santander')) return 'business';
    if (name.includes('itau') || name.includes('itaú')) return 'business';
    if (name.includes('bradesco')) return 'business';
    if (name.includes('bb') || name.includes('banco do brasil')) return 'business';
    if (name.includes('caixa')) return 'business';
    if (name.includes('inter')) return 'card';
    if (name.includes('poupança') || name.includes('poupanca')) return 'trending-up';
    if (name.includes('investimento')) return 'trending-up';
    if (name.includes('cartão') || name.includes('cartao')) return 'card';
    
    return type === 'propria' ? 'business' : 'card';
  };

  const getAccountColor = (accountName: string, type: AccountType) => {
    const name = accountName.toLowerCase();
    
    if (name.includes('nubank')) return '#8A05BE';
    if (name.includes('inter')) return '#FF7A00';
    if (name.includes('carteira') || name.includes('física')) return '#6C757D';
    if (name.includes('poupança') || name.includes('poupanca')) return '#28A745';
    if (name.includes('investimento')) return '#FFC107';
    if (name.includes('cartão') || name.includes('cartao')) return '#DC3545';
    
    // Map domain types to UI types
    const isPropria = type === 'corrente' || type === 'poupanca' || type === 'investimento' || type === 'dinheiro';
    return isPropria ? colors.primary[500] : colors.secondary[500];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatVariation = (variation: number) => {
    const formatted = formatCurrency(Math.abs(variation));
    return variation >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  // Helper function to check if account is "propria" (own account)
  const isPropriaAccount = (type: AccountType): boolean => {
    return type === 'corrente' || type === 'poupanca' || type === 'investimento' || type === 'dinheiro';
  };

  const accountColor = getAccountColor(account.name, account.type);
  const accountIcon = getAccountIcon(account.name, account.type);

  return (
    <TouchableOpacity 
      style={[styles.card, { borderLeftColor: accountColor }]} 
      onPress={() => onPress?.(account)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.accountInfo}>
          <View style={[styles.iconContainer, { backgroundColor: accountColor }]}>
            <Ionicons name={accountIcon as any} size={20} color="white" />
          </View>
          <View style={styles.accountDetails}>
            <Text style={styles.accountName}>{account.name}</Text>
            <View style={styles.accountMeta}>
                <View style={[styles.typeBadge, { backgroundColor: (account.type === 'corrente' || account.type === 'poupanca' || account.type === 'investimento' || account.type === 'dinheiro') ? colors.primary[50] : colors.secondary[50] }]}>
                <Text style={[styles.typeText, { color: (account.type === 'corrente' || account.type === 'poupanca' || account.type === 'investimento' || account.type === 'dinheiro') ? colors.primary[600] : colors.secondary[600] }]}>
                  {(account.type === 'corrente' || account.type === 'poupanca' || account.type === 'investimento' || account.type === 'dinheiro') ? 'Própria' : 'Externa'}
                </Text>
              </View>
              {account.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Padrão</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        {showActions && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity 
                testID="edit-button"
                style={styles.actionButton}
                onPress={() => onEdit(account)}
                disabled={account.isDefault && !isPropriaAccount(account.type)}
              >
                <Ionicons 
                  name="pencil" 
                  size={16} 
                  color={(account.isDefault && !isPropriaAccount(account.type)) ? colors.gray[400] : colors.primary[500]} 
                />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity 
                testID="delete-button"
                style={styles.actionButton}
                onPress={() => onDelete(account)}
                disabled={account.isDefault}
              >
                <Ionicons 
                  name="trash" 
                  size={16} 
                  color={account.isDefault ? colors.gray[400] : colors.error[500]} 
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {isPropriaAccount(account.type) && (
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Saldo Atual</Text>
          <Text style={[styles.balanceValue, { color: currentBalance >= 0 ? colors.success[600] : colors.error[600] }]}>
            {formatCurrency(currentBalance)}
          </Text>
          
          {monthlyVariation !== 0 && (
            <View style={styles.variationContainer}>
              <Ionicons 
                name={monthlyVariation >= 0 ? "trending-up" : "trending-down"} 
                size={14} 
                color={monthlyVariation >= 0 ? colors.success[500] : colors.error[500]} 
              />
              <Text style={[styles.variationText, { color: monthlyVariation >= 0 ? colors.success[600] : colors.error[600] }]}>
                {formatVariation(monthlyVariation)} este mês
              </Text>
            </View>
          )}
        </View>
      )}

             {!isPropriaAccount(account.type) && (
         <View style={styles.externalInfo}>
           <Text style={styles.externalText}>Conta externa</Text>
           {usageFrequency && (
             <Text style={styles.usageText}>
               Usada {usageFrequency}x este mês
             </Text>
           )}
         </View>
       )}

       {/* Informações adicionais para contas próprias */}
       {isPropriaAccount(account.type) && (
         <View style={styles.additionalInfo}>
           {lastTransaction && (
             <Text style={styles.lastTransactionText}>
               Última transação: {new Date(lastTransaction).toLocaleDateString('pt-BR')}
             </Text>
           )}
           
           {/* Limite de crédito para cartões */}
           {creditLimit && account.name.toLowerCase().includes('cartão') && (
             <View style={styles.creditLimitContainer}>
               <Text style={styles.creditLimitLabel}>Limite disponível:</Text>
               <Text style={styles.creditLimitValue}>
                 {AccountService.formatCurrency(creditLimit - Math.abs(currentBalance))}
               </Text>
             </View>
           )}
         </View>
       )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.default,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  accountMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  typeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  defaultBadge: {
    backgroundColor: colors.warning[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    color: colors.warning[600],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
  },
  balanceSection: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.sm,
  },
  balanceLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  balanceValue: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  variationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  variationText: {
    fontSize: typography.body2.fontSize,
    fontWeight: '500',
  },
  externalInfo: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.sm,
  },
  externalText: {
    fontSize: typography.body2.fontSize,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  usageText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  additionalInfo: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.sm,
  },
  lastTransactionText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  creditLimitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  creditLimitLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
  },
  creditLimitValue: {
    fontSize: typography.caption.fontSize,
    color: colors.success[600],
    fontWeight: '600',
  },
});

export default AccountCard; 