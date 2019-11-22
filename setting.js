// import React, { Component } from 'react';
// import {
//     Slider, AsyncStorage, Text, View, Dimensions, Switch, ImageBackground, Platform, ScrollView, Image, TouchableOpacity, KeyboardAvoidingView
// } from 'react-native';
// import Sound from 'react-native-sound';
// import { MusicFunc } from "../components/common/SoundFunc";
// import styles from '../components/styles/styles'
// import webservice from '../webService/Api';
// import { socket } from '../webService/global';
// import Alert from './logoutAlert'
// import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
// import SystemSetting from 'react-native-system-setting'
// const { width, height } = Dimensions.get('window');

// const ValueView = (props) => {
//     const { title, value, changeVal, refFunc, btn } = props
//     return (
//         <View style={{ marginHorizontal: scaleHeight(10) }}>
//             <Slider
//                 ref={refFunc}
//                 style={{ width: scaleWidth(90), }}
//                 onValueChange={changeVal} />
//         </View>
//     )
// }


// export default class Setting extends Component {
//     isAndroid = Platform.OS === 'android'
//     volumeListener = null;
//     volTypes = ['music', 'system', 'call', 'ring', 'alarm', 'notification']
//     volIndex = 0
//     disabled = false

//     constructor(props) {
//         super(props);
//         this.state = {
//             userId: '',
//             logoutModal: false,
//             alertMessage: 'Are you sure you want to exit?',
//             switchMode1: true,
//             switchMode2: false,
//             volume: 0,
//             volType: this.volTypes[this.volIndex],
//         }

//     }

//     componentDidMount() {

//         AsyncStorage.getItem('MusicOn').then((result) => {
//             let res = JSON.parse(result);
//             this.setState({
//                 switchMode1: res
//             })
//             if (this.state.switchMode1 == null) {
//                 this.setState({
//                     switchMode1: true
//                 })
//             }
//         })

//         AsyncStorage.getItem('userId').then((id) => this.setState({ userId: JSON.parse(id) }))
//         this.setState({ volume: SystemSetting.getVolume(this.state.volType) })

//         // just init slider value directly
//         this._changeSliderNativeVol(this.sliderVol, this.state.volume)

//         this.volumeListener = SystemSetting.addVolumeListener((data) => {
//             const volume = this.isAndroid ? data[this.state.volType] : data.value
//             this._changeSliderNativeVol(this.sliderVol, volume)
//             this.setState({ volume: volume })
//         })
//     }

//     _changeSliderNativeVol(slider, value) {
//         slider.setNativeProps({
//             value: value
//         })
//     }

//     _changeSliderNativeVol(slider, value) {
//         // slider.setNativeProps({
//         //     value: value || ''
//         // })
//     }

//     _changeVol(value) {
//         SystemSetting.setVolume(value, {
//             type: this.state.volType,
//             playSound: false,
//             showUI: false
//         })
//         this.setState({
//             volume: value
//         })
//     }

//     _changeVolType = async () => {
//         this.volIndex = ++this.volIndex % this.volTypes.length
//         const volType = this.volTypes[this.volIndex]
//         const vol = await SystemSetting.getVolume(volType)
//         this._changeSliderNativeVol(this.sliderVol, vol)
//         this.setState({
//             volType: volType,
//             volume: vol
//         })
//     }


//     toggleSwitch1(switchMode1) {
//         if (switchMode1) {
//             AsyncStorage.setItem('MusicOn', JSON.stringify(switchMode1))
//             MusicFunc('Background_Music', 'play')
//             this.setState({
//                 switchMode1: !this.state.switchMode1,
//             })

//         }
//         else {
//             AsyncStorage.setItem('MusicOn', JSON.stringify(switchMode1))
//             MusicFunc('Background_Music', 'stop')
//             this.setState({
//                 switchMode1: !this.state.switchMode1,
//             })
//         }
//     }

//     toggleSwitch2(switchMode2) {
//         this.setState({
//             switchMode2: !this.state.switchMode2,
//         })
//     }

//     logoutModalOpen = (visible) => {
//         this.setState({ logoutModal: !visible });
//     }
//     logoutModalClose = (visible) => {
//         this.setState({ logoutModal: false })
//     }

//     onPressHandler(screen) {
//         if (this.disabled) return;
//         this.disabled = true;
//         setTimeout(() => {
//             this.disabled = false;
//         }, 500);

