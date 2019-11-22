import React, { Component } from 'react';
import { NativeModules, ActivityIndicator, Alert, Text, View, Dimensions, ImageBackground, Platform, ScrollView, Image, AsyncStorage, TouchableOpacity } from 'react-native';
import styles from '../components/styles/styles'
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import { MusicFunc } from '../components/common/SoundFunc';
const FBSDK = require('react-native-fbsdk');
const { LoginManager, AccessToken } = FBSDK;
import Loader from './loader';
import webservice from '../webService/Api';
import { socket } from '../webService/global'
// const { RNTwitterSignIn } = NativeModules
const Constants = {
    TWITTER_COMSUMER_KEY: "s5dxPftEi4mIiz4bvElJ1FyGD",
    TWITTER_CONSUMER_SECRET: "bE3eJLbcb8pSy9ts1722CbGSyqB3zOTFiYKsZHpeRzsWcr36zS"
}
const { width, height } = Dimensions.get('window');
const backgrounMusic = require('../sound/Background.wav');
const buttonClickMusic = require('../sound/Button_click.wav');

export default class Welcome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false,
            user: null,
            userLoggedIn: false,
            isLoading: false
        }
    }

    componentDidMount() {
        //console.disableYellowBox = true
        AsyncStorage.getItem('loginState')
            .then((state) => {
                if (state == null) {
                    this.setState({ userLoggedIn: false })

                }
                else (state == true)
                this.setState({ userLoggedIn: true })
                // this.props.navigation.navigate("Home")
            })
    }

    _twitterSignIn = (socialType) => {

        // RNTwitterSignIn.init(Constants.TWITTER_COMSUMER_KEY, Constants.TWITTER_CONSUMER_SECRET)

        // RNTwitterSignIn.logIn()
        //     .then(loginData => {
        //         const { authToken, authTokenSecret } = loginData
        //         if (authToken && authTokenSecret) {
        //             this.setState({
        //                 isLoggedIn: true
        //             })
        //         }
        //     })
        //     .catch(error => {
        //         //console.log(error)
        //     })
    }
    handleLogout = () => {
        // RNTwitterSignIn.logOut()
        // this.setState({
        //     isLoggedIn: false
        // })
    }

    _onSignInWithSocial(self, socialType) {
        // self.setState({isLoading: true})

        if (socialType === "facebook") {
            LoginManager.logInWithReadPermissions(['public_profile', 'email']).then(
                function (result) {
                    if (result.isCancelled) {
                        self.cancelLoader()
                        Alert.alert(
                            'TOK',
                            "Login cancelled",
                            [
                                { text: 'OK' },
                            ]
                        )
                    } else {
                        AccessToken.getCurrentAccessToken().then((data) => {
                            // self.cancelLoader()
                            const { accessToken } = data;
                            let token = accessToken.toString();
                            setTimeout(() => {
                                alert("token",token)
                                self.facebookLoginDone(token, socialType);
                            }, 200)
                        })
                    }
                },
                function (error) {
                    self.setState({ isLoading: false, blur: 1 })
                    Alert.alert(
                        'TOK',
                        "Facebook Login Failed.",
                        [
                            { text: 'OK', onPress: () => console.log("Facebook Login Failed.") },
                        ]
                    )
                }
            );
        } else if (socialType == "twitter") {
            this._twitterSignIn(socialType)
        }
    }


    cancelLoader() {
        this.setState({ isLoading: false })
    }

    facebookLoginDone(token, socialType) {
        this.setState({ isLoading: true })
        return fetch('https://graph.facebook.com/v2.11/me?fields=id,email,name,first_name,last_name,picture.width(800).height(800),friends&access_token=' + token, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((response) => response.json()
                .then(facebookData => {
                    if (response.ok == true) {

                        var reqData = {
                            "id": facebookData.id ? facebookData.id : "",
                            "email_id": facebookData.email ? facebookData.email : "",
                            "firstName": facebookData.first_name ? facebookData.first_name : "",
                            "lastName": facebookData.last_name ? facebookData.last_name : "",
                            "photo": facebookData.picture.data.url ? facebookData.picture.data.url : "",
                            "src": socialType
                        }

                        LoginManager.logOut();
                        if (reqData.email_id && reqData.email_id != "") {
                            this._callSocialAPI(reqData);
                        } else {
                            this.setState({ isLoading: false }, () => {
                                Alert.alert(
                                    'TOK',
                                    "Please provide Facebook email permission to be able to login using Facebook",
                                    [
                                        { text: 'OK', onPress: () => console.log("Please provide Facebook email permission to be able to login using Facebook") },
                                    ]
                                )
                            });
                        }
                    }
                }))
            .catch((err) => {
                //console.log('Error in fetching data from facebook');
            })
    }
    _callSocialAPI(reqData) {
        this.setState({ isLoading: true })
        //console.log('request data --->>> '+JSON.stringify(reqData))
        return webservice(reqData, "users/loginWithFacebook", "POST")
            .then((responseJson) => {
                //console.log('social API response===>>>' +JSON.stringify(responseJson))
                if (responseJson.status === 200) {
                    AsyncStorage.setItem('@UserDetails', JSON.stringify(responseJson.data.resultActive.facebook));
                    AsyncStorage.setItem('userId', JSON.stringify(responseJson.data.resultActive._id));
                    AsyncStorage.setItem('name', JSON.stringify(responseJson.data.resultActive.name));
                    AsyncStorage.setItem('loginState', JSON.stringify(true));
                    // MusicFunc('Background_Music', 'play')

                    socket.emit('initChat', {
                        'userId': responseJson.data.resultActive._id,
                        'userName': responseJson.data.resultActive.facebook.firstName
                    })
                    this.setState({ isLoading: false }, () => this.props.navigation.navigate("SelectAvatar"));
                }
                else this.setState({ isLoading: false }, () => alert(responseJson.message))
            })
            .catch((error) => {
                this.setState({ isLoading: false })
            })
    }
    render() {
        return (
            <ImageBackground source={require('../image/welcome/Bg.png')} style={{ flex: 1 }} >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', top: scaleHeight(30) }}>
                    <Loader visible={this.state.isLoading} />
                    <Image resizeMode="stretch" source={require('../image/Reset_Password/logo.png')} />
                    <Text style={{ color: 'grey', marginHorizontal: scaleWidth(60), fontSize: normalizeFont(20), fontWeight: "500", marginVertical: scaleHeight(10), textAlign: 'center' }}>We'll never post anything without permission!</Text>
                    <TouchableOpacity onPress={() => this._onSignInWithSocial(this, 'facebook')} style={{ marginVertical: scaleHeight(10) }}>
                        <Image resizeMode="stretch" source={require('../image/welcome/fb.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this._onSignInWithSocial(this, 'twitter')} style={{ marginVertical: scaleHeight(10) }}>
                        <Image resizeMode="stretch" source={require('../image/welcome/tw.png')} />
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ height: 1, backgroundColor: 'black', width: scaleWidth(50) }} />
                        <Text style={{ color: 'black', marginHorizontal: scaleWidth(10) }}>OR</Text>
                        <View style={{ height: 1, backgroundColor: 'black', width: scaleWidth(50) }} />
                    </View>

                    <TouchableOpacity onPress={() => this.props.navigation.navigate('Login')} style={{
                        marginVertical: scaleHeight(10), backgroundColor: "#D00E17", justifyContent: 'center', alignItems: 'center',
                        marginHorizontal: scaleWidth(20), borderRadius: 10, width: scaleWidth(160), height: scaleHeight(40)
                    }}>
                        <Text style={{ color: 'white', fontWeight: '600', fontSize: normalizeFont(17) }}>
                            Login Via Email
                        </Text>
                    </TouchableOpacity>

                    <Text style={{ color: 'black', fontSize: normalizeFont(17), fontWeight: "300", textAlign: 'center' }}>By signing up, you agree to our</Text>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('TermsAndCondition')}>
                        <Text style={{ color: 'red', fontSize: normalizeFont(17), fontWeight: "300", textAlign: 'center' }}>Terms and Conditions</Text>
                        <View style={{ height: 1, backgroundColor: 'red' }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('Tutorial')} style={{ marginVertical: scaleHeight(15), backgroundColor: "#D00E17", borderRadius: 10, justifyContent: 'center', alignItems: 'center', height: scaleHeight(40), width: scaleWidth(80) }} >
                        <Text style={{ color: 'white', fontWeight: '600', fontSize: normalizeFont(17), }}>Tutorial</Text>
                    </TouchableOpacity>
                    <Text style={{ color: 'black', fontSize: normalizeFont(19), fontWeight: '300' }}>Don't have an Account?</Text>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('CreateAccount')}>
                        <Text style={{ color: 'red', fontSize: normalizeFont(17), fontWeight: "300", textAlign: 'center' }}>Create Account</Text>
                        <View style={{ height: 1, backgroundColor: 'red' }} />
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        )
    }
}
