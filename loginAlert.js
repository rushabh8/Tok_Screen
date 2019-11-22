import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Dimensions, Modal } from "react-native";
import { scaleHeight, normalizeFont } from '../components/common/Responsive';
import styles from '../components/styles/styles'
const { width, height } = Dimensions.get('window');

const Alert = (props) => {
    return (
        <Modal
            visible={props.visible}
            animationType="none"
            transparent={true}
            onRequestClose={props.onRequestClose}
        >
            <View style={styles.alertContainer}>
                <View style={styles.alertView}>
                    <View style={{ paddingVertical: 25, }}>
                        <Text style={styles.alertMessageText} numberOfLines={4}>{props.alertMessage}</Text>
                        <TextInput allowFontScaling={false}
                            maxLength={15}
                            placeholderTextColor="gray"
                            underlineColorAndroid="transparent"
                            style={{ marginVertical: 10, width: width - 80, fontSize: normalizeFont(16), color: "gray", height: scaleHeight(48), fontWeight: '200', marginLeft: 5, borderColor: 'red', borderWidth: 0.5 }}
                            placeholder="Enter Email"
                            autoFocus={true}
                        />
                    </View>
                    <TouchableOpacity onPress={props.cancelButton}
                        style={styles.ok}  >
                        <Text style={{ color: 'white', fontWeight: '600', fontSize: normalizeFont(20), padding: 10 }}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal >
    )
}

export default Alert;