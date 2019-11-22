import React, { } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Modal, StyleSheet } from "react-native";
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import styles from '../components/styles/styles'

const { width, height } = Dimensions.get('window');
const QuitModal = (props) => {
    return (
        <Modal
            visible={props.visible}
            animationType="none"
            transparent={true}
            onRequestClose={props.onRequestClose}
        >
            <View style={[styles.profileContainer, { justifyContent: 'center' }]}>
                <TouchableOpacity onPress={props.answerModalClose} style={{ position: 'absolute', zIndex: 1, left: width - scaleWidth(34), alignSelf: 'center', bottom: scaleHeight(485) }}>
                </TouchableOpacity>
                <View style={[styles.answerModalView, { alignItems: 'center', justifyContent: 'center', height: scaleHeight(120),  }]}>
                    <Text style={{ fontSize: normalizeFont(20), fontWeight: '500', padding: 10, textAlign: "center" }}>{props.message}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', width: width-scaleWidth(40), marginVertical: scaleHeight(10)}}>
                        <TouchableOpacity style={customStyles.bttn} onPress={props.Yes}>
                            <Text style={{ fontSize: normalizeFont(18), color: '#fff', fontWeight: 'bold', textAlign: 'center', top: scaleHeight(2) }}>Yes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={customStyles.bttn} onPress={props.No}>
                            <Text style={{ fontSize: normalizeFont(18), color: '#fff', fontWeight: 'bold', textAlign: 'center', top: scaleHeight(2) }}>No</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal >
    )
}

export default QuitModal;

const customStyles = StyleSheet.create({
    bttn: {
        height: scaleHeight(40),
        width: width/6.5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D00E17',
        borderRadius: scaleWidth(7.5),
        // borderBottomWidth: 2,
        borderBottomColor: '#6E6E6E',
    }
})