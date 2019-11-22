
import React, { Component } from 'react';
import { AsyncStorage, KeyboardAvoidingView, TouchableOpacity, StyleSheet, Text, FlatList, View, ImageBackground, Platform, Image } from 'react-native';
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import Loader from './loader';
import webservice from '../webService/Api';
import Alert from './countryModal';

const avatar = require('../image/create/default.png')

export default class Notifications extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: '',
            notificationResults: null,
            sentRequestBy: [],
            notificaticationId: [],
            isLoading: false,
            isRefresh: false
        }
    }

    componentDidMount() {
        AsyncStorage.getItem('userId').then((id) => {
            this.setState({ userId: JSON.parse(id), isLoading: true }, () => this.Notifications())
        })
    }

    Notifications() {
        let variables = { "userId": this.state.userId }
        return webservice(variables, "users/ShowUserNotifications", "POST")
            .then(resp => {
                this.setState({ isLoading: false, isRefresh: false })
                if (resp.data.responseCode == 200) this.setState({ notificationResults: resp.data.data })
                else if (resp.data.responseCode === 1000) {
                    Alert.alert('TOK', resp.data.responseMessage, [{ text: 'OK', onPress: this.props.navigation.navigate('TabNav') }])
                }
            })
    }

    // *********************** Refresh Notifications ************************* */

    _onRefresh() {
        this.setState({ isRefresh: true }, function () {
            this.Notifications()
        })
    }

    //************************ Accept Request API ******************** */

    AcceptRejectBlock_requests = (index, requestResponse, notificaticationId, requestType, gameRoomId, gamePlayType) => {
        let sentRequestBy_Id = this.state.notificationResults[index].sentRequestBy._id;
        let variables = {
            "status": requestResponse,
            "sentRequestBy": sentRequestBy_Id,
            "sentRequestTo": this.state.userId,
            "notificationId": notificaticationId,
            "type": "FRIENDREQUEST"
        }
        return webservice(variables, "users/AcceptRejectFriendRequest", "POST")
            .then(resp => {
                let { notificationResults } = this.state;
                notificationResults.splice(index, 1)
                this.setState({ notificationResults })
                if (requestType === "GAMEREQUEST" && requestResponse === "ACCEPT") {
                    this.setState({ isLoading: true })
                    setTimeout(() => {
                        this.setState({ isLoading: false })
                        AsyncStorage.setItem('gameRoomId', JSON.stringify(gameRoomId))
                        let dualData = { type: "timed", gamePlayType }
                        if (gamePlayType == "topten")
                            this.props.navigation.navigate('GameStart', { type: dualData })
                        else
                            this.props.navigation.navigate('QuestionSmartSortSolo', { type: dualData })
                    }, 500);
                }
            })
    }

    render() {
        return (
            <ImageBackground source={require('../image/Invite_friend/bg.png')} style={{ flex: 1 }} >
                <Loader visible={this.state.isLoading} />
                <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                    {this.state.notificationResults != (null || '') ?
                        <View style={[styles.commonContainer, { marginTop: scaleHeight(20), flex: 1 }]}>
                            <FlatList
                                keyExtractor={(item, index) => index.toString()}
                                data={this.state.notificationResults}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item, index }) =>
                                    <View style={{
                                        justifyContent: 'center', alignItems: 'center',
                                        backgroundColor: 'transparent', paddingHorizontal: 15,
                                        paddingVertical: 5, marginBottom: 2, marginVertical: 5,
                                        marginHorizontal: 5, borderColor: 'grey', borderWidth: 1,
                                        borderRadius: 10
                                    }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                            <Image source={(item.sentRequestBy.avatar !== null || item.sentRequestBy.avatar === "") ? { uri: item.sentRequestBy.avatar } : avatar} resizeMode='center' style={{ marginHorizontal: 10, marginVertical: 10, padding: 10, width: Platform.OS == 'android' ? scaleWidth(50) : scaleWidth(50), height: scaleHeight(50) }} />
                                            <Text multiline={true} style={{ marginHorizontal: 10, marginVertical: 10, fontSize: 17, flex: 1 }} numberOfLines={1}>{item.sentRequestBy.name}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', }}>
                                            <TouchableOpacity style={{ marginHorizontal: 5 }} onPress={() => this.AcceptRejectBlock_requests(index, "ACCEPT", item.notifictaionId, item.type, item.type === "GAMEREQUEST" ? item.gameId._id : null, item.type === "GAMEREQUEST" ? item.gameId.gameType : null)} >
                                                <Image source={require('../image/notification/Green.png')} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                                <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: 5, color: 'white', fontWeight: '600', fontSize: normalizeFont(17) }}>Accept</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={{ marginHorizontal: 5 }} onPress={() => this.AcceptRejectBlock_requests(index, "REJECT", item.notifictaionId, item.type, item.type === "GAMEREQUEST" ? item.gameId._id : null)}>
                                                <Image source={require('../image/notification/red.png')} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                                <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: 5, color: 'white', fontWeight: '600', fontSize: normalizeFont(17) }}>Reject</Text>
                                            </TouchableOpacity>
                                            {item.type == "FRIENDREQUEST" ?
                                                <TouchableOpacity style={{ marginHorizontal: 5 }} onPress={() => this.AcceptRejectBlock_requests(index, "BLOCK", item.notifictaionId, item.type, item.type === "GAMEREQUEST" ? item.gameId._id : null)}>
                                                    <Image source={require('../image/notification/red.png')} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                                    <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: 5, color: 'white', fontWeight: '600', fontSize: normalizeFont(17) }}>Block</Text>
                                                </TouchableOpacity> : null
                                            }
                                        </View>
                                    </View>
                                }
                                onRefresh={() => this._onRefresh()}
                                refreshing={this.state.isRefresh}
                            />
                        </View>
                        :
                        <View style={{ alignItems: "center", justifyContent: 'center', flex: 1 }}>
                            <Text style={{ fontSize: normalizeFont(18), fontWeight: "bold", color: 'gray' }}> There is no notification to show </Text>
                        </View>
                    }
                </KeyboardAvoidingView>
            </ImageBackground>
        )
    }
}
const styles = StyleSheet.create({
})
