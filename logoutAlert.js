import React from 'react';
import { View, Text, Image, TouchableOpacity, Modal } from "react-native";
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import styles from '../components/styles/styles'

const Alert = (props) => {
    return (
        <Modal
            visible={props.visible}
            animationType="fade"
            transparent={true}
            onRequestClose={props.onRequestClose}
        >
            <View style={styles.logoutContainer}>
                <TouchableOpacity onPress={props.cancelButton}
                    style={{ position: 'absolute', zIndex: 1, right: scaleWidth(15), alignSelf: 'center', top: scaleHeight(250) }}>
                    <Image resizeMode="stretch" source={require('../image/Cross/cross.png')} />
                </TouchableOpacity>
                <View style={styles.alertView}>
                    <View style={{ paddingVertical: 25, }}>
                        <Text style={styles.alertMessageText} numberOfLines={4}>{props.alertMessage}</Text>
                    </View>
                    <View style={styles.alertBtn}>
                        <TouchableOpacity style={styles.logoutButton} onPress={props.okButton}>
                            <Text style={{ color: 'white', fontWeight: '600', fontSize: normalizeFont(20) }}>Yes{props.yesAction}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.logoutButton} onPress={props.cancelButton} >
                            <Text style={{ color: 'white', fontWeight: '600', fontSize: normalizeFont(20) }}>No</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal >
    )
}

export default Alert;