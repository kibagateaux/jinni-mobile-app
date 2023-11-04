import { useTheme } from 'contexts/ThemeContext';
import React, { useState, ReactNode } from 'react';
import { Text, Modal, View, TouchableOpacity, StyleSheet, Button } from 'react-native';

interface ModalProps {
    size: 'lg' | 'md' | 'sm';
    children: ReactNode;
    onClose?: () => void;
    onPrimaryButton?: () => void;
    onSecondaryButton?: () => void;
}

const BaseModal: React.FC<ModalProps> = ({
    children,
    size,
    onClose,
    onPrimaryButton,
    onSecondaryButton,
}) => {
    const [visible, setVisible] = useState(true);
    const theme = useTheme();

    // const { height, width } = Dimensions.get('window');
    // const modalStyle = {
    //   ...styles.modal,
    //   height: size === 'lg' ? height : size === 'md' ? height * 0.6 : 'auto',
    //   width: size === 'lg' ? width : size === 'md' ? width * 0.8 : 'auto',
    // };

    const closeModal = () => {
        setVisible(false);
        onClose && onClose();
    };

    return !visible ? null : (
        <View
            style={[
                styles.overlay,
                styles[size],
                { backgroundColor: theme.primaryBackgroundColor },
            ]}
        >
            <Modal
                animationType="fade"
                transparent={true}
                visible={visible}
                onRequestClose={closeModal}
            >
                <View style={styles.modal}>
                    {children}
                    <View style={styles.buttons}>
                        {onPrimaryButton && (
                            <TouchableOpacity style={styles.button} onPress={onPrimaryButton}>
                                <Text>Primary</Text>
                            </TouchableOpacity>
                        )}
                        {onSecondaryButton && (
                            <TouchableOpacity style={styles.button} onPress={onSecondaryButton}>
                                <Text>Secondary</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <Button title="Close" color="purple" onPress={closeModal} />
                    {/* // <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    //     <Text style={styles.close}>Close</Text>
                    // </TouchableOpacity> */}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    lg: {},
    md: {},
    sm: {},
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        backgroundColor: 'gold',
        padding: 10,
        borderRadius: 5,
    },
    closeButton: {
        color: 'white',
        backgroundColor: 'purple',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
    },
});

export default BaseModal;
