import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Layout from './../../components/Layout/Layout';
import { colors, spacing, typography } from '../../styles/themes';
import { clearAllData } from '../../database';
import { useFinance } from '../../contexts/FinanceContext';

function Settings() {
  const [isClearing, setIsClearing] = useState(false);
  const { refreshAllData } = useFinance();

  const handleClearDatabase = () => {
    Alert.alert(
      'Limpar Dados',
      'Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Apagar Tudo',
          style: 'destructive',
                      onPress: async () => {
              setIsClearing(true);
              try {
                await clearAllData();
                // Forçar refresh completo da aplicação
                await refreshAllData();
                Alert.alert('Sucesso', 'Todos os dados foram apagados e os dados padrão foram restaurados!');
              } catch (error) {
                Alert.alert('Erro', 'Erro ao apagar dados: ' + error);
              } finally {
                setIsClearing(false);
              }
            },
        },
      ]
    );
  };

  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.title}>Configurações</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados</Text>
          
          <TouchableOpacity 
            style={styles.dangerButton}
            onPress={handleClearDatabase}
            disabled={isClearing}
          >
            <Ionicons name="trash-outline" size={20} color={colors.text.inverse} />
                      <Text style={styles.dangerButtonText}>
            {isClearing ? 'Apagando e Recarregando...' : 'Limpar Todos os Dados'}
          </Text>
          </TouchableOpacity>
          
          <Text style={styles.warningText}>
            ⚠️ Esta ação apagará todas as operações, contas, categorias e metas.
          </Text>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  dangerButton: {
    backgroundColor: colors.error[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  dangerButtonText: {
    color: colors.text.inverse,
    fontSize: typography.body1.fontSize,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  warningText: {
    fontSize: typography.caption.fontSize,
    color: colors.warning[500],
    fontStyle: 'italic',
  },
});

export default Settings;