//         this.props.navigation.navigate(screen)
//     }

//     logOutHandler() {
//         this.setState({ logoutModal: false })
//         socket.emit('logOut', {
//             'userId': this.state.userId
//         })
//         MusicFunc('Background_Music', 'stop')
//         AsyncStorage.clear()
//         this.props.navigation.navigate("Welcome")
//         this.setUserStatus()
//     }

//     // ************************* set user status false ****************************

//     setUserStatus() {
//         let variables = {
//             "_id": this.state.userId,
//             "status": "ONLINE"
//         }
//         return webservice(variables, "users/onlineFalse", "POST")
//             .then((resp) => { })
//     }


//     render() {
//         const { volume } = this.state

//         return (
//             <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
//                 <ImageBackground source={require('../image/welcome/Bg.png')} style={{ flex: 1 }} >

//                     <ScrollView keyboardShouldPersistTaps='always' style={[styles.commonContainer, { paddingTop: Platform.OS === 'ios' ? scaleHeight(50) : scaleHeight(60) }]}>
//                         <View style={styles.main}>
//                             <TouchableOpacity style={styles.mainViewDeco} >
//                                 <Image source={require('../image/Setting/Sound.png')} />
//                                 <Text style={styles.textSetting}>Sound Effect</Text>
//                             </TouchableOpacity>
//                             <Switch onValueChange={() => this.toggleSwitch1(!this.state.switchMode1)} value={this.state.switchMode1} style={{ marginRight: scaleWidth(10) }} />
//                         </View>

//                         <View style={styles.main}>
//                             <View style={styles.mainViewDeco}>
//                                 <Image source={require('../image/Setting/push.png')} />
//                                 <Text style={styles.textSetting}>Push Notification</Text>
//                             </View>
//                             <Switch onValueChange={() => this.toggleSwitch2(this.state.switchMode2)} value={this.state.switchMode2} style={{ marginRight: scaleWidth(10) }} />
//                         </View>
//                         <View style={styles.main}>
//                             <View style={styles.mainViewDeco}>
//                                 <Image source={require('../image/Setting/music.png')} />
//                                 <Text style={styles.textSetting}>In-Game music</Text>
//                             </View>
//                             {/* <Image source={require('../image/Setting/next.png')} style={{ marginRight: 25, }} /> */}
//                             <ValueView
//                                 title='Volume'
//                                 value={volume}
//                                 changeVal={(val) => this._changeVol(val)}
//                                 refFunc={(sliderVol) => this.sliderVol = sliderVol}
//                             />

//                         </View>


