// Estilos globais existentes
import { StyleSheet } from 'react-native';

const GlobalStyles = StyleSheet.create({
  // Text
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 8,
      textAlign: 'center',
    },
    subTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#000000',
    },
    description: {
      fontSize: 14,
      color: '#666',
    },
  
  // PageContainer
    page: {
      backgroundColor: 'rgb(232, 232, 232)',
      color: '#00000',
      fontSize: 16,
    },

  // Operation value: text
    operationValue: {
      fontSize: 18,
      fontWeight: 'bold',
    },
  // Cards
    cardContainer: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      margin: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row', 
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    }

    
})

export default GlobalStyles;