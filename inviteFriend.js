
import React, { Component } from 'react';
import { Alert, Text, View, Dimensions, AsyncStorage, ImageBackground, Modal, KeyboardAvoidingView, ScrollView, Image, TextInput, TouchableOpacity } from 'react-native';
import styles from '../components/styles/styles'
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import InviteAlert from './inviteFriendModal';
import webservice from '../webService/Api';

const { width } = Dimensions.get('window');

export default class InviteFriend extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            logoutModal: false,
            inviteModal: false,
            userId: "",
            results: [],
            invitesResults: ''
        }
    }
    componentDidMount() {
        AsyncStorage.getItem('userId').then((id) => this.setState({ userId: JSON.parse(id) }))
    }

    setModalVisible(visible) {
        this.setState({ inviteModal: visible });
    }

    getEmail(text) {
        this.setState({ email: text })
    }

    logoutModalOpen = (visible) => {
        this.setState({ logoutModal: !visible });
    }

    logoutModalClose = (visible) => {
        this.setState({ logoutModal: false })
    }

    searchFriend() {
        if (this.state.email === "") {
            alert("Please Enter text")
        }
        else {
            let variables = {
                "name": this.state.email,
                "userId": this.state.userId
            }
            return webservice(variables, "users/showUserListExpectFriends", "POST")
                .then(resp => {
                    if (resp.data.responseCode === 200) {
                        if (resp.data.data.length > 0) {
                            this.setState({ results: resp.data.data })
                            this.logoutModalOpen()
                        }
                        else {
                            Alert.alert('TOK', 'Player not found. Please enter valid name.', [{ text: 'OK' }])
                        }
                    }
                })
        }
    }

    invite(index) {
        this.setState({ logoutModal: false, inviteModal: true })
        let reciverId = this.state.results[index]._id;
        let variables = {
            "sentRequestBy": this.state.userId,
            "sentRequestTo": reciverId
        }
        return webservice(variables, "users/sendingFriendRequest", "POST")
            .then(resp => {
                if (resp.data.responseCode === 200) {
                    this.setState({ invitesResults: resp.data.responseMessage })
                }
                else if (resp.data.responseCode === 400) {
                    this.setState({ invitesResults: resp.data.responseMessage })
                }
                else if (resp.data.responseCode === 1000) {
                    this.setState({ isLoading: false }, () => alert(resp.data.responseMessage))
                }
            })
    }

    render() {
        return (
            <ImageBackground source={require('../image/Invite_friend/bg.png')}
                style={{ flex: 1 }} >
                <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                    <ScrollView keyboardShouldPersistTaps='handled' style={[styles.commonContainer, { paddingTop: scaleHeight(150) }]}>
                        <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: scaleHeight(20), marginHorizontal: scaleWidth(30) }}>
                            <Text style={{ backgroundColor: "transparent", color: "black", fontWeight: "500", fontSize: normalizeFont(20) }}>
                                Please enter your friend name and press search
                            </Text>
                        </View>
                        <View style={{ marginHorizontal: scaleWidth(30), paddingTop: scaleHeight(20) }}>
                            <View style={styles.email}>
                                <Image source={require('../image/create/user.png')} style={{ marginLeft: scaleWidth(10) }} />
                                <TextInput allowFontScaling={false}
                                    maxLength={100}
                                    value={this.state.email}
                                    onChangeText={(text) => this.getEmail(text)}
                                    placeholderTextColor="gray"
                                    underlineColorAndroid="transparent"
                                    style={{ width: width - 80, fontSize: normalizeFont(16), color: "black", height: scaleHeight(48), fontWeight: '200', marginLeft: scaleWidth(5) }}
                                    placeholder="Friend Name"
                                    autoFocus={true}
                                />
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: scaleHeight(40) }}>
                                <TouchableOpacity style={{ marginVertical: scaleHeight(10) }} onPress={() => { this.searchFriend() }}>
                                    <ImageBackground
                                        source={require('../image/welcome/btn2.png')}
                                        style={{ width: scaleWidth(250), height: scaleHeight(40), justifyContent: 'center', alignItems: 'center' }}
                                        resizeMode='stretch'
                                    >
                                        <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: scaleHeight(8), color: 'white', fontWeight: '800', fontSize: normalizeFont(17) }}>Search</Text>
                                    </ImageBackground>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ height: scaleHeight(100) }} />
                        <InviteAlert
                            data={this.state.results}
                            onRequestClose={() => { this.logoutModalOpen(!this.state.logoutModal) }}
                            visible={this.state.logoutModal}
                            sendInvitation={(index) => this.invite(index)}
                            logoutModalClose={() => this.logoutModalClose(this.state.logoutModal)}
                        />
                        <Modal
                            transparent={false}
                            visible={this.state.inviteModal}
                        >
                            <View style={[styles.profileContainer, { justifyContent: 'center' }]}>
                                <View style={[styles.answerModalView, { alignItems: 'center', justifyContent: 'center', position: 'relative', }]}>
                                    <View style={{ flexDirection: 'column', alignItems: 'center', marginHorizontal: 20, margin: 25 }}>
                                        <Text style={{ fontSize: normalizeFont(18), fontWeight: 'bold' }}>{this.state.invitesResults}</Text>
                                        <TouchableOpacity onPress={() => { this.setModalVisible(false) }}
                                            style={{ width: scaleWidth(70), height: scaleHeight(30), backgroundColor: '#D00E17', borderRadius: 5, alignItems: 'center', marginTop: '18%', borderBottomWidth: 2, borderBottomColor: '#6E6E6E' }} >
                                            <Text style={{ color: 'white', fontWeight: '600', fontSize: normalizeFont(16), alignSelf: 'center', top: scaleHeight(5) }}>OK</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>
        )
    }
}
