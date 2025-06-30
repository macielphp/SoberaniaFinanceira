import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    menuButton: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    disabled: {
      opacity: 0.6,
      backgroundColor: '#f9f9f9',
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    buttonTextContainer: {
      flex: 1,
      marginLeft: 16,
    },
    buttonTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
      marginBottom: 4,
    },
    buttonDescription: {
      fontSize: 14,
      color: '#666',
    },
    disabledText: {
      color: '#999',
    },
    badge: {
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 8,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: 'white',
    },
  });

export default styles;