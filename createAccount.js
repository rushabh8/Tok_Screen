import React, { Component } from 'react';
import {
    Keyboard, Text, View, Dimensions, AsyncStorage, ImageBackground, Platform, ScrollView, Image, TextInput, TouchableOpacity, DatePickerAndroid, TouchableHighlight, KeyboardAvoidingView
} from 'react-native';

import CountryModal from './countryModal'
import StateModal from './stateModal'
import countries from '../Json/country'
import states from '../Json/state'
import styles from '../components/styles/styles'
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import { MusicFunc } from '../components/common/SoundFunc';
import webservice from '../webService/Api';
import Loader from './loader'
import Alert from './clubAlert'
import { validateFirstName, validateEmail, validatePassword, validateAge } from './validation'

const { width } = Dimensions.get('window');

export default class CreateAccount extends Component {
    disabled = false
    constructor(props) {
        super(props);
        this.state = {
            closeAlert: false,
            message: '',
            countries: countries,
            states: states,
            name: '',
            email: "",
            password: "",
            emailCheck: "",
            passwordCheck: "",
            check: false,
            age: '',
            countryModal: false,
            stateModal: false,
            alertMessage: '',
            selectedCntry: 'Select Country',
            selectedState: 'Select State',
            isLoading: false
        }
    }
    getEmail(text) {
        this.setState({
            email: text,
        })
    }
    getName(text) {
        this.setState({
            name: text,
        })
    }
    getPassword(text) {
        this.setState({
            password: text,
        })
    }
    getAge(text) {
        this.setState({
            age: text
        })
    }
    stateModalOpen = (visible) => {
        Keyboard.dismiss()
        this.setState({ stateModal: !visible });
    }
    stateModalClose = (visible) => {
        this.setState({ stateModal: false, states: states })
    }

    selectState(item) {
        Keyboard.dismiss()
        this.setState({ stateModal: !this.state.stateModal, selectedState: item, states: states })
    }
    countryModalOpen = (visible) => {
        Keyboard.dismiss()
        this.setState({ countryModal: !visible });
    }
    countryModalClose = (visible) => {
        this.setState({ countryModal: false, countries: countries })
    }

    selectCountry(item) {
        Keyboard.dismiss()
        this.setState({ countryModal: !this.state.countryModal, selectedCntry: item, countries: countries })
    }

    componentWillMount() {
        AsyncStorage.clear()
    }

    create() {
        MusicFunc('Button_Click_Music')
        if (this.disabled) return;
        this.disabled = true;
        setTimeout(() => {
            this.disabled = false;
        }, 500);

        if (validateFirstName(this.state.name).status) {
            if (validateEmail(this.state.email).status) {
                if (validatePassword(this.state.password).status) {
                    if (this.state.age != "") {
                        if (validateAge(this.state.age).status) {
                            this._register()
                        }
                        else {
                            this.setState({ closeAlert: true, message: validateAge(this.state.age).error })
                        }
                    }
                    else {
                        this._register()
                    }
                }
                else {
                    this.setState({ closeAlert: true, message: validatePassword(this.state.password).error })
                }
            }
            else {
                this.setState({ closeAlert: true, message: validateEmail(this.state.email).error })
            }
        }
        else {
            this.setState({ closeAlert: true, message: validateFirstName(this.state.name).error })
        }
    }


    _register() {
        this.setState({ isLoading: true })
        let variables = {
            "name": this.state.name.trim(),
            "email": this.state.email.trim(),
            "age": this.state.age.trim(),
            "password": this.state.password.trim(),
            "gender": "female",
            "country": this.state.selectedCntry,
            "state": this.state.selectState,
        }
        return webservice(variables, "users/signup", "POST")
            .then(resp => {
                this.setState({ isLoading: false })
                if (resp.data.responseCode === 200) {
                    this.setState({ closeAlert: this._onPressRegister(), message: resp.data.responseMessage })
                } else if (resp.data.responseCode === 400) {
                    this.setState({ closeAlert: true, message: resp.data.responseMessage })
                } else {
                    alert('error')
                }
            })
    }

    _onPressRegister() {
        this.props.navigation.navigate('Login')
    }


