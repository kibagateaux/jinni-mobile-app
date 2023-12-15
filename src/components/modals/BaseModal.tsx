import { useTheme } from 'contexts/ThemeContext';
import React, { useState, ReactNode } from 'react';
import { Text, Modal, View, TouchableOpacity, StyleSheet, Button } from 'react-native';

interface ModalProps {
    children: ReactNode;
    onClose?: () => void;
    primaryButton?: { title: string; onPress: () => void };
    secondaryButton?: { title: string; onPress: () => void };
}

const BaseModal: React.FC<ModalProps> = ({ children, onClose, primaryButton, secondaryButton }) => {
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

    const backgroundStyles = {
        backgroundColor: 'white',
        borderColor: 'pink',
        shadowColor: 'pink',
    };
    const textStyles = {
        color: theme.primaryTextColor,
        textShadowColor: 'pink',
    };

    return !visible ? null : (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={closeModal}
        >
            <View style={[styles.modalSize, styles.overlay, backgroundStyles]} />
            <View style={[styles.contentContainer, styles.modalSize]}>
                {children}
                <View>
                    <View style={styles.ctaContainer}>
                        {primaryButton && (
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    { backgroundColor: theme.primaryBackgroundColor },
                                ]}
                                onPress={primaryButton.onPress}
                            >
                                <Text style={[styles.text, textStyles]}>{primaryButton.title}</Text>
                            </TouchableOpacity>
                        )}
                        {secondaryButton && (
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: theme.secondaryColor }]}
                                onPress={secondaryButton.onPress}
                            >
                                <Text style={[styles.text, textStyles]}>
                                    {secondaryButton.title}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <Button title="Close" color="red" onPress={closeModal} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalSize: {
        top: '25%',
        left: '5%',
        right: '5%',
        bottom: '25%',
    },
    overlay: {
        // position: 'absolute',
        top: 0,
        left: 0,
        opacity: 1,
    },
    contentContainer: {
        position: 'absolute',
        borderRadius: 10,
        padding: 25,
        borderWidth: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
        flexDirection: 'column',
        justifyContent: 'space-between',
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
    loadingIndicator: {
        position: 'absolute',
        alignSelf: 'center',
    },
    // TODO background option. Giant white fluffy circle that fades into background. AI has been shit at making it
    // modal: {
    //     // position: 'relative',
    //     height: '100%',
    //     width: '100%',
    // },
    // overlay: {
    //     opacity: 0.8,
    //     position: 'absolute',
    //     top: 0,
    //     left: 0,
    //     height: 500,
    //     width: 500,
    //     borderRadius: 200,
    // },
    // contentContainer: {
    //     position: 'absolute',
    //     top: '25%',
    //     left: '5%',
    //     right: '5%',
    //     bottom: '25%',
    //     // borderRadius: 50,
    //     // borderWidth: 2,
    //     // shadowOffset: { width: 0, height: 2 },
    //     // shadowOpacity: 0.8,
    //     // shadowRadius: 50,
    //     elevation: 10,
    //     justifyContent: 'center',
    // },
    // text: {
    //     fontSize: 24,
    //     fontWeight: 'bold',
    //     textShadowOffset: { width: -1, height: 1 },
    //     textShadowRadius: 10,
    // },
    // buttonContainer: {
    //     flexDirection: 'row',
    //     justifyContent: 'space-between',
    //     marginTop: 20,
    // },
    // button: {
    //     padding: 10,
    //     borderRadius: 5,
    //     marginHorizontal: 5,
    // },
    // closeButton: {
    //     padding: 10,
    //     borderRadius: 5,
    //     marginTop: 20,
    // },
    // loadingIndicator: {
    //     position: 'absolute',
    //     alignSelf: 'center',
    // },
});

export default BaseModal;
