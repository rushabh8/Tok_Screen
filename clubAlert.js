import React, { } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, Modal, ImageBackground } from "react-native";
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import styles from '../components/styles/styles'

const { height } = Dimensions.get('window');
const button = require('../image/Btn/btn.png')

const Alert = (props) => {
    return (
        <Modal
            visible={props.visible}
            animationType="none"
            transparent={true}
            onRequestClose={props.onRequestClose}
        >
            <View style={[styles.alertContainer]}>
            <TouchableOpacity onPress={props.cancelButton}
                    style={{ position: 'absolute', zIndex: 1, right: scaleWidth(10), alignSelf: 'center', top: height/3 }}>
                    <Image resizeMode="stretch" source={require('../image/Cross/cross.png')} />
                </TouchableOpacity>
                <View style={[styles.alertView, {top: (height/3) + 10}]}>
                    <View style={{ paddingVertical:scaleHeight(25) ,paddingHorizontal:scaleWidth(25) }}>
                        <Text style={styles.alertMessageText} numberOfLines={4}>{props.alertMessage}</Text>
                        <Text style={styles.alertMessageText} numberOfLines={4}>{props.alertMessage1}</Text>
                    </View>

                    <TouchableOpacity onPress={props.cancelButton}>
                        <ImageBackground source={button} style={styles.clubButton} resizeMode="stretch" >
                            <Text style={{ color: 'white', fontWeight: '600', fontSize: normalizeFont(20), paddingVertical: 10 }}>{props.buttonTitle}</Text>
                        </ImageBackground>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal >
    )
}


export default Alert;