//                         <TouchableOpacity onPress={() => { this.onPressHandler('EditProfile'), MusicFunc('Button_Click_Music') }}
//                             style={styles.main}>
//                             <View style={styles.mainViewDeco}>
//                                 <Image source={require('../image/Setting/profile.png')} />
//                                 <Text style={styles.textSetting}>Edit Profile</Text>
//                             </View>
//                             <Image source={require('../image/Setting/next.png')} style={{ marginRight: scaleWidth(25) }} />
//                         </TouchableOpacity>
//                         <TouchableOpacity onPress={() => { this.onPressHandler('BlockedUser'), MusicFunc('Button_Click_Music') }} style={styles.main}>
//                             <View style={styles.mainViewDeco}>
//                                 <Image source={require('../image/Setting/user.png')} />
//                                 <Text style={styles.textSetting}>Blocked User</Text>
//                             </View>
//                             <Image source={require('../image/Setting/next.png')} style={{ marginRight: scaleWidth(25) }} />
//                         </TouchableOpacity>
//                         <TouchableOpacity onPress={() => { this.onPressHandler('Privacy'), MusicFunc('Button_Click_Music') }}
//                             style={styles.main}>
//                             <View style={styles.mainViewDeco}>
//                                 <Image source={require('../image/Setting/privacy.png')} />
//                                 <Text style={styles.textSetting}>Privacy</Text>
//                             </View>
//                             <Image source={require('../image/Setting/next.png')} style={{ marginRight: scaleWidth(25) }} />
//                         </TouchableOpacity>
//                         <TouchableOpacity onPress={() => { this.onPressHandler('TermsAndCondition'), MusicFunc('Button_Click_Music') }}
//                             style={styles.main}>
//                             <View style={styles.mainViewDeco}>
//                                 <Image source={require('../image/Setting/TnC.png')} />
//                                 <Text style={styles.textSetting}>Terms & Condition</Text>
//                             </View>
//                             <Image source={require('../image/Setting/next.png')} style={{ marginRight: scaleWidth(25) }} />
//                         </TouchableOpacity>
//                         <TouchableOpacity onPress={() => { this.onPressHandler('Tutorial'), MusicFunc('Button_Click_Music') }}
//                             style={styles.main}>
//                             <View style={styles.mainViewDeco}>
//                                 <Image source={require('../image/Setting/tutorial.png')} />
//                                 <Text style={styles.textSetting}>Tutorial</Text>
//                             </View>
//                             <Image source={require('../image/Setting/next.png')} style={{ marginRight: scaleWidth(25) }} />
//                         </TouchableOpacity>
//                         <TouchableOpacity onPress={() => { this.onPressHandler('AboutUs'), MusicFunc('Button_Click_Music') }}
//                             style={styles.main}>
//                             <View style={styles.mainViewDeco}>
//                                 <Image source={require('../image/Setting/user.png')} />
//                                 <Text style={styles.textSetting}>About Us</Text>
//                             </View>
//                             <Image source={require('../image/Setting/next.png')} style={{ marginRight: scaleWidth(25) }} />
//                         </TouchableOpacity>
//                         <TouchableOpacity onPress={() => { this.logoutModalOpen() }}
//                             style={styles.main}>
//                             <View style={styles.mainViewDeco}>
//                                 <Image source={require('../image/Setting/Logout.png')} />
//                                 <Text style={styles.textSetting}>Logout</Text>
//                             </View>
//                             <Image source={require('../image/Setting/next.png')} style={{ marginRight: scaleWidth(25) }} />
//                         </TouchableOpacity>
//                         {this.state.logoutModal ?
//                             <Alert
//                                 onRequestClose={() => { this.logoutModalOpen(!this.state.logoutModal) }}
//                                 visible={this.state.logoutModal}
//                                 alertMessage={this.state.alertMessage}
//                                 logoutModalClose={() => this.setState({ logoutModal: false })}
//                                 okButton={() => {
//                                     this.logOutHandler()
//                                 }}
//                                 cancelButton={() => this.setState({ logoutModal: false })}
//                             /> : null
//                         }
//                     </ScrollView>

//                 </ImageBackground>
//             </KeyboardAvoidingView>

//         )
//     }
// }

import React, { Component } from 'react';
import {
    Slider, AsyncStorage, Text, View, Dimensions, Switch, ImageBackground, Platform, ScrollView, Image, TouchableOpacity, KeyboardAvoidingView
} from 'react-native';
import Sound from 'react-native-sound';
import { MusicFunc } from "../components/common/SoundFunc";
import styles from '../components/styles/styles'
import webservice from '../webService/Api';
import { socket } from '../webService/global';
import Alert from './logoutAlert'
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import SystemSetting from 'react-native-system-setting'
const { width, height } = Dimensions.get('window');

const ValueView = (props) => {
    const { title, value, changeVal, refFunc, btn } = props
    return (
        <View style={{ marginHorizontal: scaleHeight(10) }}>
            <Slider
                ref={refFunc}
                style={{ width: scaleWidth(90), }}
                onValueChange={changeVal} />
        </View>
    )
}


export default class Setting extends Component {
    isAndroid = Platform.OS === 'android'
    volumeListener = null;
    volTypes = ['music', 'system', 'call', 'ring', 'alarm', 'notification']
    volIndex = 0
    disabled = false

    constructor(props) {
        super(props);
        this.state = {
            userId: '',
            logoutModal: false,
            alertMessage: 'Are you sure you want to exit?',
            switchMode1: true,
            switchMode2: false,
            volume: 0,
            volType: this.volTypes[this.volIndex],
        }

    }

