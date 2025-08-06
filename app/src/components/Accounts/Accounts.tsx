import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useAccountViewModelAdapter } from '../../clean-architecture/presentation/ui-adapters/useAccountViewModelAdapter';
import AccountCard from '../AccountCard/index';
import { Loading } from '../Loading/index';
import { ErrorMessage } from '../ErrorMessage/index';

export function Accounts() {
  const { accounts, loading, error, deleteAccount } = useAccountViewModelAdapter();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AccountCard
            account={item}
            onDelete={() => deleteAccount(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
