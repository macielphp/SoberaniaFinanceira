import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlobalStyles from '../../styles/Styles';
import colors from '../../styles/themes/colors';

interface AppModalProps {
    visible: boolean;
    onRequestClose: () => void;
    title?: string | React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    showCloseButton?: boolean;
    scrollContent?: boolean;
}

const AppModal: React.FC<AppModalProps> = ({
    visible,
    onRequestClose,
    title,
    children,
    footer,
    showCloseButton = true,
    scrollContent = false,
}) => {
    return (
        <Modal 
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onRequestClose}
        >
            <View style={GlobalStyles.modalOverlay}>
                <View style={GlobalStyles.modalContent}>
                    {/* Header */}
                    <View style={GlobalStyles.modalHeader}>
                        {typeof title === 'string' ? (<Text style={GlobalStyles.modalTitle}>{title}</Text>) : (
                            title
                        )}
                        {showCloseButton && (
                            <TouchableOpacity style={GlobalStyles.modalCloseButton} onPress={onRequestClose}>
                                <Ionicons name="close" size={24} color={colors.text.primary} />
                            </TouchableOpacity>
                        )}
                    </View>
                    {/* Content */}
                    {scrollContent ? (
                        <ScrollView>{children}</ScrollView>
                    ) : (
                        <View style={GlobalStyles.modalBody}>{children}</View>
                    )}
                    {/* footer */}
                    {footer && <View style={GlobalStyles.modalFooter}>{footer}</View>}
                </View>

            </View>
        </Modal>
    )
}

export default AppModal;