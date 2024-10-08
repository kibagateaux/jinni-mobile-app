import { useTheme } from 'contexts/ThemeContext';
import React, { useState, ReactNode } from 'react';
import { Text, Modal, View, TouchableOpacity, StyleSheet, Button } from 'react-native';

interface ModalProps {
    children: React.JSX.Element;
    onClose?: (data?: unknown) => void;
    backgroundColor?: string;
    primaryButton?: { button?: ReactNode; title?: string; onPress?: () => void };
    secondaryButton?: { button?: ReactNode; title?: string; onPress?: () => void };
}

// TODO would be nice to attach this to a provider.context so any component can call { setModal, renderModal } = useModal
const BaseModal: React.FC<ModalProps> = ({
    children,
    onClose,
    backgroundColor = 'pink',
    primaryButton,
    secondaryButton,
}) => {
    const [visible, setVisible] = useState(true);
    const theme = useTheme();

    const closeModal = () => {
        setVisible(false);
        onClose && onClose();
    };

    const textStyles = {
        color: theme.primaryTextColor,
    };
    const renderButton = (config, color) => {
        console.log('base modal button', config);

        if (!config) return null;
        if (config.button) return config.button;
        if (config.title && config.onPress)
            return (
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: color }]}
                    onPress={config.onPress}
                >
                    <Text style={[styles.text, textStyles]}>{config.title}</Text>
                </TouchableOpacity>
            );
    };
    return !visible ? null : (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={closeModal}
            style={{ backgroundColor }}
        >
            <View style={[styles.contentContainer, { backgroundColor }, styles.modalSize]}>
                {children}
                <View>
                    <View style={styles.ctaContainer}>
                        {renderButton(primaryButton, theme.primaryBackgroundColor)}
                        {secondaryButton &&
                            renderButton(secondaryButton, theme.secondaryBackgroundColor)}
                    </View>
                    <Button title="Close" color="purple" onPress={closeModal} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalSize: {
        top: '8%',
        left: '10%',
        right: '10%',
        bottom: '10%',
        // shadowColor: '#FFC1CB',
        // shadowOffset: { width: 5, height: 10 },
        // shadowOpacity: 1,
        // shadowRadius: 10,
    },
    contentContainer: {
        backgroundColor: 'white',
        position: 'absolute',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 25,
        borderWidth: 2,
        borderRadius: 10,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    ctaContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    closeButton: {
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
    },
});

export default BaseModal;
