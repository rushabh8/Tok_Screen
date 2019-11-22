
import React, { Component } from 'react';
import { AsyncStorage, Alert, KeyboardAvoidingView, Text, View, Dimensions, ImageBackground, ScrollView, Image, TextInput, TouchableOpacity } from 'react-native';
import styles from '../components/styles/styles'
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import { MusicFunc } from '../components/common/SoundFunc'
import CountryModal from './countryModal'
import StateModal from './stateModal'
import countries from '../Json/country'
import states from '../Json/state'
import webservice from '../webService/Api';
import Loader from './loader'
import SelectAvatar from "./selectAvatar";
import ImagePicker from 'react-native-image-picker';
import CustomAlert from './clubAlert'
import { validateFirstName, validateEmail, validatePassword, validateAge } from './validation'

const { width } = Dimensions.get('window');
const defaultImage = require('../image/Gameplay/Profile1.png');

export default class EditProfile extends Component {
    disabled = false
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            like: '',
            unlike: '',
            userId: '',
            email: '',
            age: '',
            countries: countries,
            states: states,
            selectedCntry: 'Select Country',
            selectedState: 'Select State',
            countryModal: false,
            stateModal: false,
            alertMessage: '',
            image: null,
            isLoading: false,
            base64: '',
            closeAlert: false,
            message: ''
        }
    }

    componentDidMount() {
        SelectAvatar._dataRefresh(this._refresh)
        AsyncStorage.getItem('userId')
            .then((res) => {
                let userId = JSON.parse(res)
                this.setState({ userId: userId, isLoading: true }, () => this.getDetail())
            })
    }

    selectPhotoTapped() {
        const options = {
            customButtons: [
                { name: 'selectAvatar', title: 'Select Avatar' },
            ],
            quality: 1.0,
            maxWidth: 500,
            maxHeight: 500,
            storageOptions: {
                skipBackup: true
            }
        };

        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
                //console.log('User cancelled photo picker');
            }
            else if (response.error) {
                //console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                //console.log('User tapped custom button: ', response.customButton);
                this.props.navigation.navigate('SelectAvatarEditProfile'), MusicFunc('Button_Click_Music')
            }
            else {
                let base64 = 'data:image/jpeg;base64,' + response.data
                this.setState({
                    image: response.uri,
                    base64
                });
            }
        });
    }

    _refresh = () => {
        this.getDetail()
    }

    stateModalOpen = (visible) => {
        this.setState({ stateModal: !visible });
    }
    stateModalClose = (visible) => {
        this.setState({ stateModal: false, states: states })
    }
    selectState(item) {
        this.setState({ stateModal: !this.state.stateModal, selectedState: item, states: states })
    }
    countryModalOpen = (visible) => {
        this.setState({ countryModal: !visible });
    }
    countryModalClose = (visible) => {
        this.setState({ countryModal: false, countries: countries })
    }

    selectCountry(item) {
        this.setState({ countryModal: !this.state.countryModal, selectedCntry: item, countries: countries })
    }

    getDetail() {
        this.setState({ isLoading: true })
        let variables = {}
        return webservice(variables, "users/editProfile/" + this.state.userId, "GET")
            .then(resp => {
                this.setState({ isLoading: false })
                if (resp.data.responseCode === 200) {
                    this.setState({
                        name: resp.data.data.name,
                        email: resp.data.data.email,
                        age: resp.data.data.age,
                        selectedCntry: resp.data.data.country,
                        selectedState: resp.data.data.state,
                        like: resp.data.data.win,
                        unlike: resp.data.data.lose,
                        image: resp.data.data.avatar,
                    })
                } else if (resp.data.responseCode === 400) {
                    Alert.alert('TOK', resp.data.responseMessage, [{ text: 'Cancel' }, { text: 'OK' },])
                }
                else if (resp.data.responseCode === 1000) {
                    this.setState({ isLoading: false }, () => { alert(resp.data.responseMessage) })
                }
            })
    }

    validate() {
        if (validateFirstName(this.state.name).status) {
            if (validateEmail(this.state.email).status) {
                if (this.state.age != "") {
                    this.editProfile()
                }
                else this.setState({ closeAlert: true, message: 'Please enter valid age.' })
            }
            else {
                this.setState({ closeAlert: true, message: validateEmail(this.state.email).error })
            }
        }
        else {
            this.setState({ closeAlert: true, message: validateFirstName(this.state.name).error })
        }
    }

    editProfile() {
        if (this.disabled) return;
        this.disabled = true;
        setTimeout(() => {
            this.disabled = false;
        }, 500);

        this.setState({ loading: true })
        let variables = {
            "name": this.state.name,
            "email": this.state.email,
            "age": this.state.age,
            "state": this.state.selectedCntry == "India" ? this.state.selectedState : "",
            "country": this.state.selectedCntry,
            "like": this.state.like,
            "unlike": this.state.unlike,
            "avatar": this.state.base64
        }
        return webservice(variables, "users/saveEditProfile/" + this.state.userId, "POST")
            .then(resp => {
                this.setState({ loading: false })
                if (resp.data.responseCode === 200) {
                    this.props.navigation.navigate('TabNav')
                } else if (resp.data.responseCode === 400) {
                    this.setState({ isLoading: false }, () => { Alert.alert('TOK', resp.data.responseMessage, [{ text: 'Cancel' }, { text: 'OK' }]) })
                }
                else if (resp.data.responseCode === 1000) {
                    this.setState({ isLoading: false }, () => { alert(resp.data.responseMessage) })
                }
            })
    }

    callback;
    static _dataRefresh(a) {
        callback = a
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
                <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                    <Loader visible={this.state.isLoading} />
                    <ScrollView keyboardShouldPersistTaps='handled' style={[styles.commonContainer, { top: scaleHeight(20) }]}>
                        <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: scaleHeight(20) }}>
                            <Image source={require('../image/Reset_Password/logo.png')} />
                        </View>
                        <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'space-between', marginHorizontal: scaleWidth(50), }}>
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <TouchableOpacity onPress={this.selectPhotoTapped.bind(this)}>
                                    <View style={{ height: scaleHeight(90), width: scaleWidth(90), flexDirection: 'column', justifyContent: 'center', alignItems: 'center', shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.5, shadowRadius: 1, borderRadius: 10, borderColor: 'white', borderWidth: 5 }}>
                                        <Image resizeMode="contain" source={this.state.image != null ? { uri: this.state.image } : defaultImage} style={{ height: scaleHeight(80), width: scaleWidth(80), alignSelf: 'center' }} />
                                    </View>
                                    <Text style={{ fontWeight: 'bold', fontSize: normalizeFont(20), alignSelf: 'center' }}>Edit</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly', height: scaleHeight(110) }}>
                                <View style={{ flexDirection: 'row', justifyContent: "space-between", width: scaleWidth(90) }}>
                                    <Image resizeMode="stretch" source={require('../image/edit_profile/like.png')} style={{ height: scaleHeight(18), width: scaleWidth(18) }} />
                                    <Text style={{ fontSize: normalizeFont(14), fontWeight: 'bold', textAlign: 'center' }}>{this.state.like}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: "space-between", width: scaleWidth(90) }}>
                                    <Image resizeMode="stretch" source={require('../image/edit_profile/unlike.png')} style={{ height: scaleHeight(18), width: scaleWidth(18) }} />
                                    <Text style={{ fontSize: normalizeFont(14), fontWeight: 'bold', textAlign: 'center' }}>{this.state.unlike}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.editProfile}>
                            <TextInput allowFontScaling={false}
                                autoCapitalize='none'
                                maxLength={40}
                                value={this.state.name}
                                onChangeText={(text) => this.setState({ name: text })}
                                placeholderTextColor="gray"
                                underlineColorAndroid="transparent"
                                style={{ width: width - 80, fontSize: normalizeFont(15), color: "black", fontWeight: '200', paddingHorizontal: scaleHeight(15) }}
                                placeholder="Name"
                            />
                        </View>
                        <View style={styles.editProfile}>
                            <TextInput allowFontScaling={false}
                                maxLength={100}
                                autoCapitalize='none'
                                value={this.state.email}
                                onChangeText={(text) => this.setState({ email: text })}
                                placeholderTextColor="gray"
                                underlineColorAndroid="transparent"
                                style={{ width: width - 80, fontSize: normalizeFont(15), color: "black", fontWeight: '200', paddingHorizontal: scaleHeight(15) }}
                                placeholder="Email Address"
                                keyboardType='email-address'
                            />
                        </View>
                        <View style={styles.editProfile}>
                            <TextInput allowFontScaling={false}
                                maxLength={2}
                                value={this.state.age}
                                onChangeText={(text) => this.setState({ age: text })}
                                placeholderTextColor="gray"
                                underlineColorAndroid="transparent"
                                style={{ width: width - 80, fontSize: normalizeFont(15), color: "black", fontWeight: '200', paddingHorizontal: scaleHeight(15) }}
                                placeholder="Age"
                                keyboardType='numeric'
                            />
                        </View>
                        <TouchableOpacity onPress={() => { this.countryModalOpen() }} style={[styles.editProfile, { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }]} >
                            <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', paddingLeft: scaleHeight(20) }}>
                                <Image source={require('../image/create/earth.png')} style={{}} />
                                <Text style={{ color: 'black', left: scaleWidth(10) }}>{this.state.selectedCntry}</Text>
                            </View>
                            <Image source={require('../image/create/down.png')} style={{ marginRight: scaleWidth(10) }} />
                        </TouchableOpacity>
                        {this.state.selectedCntry == 'India' ?
                            <TouchableOpacity onPress={() => { this.stateModalOpen() }}
                                style={[styles.editProfile, { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', }]} >
                                <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', paddingLeft: scaleHeight(20) }}>
                                    <Image source={require('../image/create/earth.png')} style={{}} />
                                    <Text style={{ color: "black", left: scaleWidth(10) }}>{this.state.selectedState}</Text>
                                </View>
                                <Image source={require('../image/create/down.png')} style={{ marginRight: scaleWidth(10) }} />
                            </TouchableOpacity> : null}
                        {this.state.countryModal ?
                            <CountryModal
                                onChangeText={(text) => this.filter(text)}
                                countries={this.state.countries}
                                onRequestClose={() => { this.countryModalOpen(!this.state.countryModal) }}
                                visible={this.state.countryModal}
                                alertMessage={this.state.alertMessage}
                                cancelButton={() => this.setState({ countryModal: false })}
                                countryModalClose={() => this.countryModalClose(this.state.countryModal)}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) =>
                                    <View style={{
                                        backgroundColor: '#FFFFFF',
                                        borderWidth: 0.5, borderColor: 'red', width: '100%'
                                    }}>
                                        <TouchableOpacity onPress={() => { this.selectCountry(item.country), MusicFunc('Button_Click_Music') }}>
                                            <Text style={{ color: "gray", fontSize: 19, marginLeft: scaleWidth(5), marginVertical: scaleHeight(5) }}>{item.country}</Text>
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
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) =>
                                    <View style={{ backgroundColor: '#FFFFFF', borderWidth: 0.5, borderColor: 'red', width: '100%' }}>
                                        <TouchableOpacity onPress={() => { this.selectState(item.state), MusicFunc('Button_Click_Music') }}>
                                            <Text style={{ color: "gray", fontSize: 19, marginVertical: scaleHeight(5), marginLeft: scaleWidth(5), }}>{item.state}</Text>
                                        </TouchableOpacity>
                                    </View>}
                            /> : null}
                        <View style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: scaleHeight(50) }}>
                            <TouchableOpacity onPress={() => { this.validate(), MusicFunc('Button_Click_Music') }} style={{ marginTop: 5 }} >
                                {/* <Image source={require('../image/Reset_Password/btn.png')} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: scaleHeight(10), color: 'white', fontWeight: '800', fontSize: normalizeFont(17) }}>Submit</Text> */}
                                <ImageBackground
                                    source={require('../image/welcome/btn2.png')}
                                    style={{ width: scaleWidth(250), height: scaleHeight(40), justifyContent: 'center', alignItems: 'center' }}
                                    resizeMode='stretch'
                                >
                                    <Text style={{ alignSelf: 'center', color: 'white', fontWeight: '800', fontSize: normalizeFont(17) }}>Submit</Text>
                                </ImageBackground>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { this.props.navigation.navigate('SelectTopics'), MusicFunc('Button_Click_Music') }} style={{ marginTop: scaleHeight(5) }} >
                                {/* <Image source={require('../image/Reset_Password/btn.png')} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: scaleHeight(10), color: 'white', fontWeight: '800', fontSize: normalizeFont(17) }}>Add Topics</Text> */}
                                <ImageBackground
                                    source={require('../image/welcome/btn2.png')}
                                    style={{ width: scaleWidth(250), height: scaleHeight(40), justifyContent: 'center', alignItems: 'center' }}
                                    resizeMode='stretch'
                                >
                                    <Text style={{ alignSelf: 'center', color: 'white', fontWeight: '800', fontSize: normalizeFont(17) }}>Add Topics</Text>
                                </ImageBackground>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { this.props.navigation.navigate('ResetPassword'), MusicFunc('Button_Click_Music') }} style={{ marginTop: 5 }} >
                                {/* <Image source={require('../image/Reset_Password/btn.png')} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: scaleHeight(10), color: 'white', fontWeight: '800', fontSize: normalizeFont(17) }}>Change Password</Text> */}
                                <ImageBackground
                                    source={require('../image/welcome/btn2.png')}
                                    style={{ width: scaleWidth(250), height: scaleHeight(40), justifyContent: 'center', alignItems: 'center' }}
                                    resizeMode='stretch'
                                >
                                    <Text style={{ alignSelf: 'center', color: 'white', fontWeight: '800', fontSize: normalizeFont(17) }}>Change Password</Text>
                                </ImageBackground>
                            </TouchableOpacity>
                        </View>
                        <CustomAlert
                            onRequestClose={() => { this.setState({ closeAlert: false }) }}
                            visible={this.state.closeAlert}
                            alertMessage={this.state.message}
                            cancelButton={() => { this.setState({ closeAlert: false }) }}
                            buttonTitle='OK'
                        />
                    </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>
        )
    }
}