    componentDidMount() {

        AsyncStorage.getItem('MusicOn').then((result) => {
            let res = JSON.parse(result);
            this.setState({
                switchMode1: res
            })
            if (this.state.switchMode1 == null) {
                this.setState({
                    switchMode1: true
                })
            }
        })

        AsyncStorage.getItem('userId').then((id) => this.setState({ userId: JSON.parse(id) }))
        this.setState({ volume: SystemSetting.getVolume(this.state.volType) })

        // just init slider value directly
        this._changeSliderNativeVol(this.sliderVol, this.state.volume)

        this.volumeListener = SystemSetting.addVolumeListener((data) => {
            const volume = this.isAndroid ? data[this.state.volType] : data.value
            this._changeSliderNativeVol(this.sliderVol, volume)
            this.setState({ volume: volume })
        })
    }

    _changeSliderNativeVol(slider, value) {
        slider.setNativeProps({
            value: value
        })
    }

    _changeSliderNativeVol(slider, value) {
        // slider.setNativeProps({
        //     value: value || ''
        // })
    }

    _changeVol(value) {
        SystemSetting.setVolume(value, {
            type: this.state.volType,
            playSound: false,
            showUI: false
        })
        this.setState({
            volume: value
        })
    }

    _changeVolType = async () => {
        this.volIndex = ++this.volIndex % this.volTypes.length
        const volType = this.volTypes[this.volIndex]
        const vol = await SystemSetting.getVolume(volType)
        this._changeSliderNativeVol(this.sliderVol, vol)
        this.setState({
            volType: volType,
            volume: vol
        })
    }


    toggleSwitch1(switchMode1) {
        if (switchMode1) {
            AsyncStorage.setItem('MusicOn', JSON.stringify(switchMode1))
            MusicFunc('Background_Music', 'play')
            this.setState({
                switchMode1: !this.state.switchMode1,
            })

        }
        else {
            AsyncStorage.setItem('MusicOn', JSON.stringify(switchMode1))
            MusicFunc('Background_Music', 'stop')
            this.setState({
                switchMode1: !this.state.switchMode1,
            })
        }
    }

    toggleSwitch2(switchMode2) {
        this.setState({
            switchMode2: !this.state.switchMode2,
        })
    }

    logoutModalOpen = (visible) => {
        this.setState({ logoutModal: !visible });
    }
    logoutModalClose = (visible) => {
        this.setState({ logoutModal: false })
    }

    onPressHandler(screen) {
        if (this.disabled) return;
        this.disabled = true;
        setTimeout(() => {
            this.disabled = false;
        }, 500);

        this.props.navigation.navigate(screen)
    }

    logOutHandler() {
        this.setState({ logoutModal: false })
        socket.emit('logOut', {
            'userId': this.state.userId
        })
        MusicFunc('Background_Music', 'stop')
        AsyncStorage.clear()
        this.props.navigation.navigate("Welcome")
        this.setUserStatus()
    }

    // ************************* set user status false ****************************

    setUserStatus() {
        let variables = {
            "_id": this.state.userId,
            "status": "ONLINE"
        }
        return webservice(variables, "users/onlineFalse", "POST")
            .then((resp) => { })
    }


