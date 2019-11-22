import React, { Component } from 'react';
import {
    Text,
    View, Dimensions,
    ImageBackground,
    Platform,
    ScrollView, Alert,
    TouchableOpacity,
    Image, FlatList, KeyboardAvoidingView, AsyncStorage,
} from 'react-native';
import styles from '../components/styles/styles'
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import { MusicFunc } from '../components/common/SoundFunc';
import SearchModal from './searchTopicModal';
import QuitModal from './quitModal';
import webservice from '../webService/Api';
import { userProfileData } from '../webService/ApiStore'
import Loader from './loader';

const { width, height } = Dimensions.get('window');
const avatar = require('../image/create/default.png')

const Header = props => (
    <View style={{ flex: 1, justifyContent: 'flex-start', paddingTop: scaleHeight(8) }}>
        <Text style={{ color: 'white', fontSize: normalizeFont(22) }}>{props.title}</Text>
    </View>
);

const HeaderBack = ({ navigation, props }) => (
    <TouchableOpacity onPress={() => { navigation.goBack(null), MusicFunc('Button_Click_Music') }}
        style={{ flex: 0.5, justifyContent: 'flex-start', paddingTop: scaleHeight(10) }}>
        <Image source={require('../image/BackIcon/back-icon.png')} style={{ tintColor: 'white' }} />
    </TouchableOpacity>
);

const FooterSelectTopic = ({ onPress, seachModal }, props) => (
    <View style={{ backgroundColor: 'white' }}>
        <View style={{ backgroundColor: 'transparent', height: scaleHeight(25), alignItems: "center", justifyContent: "space-around", flexDirection: 'row', marginVertical: 10 }}>
            <TouchableOpacity onPress={seachModal}>
                <View style={{ backgroundColor: '#D00E17', borderRadius: 10, width: scaleWidth(260), height: scaleHeight(25), justifyContent: 'center' }}>
                    <Text style={{ color: 'white', marginLeft: scaleWidth(15), fontWeight: "bold" }}>Search Topics</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={{ right: scaleWidth(5), alignSelf: 'center' }} onPress={onPress}>
                <Image source={require('../image/select_topic/done.png')} />
            </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: '#D2D2D2', width: width, height: 1, marginTop: scaleHeight(8) }}></View>
    </View>
);

const ImageHeaderSelectTopic = props => {
    return (
        <ImageBackground
            style={{ width, height: Platform.OS == 'ios' ? scaleHeight(45) : scaleHeight(50), position: 'absolute', top: 0, left: 0 }}
            source={require("../image/Reset_Password/header.png")}
            resizeMode="cover"
        >
            <View style={{ paddingLeft: scaleWidth(10), flexDirection: 'row', height: scaleHeight(45), backgroundColor: 'transparent' }}>
                <HeaderBack {...props} style={{ backgroundColor: 'transparent' }} />
                <Header {...props} style={{ backgroundColor: 'transparent' }} />
            </View>
            <FooterSelectTopic {...props} style={{ backgroundColor: 'transparent' }} />
        </ImageBackground>
    );
}

export default class SelectTopics extends Component {
    static navigationOptions = ({ navigation }) => {
        let params = navigation.state.params || {};
        return {
            tabBarVisible: false,
            header: props => <ImageHeaderSelectTopic {...props} title='Select Topics' onPress={() => params.selectTopics()} seachModal={() => params.displaySearchModal()} />,
        }

    }
    constructor(props) {
        super(props);
        this.state = {
            logoutModal: false,
            topicData: null,
            selectedTopics: [],
            itemChecked: false,
            userId: null,
            isLoading: false,
            visible: false,
            conformationModal: false,
            topicName: "",
            TopicId: "",
            isSelectedTopics: userProfileData.interests,
            gridView: false,
            gridData: [],
            slideNum: 1
        }
    }

    componentDidMount() {
        this.setState({ isLoading: true })
        this.props.navigation.setParams({ selectTopics: this.selectTopics, displaySearchModal: this.displaySearchModal });
        AsyncStorage.getItem('userId')
            .then((res) => {
                let userId = JSON.parse(res)
                this.setState({ userId: userId })
            })
        this.topicList()
    }

    topicList() {
        let variables = {}, gridData = []
        return webservice(variables, "users/viewCategoryAndSubCategory", "GET")
            .then(resp => {
                this.setState({ isLoading: false })
                if (resp.data.responseCode === 200) {
                    console.log("adsdfasd ", resp.data.data)
                    for (let i in resp.data.data) {
                        var array = resp.data.data
                        array.sort(this.GetSortOrder("category"));  //Pass the attribute to be sorted on 
                        for (let j in resp.data.data[i].subcategory) {
                            resp.data.data[i].subcategory[j]["check"] = false
                            gridData.push(resp.data.data[i].subcategory[j])
                        }
                    }
                    gridData.sort(this.GetSortOrder("subCategoryName"))
                    this.setState({ topicData: resp.data.data, gridData: gridData })
                }
                else if (resp.data.responseCode === 400) {
                    Alert.alert('TOK', resp.data.responseMessage, [{ text: 'Cancel' }, { text: 'OK' },])
                }
                else if (resp.data.responseCode === 1000) {
                    this.setState({ isLoading: false }, () => alert(resp.data.responseMessage))
                }
            })
    }

