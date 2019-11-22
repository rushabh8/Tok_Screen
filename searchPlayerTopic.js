import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet, Text,
    View, Dimensions,
    ImageBackground,
    Platform,
    ScrollView,
    Alert,
    TouchableOpacity,
    Image, TextInput, FlatList, AsyncStorage
} from 'react-native';
// import Alert from './profileModal'
import styles from '../components/styles/styles'
const avatar = require('../image/create/default.png')
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
const { width, height } = Dimensions.get('window');
import topic from '../image/home/image.png'
import webservice from '../webService/Api';
import Loader from './loader';

export default class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            focus: "player",
            searchText: this.props.navigation.state.params.data,
            userList: [],
            subCategoryList: [],
            userId: '',
            isLoading: false
        }
    }

    componentWillMount() {
        this.setState({ isLoading: true })
        AsyncStorage.getItem('userId')
            .then((res) => {
                let userId = JSON.parse(res)
                this.setState({ userId: userId }, () => this._searchResults())
            })
    }

    _searchResults() {
        let variables = {
            "name": this.state.searchText,
            "userId": this.state.userId
        }
        return webservice(variables, "users/searchUserAndCategories", "POST")
            .then(resp => {
                this.setState({ isLoading: false })
                if (resp.data.responseCode == 200) {
                    this.setState({
                        userList: resp.data.data.userList,
                        subCategoryList: resp.data.data.subCategorylist,
                        isLoading: false
                    })
                } else {
                    this.setState({ isLoading: false })
                    alert(resp.data.responseMessage)
                }
            })
    }

    sentInvite(id) {
        this.setState({ isLoading: true })
        let variables = {
            "sentRequestBy": this.state.userId,
            "sentRequestTo": id
        }
        return webservice(variables, "users/sendingFriendRequest", "POST")
            .then(resp => {

                if (resp.data.responseCode == 200) {
                    this.setState({ isLoading: false }, () => { Alert.alert('TOK', 'Friend Request has been sent successfully.', [{ text: 'OK', onPress: () => this.props.navigation.navigate('Home') }]) })

                } else {
                    this.setState({ isLoading: false }, () => { Alert.alert('TOK', resp.data.responseMessage, [{ text: 'OK', onPress: () => this.props.navigation.navigate('Home') }]) })
                }
            })

    }

    switchHeader(param) {
        this.setState({
            focus: param
        })
    }

    render() {
        return (

            <ImageBackground source={require('../image/Invite_friend/bg.png')} style={{ flex: 1 }}>
                <View style={[styles.commonContainer, { paddingTop: scaleHeight(50) }]}>
                    <Loader visible={this.state.isLoading} />
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', height: scaleHeight(50) }}>
                        <TouchableOpacity onPress={() => this.switchHeader("player")} style={{ justifyContent: 'center', alignItems: 'center', flex: 1, borderBottomWidth: 2, borderBottomColor: this.state.focus == "player" ? "red" : "grey" }}>
                            <Text style={{ marginLeft: scaleWidth(20), color: this.state.focus == "player" ? "red" : "grey" }}>Player</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.switchHeader("topic")} style={{ justifyContent: 'center', alignItems: 'center', flex: 1, borderBottomWidth: 2, borderBottomColor: this.state.focus == "topic" ? "red" : "grey" }}>
                            <Text style={{ marginLeft: scaleWidth(20), color: this.state.focus == "topic" ? "red" : "grey" }}>Topic</Text>
                        </TouchableOpacity>
                    </View>
                    {
                        this.state.focus == 'player' ?

                            <FlatList
                                style={{ width: '100%', backgroundColor: '#F5F5F5', }}
                                data={this.state.userList}
                                renderItem={({ item }) =>
                                    <View style={{ flex: 1, flexDirection: 'row', height: scaleHeight(80), justifyContent: 'space-between', marginHorizontal: scaleWidth(10), backgroundColor: 'white', borderRadius: 10, }}>
                                        <Image source={(item.avatar !== null || item.avatar === "") ? { uri: item.avatar } : avatar} style={{ flex: 1, height: scaleHeight(80), width: scaleWidth(80) }} />
                                        <View style={{ width: scaleWidth(180) }} >
                                            <Text style={{ flex: 2, fontSize: normalizeFont(18), paddingHorizontal: scaleWidth(5), marginTop: scaleHeight(5) }} numberOfLines={2}>{item.email}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => this.sentInvite(item._id)}
                                            style={{ flex: 1, right: scaleWidth(5), height: scaleHeight(30), width: 70, backgroundColor: '#D00E17', top: scaleHeight(20), borderRadius: 5, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#6E6E6E' }}
                                        >
                                            <Text style={{ color: 'white', fontWeight: '600', fontSize: normalizeFont(16), alignSelf: 'center', top: scaleHeight(5) }}>Invite</Text>
                                        </TouchableOpacity>
                                    </View>}
                                keyExtractor={(item, index) => index.toString()}
                            />

                            :
                            <FlatList
                                style={{ width: '100%', backgroundColor: '#F5F5F5', }}
                                data={this.state.subCategoryList}
                                renderItem={({ item }) => <View style={{
                                }}>
                                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: scaleHeight(10), marginHorizontal: scaleWidth(10), backgroundColor: 'white', borderRadius: 10, }}>
                                        <Image source={(item.imageUrl !== null || item.imageUrl === "") ? { uri: item.imageUrl } : avatar} style={{ height: scaleHeight(80), width: scaleWidth(80) }} />

                                        <Text style={{ fontSize: normalizeFont(18), marginTop: scaleHeight(5) }}>{item.subCategoryName}</Text>

                                        <TouchableOpacity style={{ right: scaleWidth(5), height: scaleHeight(30), width: 70, backgroundColor: '#D00E17', top: scaleHeight(20), borderRadius: 5, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#6E6E6E' }}
                                            onPress={() => {
                                                this.props.navigation.navigate('SelectMode', { subCategoryId: item._id, subCategoryName: item.subCategoryName, image: item.imageUrl })
                                                AsyncStorage.setItem('subCategoryId', item._id)
                                            }}
                                        >
                                            <Text style={{ color: 'white', fontWeight: '600', fontSize: normalizeFont(16), alignSelf: 'center', top: scaleHeight(5) }}>Play</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>}
                                keyExtractor={(item, index) => index.toString()}
                            />
                    }
                </View>
            </ImageBackground>

        )
    }
}
