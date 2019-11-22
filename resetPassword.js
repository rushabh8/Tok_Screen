
import React, { Component } from 'react';
import { KeyboardAvoidingView, Text, View, Dimensions, AsyncStorage, ImageBackground, ScrollView, Image, TextInput, TouchableOpacity } from 'react-native';
import styles from '../components/styles/styles'
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import { MusicFunc } from '../components/common/SoundFunc';
import webservice from '../webService/Api';
import Loader from './loader';
import { validatePassword } from './validation'
import Alert from './clubAlert'

const { width, height } = Dimensions.get('window');

export default class ResetPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            closeAlert: false,
            message: '',
            email: "",
            oldPassword: "",
            newPassword: '',
            confirmPassword: '',
            emailCheck: "",
            passwordCheck: "",
            check: false,
            isLoading: false,
            password: ''
        }
    }
    componentDidMount() {
        AsyncStorage.getItem('email')
            .then((res) => {
                let email = JSON.parse(res)
                this.setState({ email: email })
            })
    }

    getOldPassword(text) {
        this.setState({ oldPassword: text })
    }
    getNewPassword(text) {
        this.setState({ newPassword: text })
    }

    reset() {
        if (validatePassword(this.state.oldPassword).status) {
        }
        else {
            this.setState({ closeAlert: true, message: validatePassword(this.state.password).error })
        }

        this.setState({ isLoading: true })
        if (this.state.newPassword == this.state.confirmPassword) {
            let variables = {
                "email": this.state.email,
                "oldPassword": this.state.oldPassword,
                "newPassword": this.state.newPassword
            }
            return webservice(variables, "users/resetPassword", "POST")
                .then(resp => {
                    this.setState({ isLoading: false })
                    if (resp.data.responseCode === 200) {
                        this.setState({ closeAlert: this.props.navigation.navigate('EditProfile'), message: resp.data.responseMessage })
                    }
                    else if (resp.data.responseCode === 400) {
                        this.setState({ closeAlert: true, message: resp.data.responseMessage })
                    }
                    else if (resp.data.responseCode === 1000) {
                        this.setState({ isLoading: false }, () => alert(resp.data.responseMessage))
                    }
                })
        } else {
            this.setState({ closeAlert: true, message: 'Please enter correct password' })
        }

    }
    render() {
        return (
            <ImageBackground source={require('../image/Invite_friend/bg.png')} style={{ flex: 1 }} >
                <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                    <Loader visible={this.state.isLoading} />
                    <ScrollView keyboardShouldPersistTaps='always' style={[styles.commonContainer, { top: scaleHeight(60) }]}>
                        <View>
                            <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: scaleHeight(20) }}>
                                <Image resizeMode="stretch" source={require('../image/Reset_Password/logo.png')} />
                            </View>
                        </View>
                        <View style={{ marginHorizontal: scaleWidth(30), }}>
                            <View style={{ marginBottom: scaleHeight(10), alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ backgroundColor: "transparent", color: "#EF353E", fontWeight: "bold", fontSize: normalizeFont(22) }}>Reset your password?</Text>
                            </View>
                            <View style={{ marginBottom: scaleHeight(10), alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ backgroundColor: "transparent", color: "black", fontWeight: "bold", fontSize: normalizeFont(19), textAlign: 'center' }}>Your password must include atleast one symbol and be 8 or more characters long.</Text>
                            </View>

                            <View style={styles.email}>
                                <Image source={require('../image/create/password.png')} style={{ tintColor: 'gray', marginLeft: scaleWidth(10) }} />
                                <TextInput
                                    maxLength={15}
                                    value={this.state.oldPassword}
                                    onChangeText={(text) => this.getOldPassword(text)}
                                    placeholderTextColor="gray"
                                    underlineColorAndroid="transparent"
                                    style={{ width: width - 80, fontSize: normalizeFont(16), color: "black", height: scaleHeight(48), fontWeight: '200', marginLeft: 5 }}
                                    placeholder="Old Password"
                                    secureTextEntry={true}
                                />
                            </View>

                            <View style={[styles.email, { marginTop: 15 }]}>
                                <Image source={require('../image/create/password.png')} style={{ tintColor: 'gray', marginLeft: scaleWidth(10) }} />
                                <TextInput
                                    maxLength={15}
                                    value={this.state.newPassword}
                                    onChangeText={(text) => this.getNewPassword(text)}
                                    placeholderTextColor="gray"
                                    underlineColorAndroid="transparent"
                                    style={{ width: width - 80, fontSize: normalizeFont(16), color: "black", height: scaleHeight(48), fontWeight: '200', marginLeft: scaleWidth(5) }}
                                    placeholder="New Password"
                                    secureTextEntry={true}
                                />
                            </View>
                            <Text style={{ backgroundColor: "transparent", color: "#FB426B", alignSelf: "flex-start" }}>{this.state.passwordCheck}</Text>
                            <View style={styles.email}>
                                <Image source={require('../image/create/password.png')} style={{ tintColor: 'gray', marginLeft: scaleWidth(10) }} />
                                <TextInput
                                    maxLength={15}
                                    value={this.state.confirmPassword}
                                    onChangeText={(text) => this.setState({ confirmPassword: text })}
                                    placeholderTextColor="gray"
                                    underlineColorAndroid="transparent"
                                    style={{ width: width - 80, fontSize: normalizeFont(16), color: "black", height: scaleHeight(48), fontWeight: '200', marginLeft: scaleWidth(5) }}
                                    placeholder="Confirm Password"
                                    secureTextEntry={true}
                                />
                            </View>
                            <Text style={{ backgroundColor: "transparent", color: "#FB426B", alignSelf: "flex-start" }}>{this.state.passwordCheck}</Text>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <TouchableOpacity onPress={() => { this.reset(), MusicFunc('Button_Click_Music') }} style={{ marginVertical: scaleHeight(10), }} >
                                    {/* <Image source={require('../image/welcome/Btn1.png')} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                    <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: scaleHeight(10), color: 'white', fontWeight: '600', fontSize: normalizeFont(17) }}>Reset</Text> */}
                                    <ImageBackground
                                        source={require('../image/welcome/btn2.png')}
                                        style={{ width: scaleWidth(250), height: scaleHeight(40), justifyContent: 'center', alignItems: 'center' }}
                                        resizeMode='stretch'
                                    >
                                        <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: scaleHeight(8), color: 'white', fontWeight: '800', fontSize: normalizeFont(17) }}>Reset</Text>
                                    </ImageBackground>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                    <Alert
                        onRequestClose={() => { this.setState({ closeAlert: false }) }}
                        visible={this.state.closeAlert}
                        alertMessage={this.state.message}
                        cancelButton={() => { this.setState({ closeAlert: false }) }}
                        buttonTitle='OK'
                    />
                </KeyboardAvoidingView>
            </ImageBackground>
        )
    }
}