    GetSortOrder(prop) {
        return function (a, b) {
            if (a[prop] > b[prop]) {
                return 1;
            } else if (a[prop] < b[prop]) {
                return -1;
            }
            return 0;
        }
    }

    GetSortOrder(prop) {
        return function (a, b) {
            if (a[prop] > b[prop]) {
                return 1;
            } else if (a[prop] < b[prop]) {
                return -1;
            }
            return 0;
        }
    }

    selectTopics = (id) => {
        this.setState({ isLoading: true })
        let variables = {
            "interest": id ? [id] : this.state.selectedTopics
        }
        let { userId } = this.state
        return webservice(variables, "users/completeSignup/" + userId, "POST")
            .then(resp => {
                this.setState({ isLoading: false })
                if (resp.data.responseCode === 200) {
                    let topics = { "showTopics": "Yes" }
                    AsyncStorage.setItem('showTopics', JSON.stringify(topics));
                    this.props.navigation.navigate("TabNav");
                }
                else if (resp.data.responseCode === 400) {
                    Alert.alert('TOK', resp.data.responseMessage, [{ text: 'Cancel' }, { text: 'OK' }])
                }
                else if (resp.data.responseCode === 1000) {
                    alert(resp.data.responseMessage)
                }
            })
    }

    _addTopic(item) {
        this.setState({
            visible: false,
            conformationModal: true,
            topicName: item.subCategoryName,
            TopicId: item._id
        })
    }

    sendSubCategoryId(id, index, i) {
        let { topicData, isSelectedTopics } = this.state
        let valueCheck = topicData[index].subcategory[i]
        valueCheck.check = !valueCheck.check
        let { selectedTopics } = this.state
        var index = -1
        if (isSelectedTopics !== undefined && isSelectedTopics.length > 0 && isSelectedTopics.find(x => x._id === id)) {
            let key = isSelectedTopics.findIndex(x => x._id === id)
            this.props.navigation.navigate('SelectMode', { subCategoryId: isSelectedTopics[key]._id, subCategoryName: isSelectedTopics[key].subCategoryName, image: isSelectedTopics[key].imageUrl, name: this.state.name, gamePlayType: 'topten' })
            // this.props.navigation.navigate('SelectMode', { gamePlayType: "topten" })
            // this.props.navigation.navigate('SelectMode', { subCategoryId: item._id, subCategoryName: item.subCategoryName, image: item.imageUrl, name: this.state.name, gamePlayType: 'topten' }),
        }
        else {
            if (selectedTopics.length > 0) {
                index = selectedTopics.findIndex((x) => x == id)
                if (index == -1) {
                    selectedTopics.push(id)
                }
            }
            else if (selectedTopics.length == 0) {
                selectedTopics.push(id)
            }
            this.setState({ selectedTopics, topicData })
        }
    }

    logoutModalOpen = (visible) => {
        this.setState({ logoutModal: !visible });
    }
    logoutModalClose = (visible) => {
        this.setState({ logoutModal: false })
    }

    displaySearchModal = () => {
        this.setState({ visible: true })
    }

    _goSearch(text) {
        this.setState({ searchText: text })
        let { topicData } = this.state
        let target = topicData
        result = []
        for (let i = 0; i < target.length; i++) {

            for (let j = 0; j < target[i].subcategory.length; j++) {
                if (text == "") {
                    this.setState({ result: null })
                }
                else if (target[i].subcategory[j].subCategoryName.trim().indexOf(text) != -1) {
                    result.push(target[i].subcategory[j])
                }
                this.setState({ result: result })
            }
        }
    }

