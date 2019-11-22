import React, { } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions, Modal, Platform, FlatList, Image } from "react-native";
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
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
            <View style={styles.profileContainer}>
            <ScrollView >
                <TouchableOpacity onPress={props.countryModalClose}
                    style={{ position: 'absolute', zIndex: 1, right: scaleWidth(15), alignSelf: 'center', top: scaleHeight(35) }}>
                    <Image resizeMode="center" source={require('../image/create/cross.png')} style={{ tintColor: 'white', }} />
                </TouchableOpacity>
                <View style={{
                    width: '95%', borderRadius: 10, alignSelf: 'center',
                    backgroundColor: '#D00E17',
                    height: scaleHeight(30),
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexDirection: 'row', top: scaleHeight(80)
                }}>

                    <TextInput allowFontScaling={false}
                        maxLength={100}
                        placeholderTextColor="white"
                        onChangeText={props.onChangeText}
                        underlineColorAndroid="transparent"
                        style={styles.homeSearchText}
                        placeholder={props.placeholder}
                        returnKeyType='search'
                        onSubmitEditing={props.Seach}
                        autoFocus={true}
                    />
                    <View style={{ flex: 0.3 }}>
                        <Image source={require('../image/create/search.png')} style={{ marginRight: 25 }} />
                    </View>
                </View>
                {/* <ScrollView keyboardShouldPersistsTaps="handled"> */}
                <View style={{
                    marginVertical: scaleHeight(90),
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: 'transparent',
                    marginHorizontal: scaleWidth(20),
                    borderRadius: 2
                }}>
                    <FlatList
                        keyExtractor={(item, index) => index.toString()}
                        style={{ width: '100%' }}
                        data={props.countries}
                        renderItem={props.renderItem}
                    />

                </View>
                </ScrollView>
            </View>
        </Modal >
    )
}


export default Alert;