    render() {
        const { volume } = this.state

        return (
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                <ImageBackground source={require('../image/welcome/Bg.png')} style={{ flex: 1 }} >

                    <ScrollView keyboardShouldPersistTaps='always' style={[styles.commonContainer, { paddingTop: Platform.OS === 'ios' ? scaleHeight(50) : scaleHeight(60) }]}>
                        <View style={styles.main}>
                            <TouchableOpacity style={styles.mainViewDeco} >
                                <Image style={styles.Imgstyle}source={require('../image/Setting/Sound.png')} />
                                <Text style={styles.textSetting}>Sound Effect</Text>
                            </TouchableOpacity>
                            <Switch onValueChange={() => this.toggleSwitch1(!this.state.switchMode1)} value={this.state.switchMode1} style={{ marginRight: scaleWidth(10) }} />
                        </View>

                        <View style={styles.main}>
                            <View style={styles.mainViewDeco}>
                                <Image style={styles.Imgstyle}source={require('../image/Setting/push.png')} />
                                <Text style={styles.textSetting}>Push Notification</Text>
                            </View>
                            <Switch onValueChange={() => this.toggleSwitch2(this.state.switchMode2)} value={this.state.switchMode2} style={{ marginRight: scaleWidth(10) }} />
                        </View>
                        <View style={styles.main}>
                            <View style={styles.mainViewDeco}>
                                <Image style={styles.Imgstyle}source={require('../image/Setting/music.png')} resizeMode="contain" />
                                <Text style={styles.textSetting}>In-Game music</Text>
                            </View>
                            {/* <Image source={require('../image/Setting/next.png')} style={{ marginRight: 25, }} /> */}
                            <ValueView
                                title='Volume'
                                value={volume}
                                changeVal={(val) => this._changeVol(val)}
                                refFunc={(sliderVol) => this.sliderVol = sliderVol}
                            />

                        </View>


                        <TouchableOpacity onPress={() => { this.onPressHandler('EditProfile'), MusicFunc('Button_Click_Music') }}
                            style={styles.main}>
                            <View style={styles.mainViewDeco}>
                                <Image style={styles.Imgstyle}source={require('../image/Setting/profile.png')} />
                                <Text style={styles.textSetting}>Edit Profile</Text>
                            </View>
                            <Image source={require('../image/Setting/next.png')} style={{ marginRight: scaleWidth(25) }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { this.onPressHandler('BlockedUser'), MusicFunc('Button_Click_Music') }} style={styles.main}>
                            <View style={styles.mainViewDeco}>
                             <Image style={styles.Imgstyle}source={require('../image/Setting/user.png')} />
                           <Text style={styles.textSetting}>Blocked User</Text>
                           </View>
                            <Image source={require('../image/Setting/next.png')} style={{ marginRight: scaleWidth(25) }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { this.onPressHandler('Privacy'), MusicFunc('Button_Click_Music') }}
                            style={styles.main}>
                            <View style={styles.mainViewDeco}>
                            
                                <Image style={styles.Imgstyle}source={require('../image/Setting/privacy.png')} />
                                <Text style={styles.textSetting}>Privacy</Text>
                            </View>
                            <Image source={require('../image/Setting/next.png')} style={{ marginRight: scaleWidth(25) }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { this.onPressHandler('TermsAndCondition'), MusicFunc('Button_Click_Music') }}
                            style={styles.main}>
                            <View style={styles.mainViewDeco}>
                                <Image style={styles.Imgstyle}source={require('../image/Setting/TnC.png')} />
                                <Text style={styles.textSetting}>Terms & Condition</Text>
                            </View>
                            <Image source={require('../image/Setting/next.png')} style={{ marginRight: scaleWidth(25) }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { this.onPressHandler('Tutorial'), MusicFunc('Button_Click_Music') }}
                            style={styles.main}>
                            <View style={styles.mainViewDeco}>
                                <Image style={styles.Imgstyle}source={require('../image/Setting/tutorial.png')} />
                                <Text style={styles.textSetting}>Tutorial</Text>
                            </View>
                            <Image source={require('../image/Setting/next.png')} style={{ marginRight: scaleWidth(25) }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { this.onPressHandler('AboutUs'), MusicFunc('Button_Click_Music') }}
                            style={styles.main}>
                            <View style={styles.mainViewDeco}>
                                <Image style={styles.Imgstyle}source={require('../image/Setting/user.png')} />
                                <Text style={styles.textSetting}>About Us</Text>
                            </View>
                            <Image source={require('../image/Setting/next.png')} style={{ marginRight: scaleWidth(25) }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { this.logoutModalOpen() }}
                            style={styles.main}>
                            <View style={styles.mainViewDeco}>
                                <Image style={styles.Imgstyle} source={require('../image/Setting/Logout.png')} />
                                <Text style={styles.textSetting}>Logout</Text>
                            </View>
                            <Image source={require('../image/Setting/next.png')} style={{ marginRight: scaleWidth(25) }} />
                        </TouchableOpacity>
                        {this.state.logoutModal ?
                            <Alert
                                onRequestClose={() => { this.logoutModalOpen(!this.state.logoutModal) }}
                                visible={this.state.logoutModal}
                                alertMessage={this.state.alertMessage}
                                logoutModalClose={() => this.setState({ logoutModal: false })}
                                okButton={() => {
                                    this.logOutHandler()
                                }}
                                cancelButton={() => this.setState({ logoutModal: false })}
                            /> : null
                        }
                    </ScrollView>

                </ImageBackground>
            </KeyboardAvoidingView>

        )
    }
}

// const SetttingIcon = (source) => {
//     console.log('asdfa =>>> ', source)
//     return(
//         <View  style={{height:20,width:20}} >
//             <Image source={source} resizeMode="contain" />
//         </View>
//     )
// }