    renderTopicList = (item, index) => {
        return (
            <View style={{ backgroundColor: 'transparent', }}>
                <Loader visible={this.state.isLoading} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#ACACAC', marginTop: scaleHeight(10), paddingVertical: scaleHeight(5) }}>
                    <View style={{ flexDirection: 'row', marginLeft: scaleWidth(15), justifyContent: 'space-between', alignItems: 'center' }}>
                        <Image source={(item.imageUrl !== null || item.imageUrl === "") ? { uri: item.imageUrl } : avatar} style={{ height: scaleHeight(30), width: scaleWidth(30), }} />
                        <Text style={{ fontWeight: '800', fontSize: normalizeFont(18), marginLeft: scaleWidth(5) }}>{item.category}</Text>
                    </View>
                    <TouchableOpacity onPress={() => this.setState({ gridView: !this.state.gridView, slideNum: 3 })} >
                        <Image source={require('../image/home/menu.png')} style={{ marginRight: scaleWidth(15), marginTop: scaleHeight(5) }} />
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                    {item.subcategory.map((data, i) => {
                        return (
                            <TouchableOpacity key={i}>
                                {data.check == true ?
                                    <Image source={require('../image/check.png')} style={{ zIndex: 1, position: 'absolute', left: scaleWidth(90), top: 10 }} />
                                    : null}
                                <TouchableOpacity key={i} onPress={() => { this.sendSubCategoryId(data._id, index, i), MusicFunc('Button_Click_Music') }}
                                    style={{ height: scaleHeight(100), width: scaleWidth(100), flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: scaleHeight(10), marginHorizontal: scaleWidth(20), padding: scaleWidth(2.5), shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.5, shadowRadius: 1, }}>
                                    <Image source={{ uri: data.imageUrl }} style={{
                                        width: scaleWidth(90), height: scaleHeight(80), borderRadius: 10, borderColor: 'white', borderWidth: 5,
                                    }} resizeMode="stretch" />
                                </TouchableOpacity>
                                <Text style={{ fontSize: normalizeFont(16), color: 'black', alignSelf: 'center' }}>{data.subCategoryName}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View >
        )
    }

    renderTopicGrid = (item, index) => {
        return (
            <View>
                <TouchableOpacity onPress={() => { this._onSelectTopic(item._id, item.subCategoryName, item.imageUrl), MusicFunc('Button_Click_Music'), AsyncStorage.setItem('subCategoryId', item._id) }}
                    style={{ height: scaleHeight(100), width: scaleWidth(80), flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: scaleHeight(10), marginHorizontal: scaleWidth(20), shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.5, shadowRadius: 1, }}>
                    <Image source={(item.imageUrl !== null || item.imageUrl === "") ? { uri: item.imageUrl } : avatar}
                        style={{ width: scaleWidth(90), height: scaleHeight(80), borderRadius: 10, borderColor: 'white', borderWidth: 5, }} />
                </TouchableOpacity>
                <Text style={{ fontSize: normalizeFont(16), color: 'black', alignSelf: 'center' }}>{item.subCategoryName}</Text>
            </View>
        )
    }

    render() {
        return (
            <ImageBackground source={require('../image/Invite_friend/bg.png')} style={{ flex: 1 }} >
                <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                    <QuitModal
                        visible={this.state.conformationModal}
                        message={"Are you sure you want to Select " + this.state.topicName + " Topic?"}
                        Yes={() => { this.selectTopics(this.state.TopicId), this.setState({ conformationModal: false }) }}
                        No={() => this.setState({ conformationModal: false })}
                    />
                    <Loader visible={this.state.isLoading} />
                    <SearchModal
                        visible={this.state.visible}
                        countries={this.state.result}
                        onChangeText={(text) => this._goSearch(text)}
                        onRequestClose={!this.state.visible}
                        closeModal={!this.state.visible}
                        countryModalClose={() => { this.setState({ visible: false, result: null }) }}
                        placeholder="Search Topics"
                        renderItem={({ item, index }) =>
                            <View style={[{
                                backgroundColor: '#FFFFFF', overflow: 'hidden', width: '100%', flexDirection: 'row', height: scaleHeight(40), alignItems: "center"
                            },
                            this.state.searchText != '' ? { borderRadius: 5, borderWidth: 0.5, borderColor: 'red' } : null]}>
                                <Image source={(item.imageUrl !== null || item.imageUrl === "") ? { uri: item.imageUrl } : avatar} style={{ height: scaleHeight(30), width: scaleWidth(30), marginLeft: scaleWidth(10), borderRadius: 5 }} />
                                <TouchableOpacity onPress={() => this._addTopic(item)}>
                                    <Text style={{ color: "black", fontSize: normalizeFont(14), marginLeft: scaleWidth(10), marginVertical: scaleHeight(5) }}>{item.subCategoryName}</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />

                    <ScrollView keyboardShouldPersistTaps='always' style={[styles.commonContainer, { paddingTop: Platform.OS == 'ios' ? scaleHeight(95) : scaleHeight(85) }]}>
                        <FlatList
                            style={{ width: '100%' }}
                            showsHorizontalScrollIndicator={false}
                            data={this.state.gridView ? this.state.gridData : this.state.topicData}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }) => this.state.gridView ? this.renderTopicGrid(item, index) : this.renderTopicList(item, index)}
                            extraData={this.state}
                            key={this.state.slideNum}
                            numColumns={this.state.slideNum}
                        />
                        <View style={{ height: scaleHeight(110) }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </ImageBackground>
        )
    }
}