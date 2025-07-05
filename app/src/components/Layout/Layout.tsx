import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalStyles from '../../styles/Styles'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={[GlobalStyles.page, styles.container]} edges={['top', 'bottom', 'left', 'right']}>
        {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})

export default Layout

 