    filter(text) {
        const Content = this.state.countries
        let result = []
        for (var i = 0; i < Content.length; i++) {
            if (Content[i].country.toLowerCase().indexOf(text.toLowerCase()) != -1) {
                result.push(Content[i])
                this.setState({ countries: result })
            }
        }
    }
    stateFilter(text) {
        const Content = this.state.states
        let result = []
        for (var i = 0; i < Content.length; i++) {
            if (Content[i].state.toLowerCase().indexOf(text.toLowerCase()) != -1) {
                result.push(Content[i])
                this.setState({ states: result })
            }
        }
    }
    render() {

        return (
            <ImageBackground source={require('../image/Invite_friend/bg.png')} style={{ flex: 1 }} >
                <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" >
                    <Loader
                        visible={this.state.isLoading}
                    />
                    <ScrollView keyboardShouldPersistTaps='handled' style={[styles.commonContainer, { paddingTop: 40 }]}>
                        <View>
                            <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 20 }}>
                                <Image resizeMode="stretch" source={require('../image/Reset_Password/logo.png')} />
                            </View>
                        </View>
                        <View style={{ marginHorizontal: 30, }}>
                            <View style={[styles.email, { marginBottom: Platform.OS === 'ios' ? 20 : 25, }]}>
                                <Image source={require('../image/create/user.png')} style={{ marginLeft: 10 }} />
                                <TextInput allowFontScaling={false}
                                    autoCapitalize='none'
                                    maxLength={30}
                                    value={this.state.name}
                                    onChangeText={this.getName.bind(this)}
                                    placeholderTextColor="gray"
                                    underlineColorAndroid="transparent"
                                    style={{ width: width - 80, fontSize: normalizeFont(16), color: "black", height: scaleHeight(48), fontWeight: '200', left: scaleWidth(10), paddingRight: scaleWidth(10) }}
                                    placeholder="Name"
                                    onSubmitEditing={() => this.email.focus()}
                                    returnKeyType='next'
                                />
                                <Image source={require('../image/create/star.png')} style={{}} />
                            </View>
                            <View style={[styles.email, { marginBottom: Platform.OS === 'ios' ? 20 : 25, }]}>
                                <Image source={require('../image/create/user.png')} style={{ marginLeft: 10 }} />
                                <TextInput allowFontScaling={false}
                                    maxLength={50}
                                    autoCapitalize='none'
                                    value={this.state.email}
                                    onChangeText={this.getEmail.bind(this)}
                                    placeholderTextColor="gray"
                                    underlineColorAndroid="transparent"
                                    style={{ width: width - 80, fontSize: normalizeFont(16), color: "black", height: scaleHeight(48), fontWeight: '200', left: 10, paddingRight: scaleWidth(20) }}
                                    placeholder="Email Address"
                                    keyboardType='email-address'
                                    onSubmitEditing={() => this.password.focus()}
                                    ref={(email) => this.email = email}
                                    returnKeyType='next'
                                />
                                <Image source={require('../image/create/star.png')} style={{}} />
                            </View>
                            <View style={[styles.email, { marginBottom: Platform.OS === 'ios' ? 20 : 25, }]}>
                                <Image source={require('../image/create/password.png')} style={{ marginLeft: 10 }} />
                                <TextInput allowFontScaling={false}
                                    maxLength={15}
                                    value={this.state.password}
                                    onChangeText={this.getPassword.bind(this)}
                                    placeholderTextColor="gray"
                                    secureTextEntry
                                    underlineColorAndroid="transparent"
                                    style={{ width: width - 80, fontSize: normalizeFont(16), color: "black", height: scaleHeight(48), fontWeight: '200', left: 10, paddingRight: scaleWidth(10) }}
                                    placeholder="Password"
                                    onSubmitEditing={() => this.age.focus()}
                                    returnKeyType='next'
                                    ref={(password) => this.password = password}
                                />
                                <Image source={require('../image/create/star.png')} style={{}} />
                            </View>
                            <View style={[styles.email, { marginBottom: Platform.OS === 'ios' ? 20 : 25, }]}>
                                <Image source={require('../image/create/clander.png')} style={{ marginLeft: 10 }} />
                                <TextInput allowFontScaling={false}
                                    value={this.state.age}
                                    onChangeText={this.getAge.bind(this)}
                                    placeholderTextColor="gray"
                                    underlineColorAndroid="transparent"
                                    style={{ width: width - 80, fontSize: normalizeFont(16), color: "black", height: scaleHeight(48), fontWeight: '200', left: 10, paddingRight: scaleWidth(10) }}
                                    placeholder="Age"
                                    keyboardType='numeric'
                                    returnKeyType='next'
                                    maxLength={2}
                                    ref={(age) => this.age = age}
                                />
                            </View>
                            <TouchableOpacity onPress={() => { this.countryModalOpen() }}
                                style={{
                                    borderWidth: 1,
                                    borderRadius: 5,
                                    borderColor: "red",
                                    height: scaleHeight(40),
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    flexDirection: 'row',
                                    backgroundColor: '#EEEEEE', marginBottom: Platform.OS === 'ios' ? 20 : 25,
                                }} >
                                <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 }}>
                                    <Image source={require('../image/create/earth.png')} style={{}} />
                                    <Text style={{ color: 'gray', left: 10 }}>{this.state.selectedCntry}</Text>
                                </View>
                                <Image source={require('../image/create/down.png')} style={{ marginRight: 10 }} />
                            </TouchableOpacity>
                            {this.state.selectedCntry == 'India' ?
                                <TouchableOpacity onPress={() => { this.stateModalOpen() }}
                                    style={{
                                        borderWidth: 1,
                                        borderRadius: 5,
                                        borderColor: "red",
                                        height: scaleHeight(40),
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        flexDirection: 'row',
                                        backgroundColor: '#EEEEEE', marginBottom: Platform.OS === 'ios' ? 20 : 25,
                                    }}>
                                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 }}>
                                        <Image source={require('../image/create/earth.png')} style={{}} />
                                        <Text style={{ color: 'gray', left: 10 }}>{this.state.selectedState}</Text>
                                    </View>
                                    <Image source={require('../image/create/down.png')} style={{ marginRight: 10 }} />
                                </TouchableOpacity> : null}
                            {this.state.countryModal ?
                                <CountryModal
                                    onChangeText={(text) => this.filter(text)}
                                    countries={this.state.countries}
                                    placeholder="Search Country"
                                    onRequestClose={() => { this.countryModalOpen(!this.state.countryModal) }}
                                    visible={this.state.countryModal}
                                    alertMessage={this.state.alertMessage}
                                    cancelButton={() => this.setState({ countryModal: false })}
                                    countryModalClose={() => this.countryModalClose(this.state.countryModal)}
                                    renderItem={({ item }) =>
                                        <View style={{
                                            backgroundColor: '#FFFFFF',
                                            borderWidth: 0.5, borderColor: 'red', width: '100%'
                                        }}>
                                            <TouchableOpacity onPress={() => this.selectCountry(item.country)}>
                                                <Text style={{ color: "black", fontSize: 19, marginLeft: scaleWidth(5), marginVertical: scaleHeight(5) }}>{item.country}</Text>
                                            </TouchableOpacity>
                                        </View>}
                                /> : null}
                            {this.state.stateModal ?
                                <StateModal
                                    onChangeText={(text) => this.stateFilter(text)}
                                    states={this.state.states}
                                    onRequestClose={() => { this.stateModalOpen(!this.state.stateModal) }}
                                    visible={this.state.stateModal}
                                    alertMessage={this.state.alertMessage}
                                    cancelButton={() => this.setState({ stateModal: false })}
                                    stateModalClose={() => this.stateModalClose(this.state.stateModal)}
                                    renderItem={({ item }) =>
                                        <View style={{
                                            backgroundColor: '#FFFFFF',
                                            borderWidth: 0.5, borderColor: 'red', width: '100%'
                                        }}>
                                            <TouchableOpacity onPress={() => this.selectState(item.state)}>
                                                <Text style={{ color: "black", fontSize: 19, marginLeft: scaleWidth(5), marginVertical: scaleHeight(5) }}>{item.state}</Text>
                                            </TouchableOpacity>
                                        </View>}
                                /> : null}
                            <View style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: scaleHeight(50) }}>
                                <TouchableOpacity onPress={() => this.create()} style={{ marginVertical: scaleHeight(15), backgroundColor: "#B71C1C", borderRadius: 10 }} >
                                    <Text style={{ paddingHorizontal: scaleWidth(20), paddingVertical: scaleHeight(10), color: 'white', fontWeight: '600', fontSize: normalizeFont(17) }}>Create</Text>
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