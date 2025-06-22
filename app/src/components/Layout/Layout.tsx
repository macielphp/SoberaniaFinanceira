import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.container}>
        {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 12,
    }
})

export default Layout

 