import React, { Component } from 'react';
import {
  Animated, Easing, StyleSheet, ImageBackground,
  View, ListView, Text, TouchableOpacity, AsyncStorage,
  Image, Dimensions, ScrollView,
  FlatList, TextInput, BackHandler, ToastAndroid,
} from 'react-native';
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
import { MusicFunc } from '../components/common/SoundFunc';
import Alert from './profileModal';
import AnswerAlert from './answerModal';
import Loader from './loader';
import Graph from './graph';
import { userProfileData } from '../webService/ApiStore';
import webservice from '../webService/Api';
import Textellipsis from '../components/common/Textellipsis';

const { width } = Dimensions.get('window')
const defaultQuestionBG = require('../image/question/Question1.png')
const rightQuestionBG = require('../image/question/Green.png')
const wrongQuestionBG = require('../image/question/Red.png')
const back = require('../image/BackIcon/back-icon.png')
const defaultImage = require('../image/home/image.png')

export default class GameComplete extends Component {
  constructor(props) {
    super(props);
    this.animatedValue = new Animated.Value(0)
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      score: 0,
      status: false,
      feedback: '',
      logoutModal: false,
      answerModal: false,
      subCategoryId: null,
      questionArray: [],
      right: 0,
      wrong: 0,
      userId: '',
      name: "",
      country: "",
      state: "",
      win: "",
      lose: "",
      gameType: "",
      image: '',
      Avatar: null,
      userId: '',
      isLoading: false,
      myQuestions: [],
      selected_a: null,
      selected_b: null,
      selected_c: null,
      selected_d: null,
      index: '',
      graphData: null,
      currentQuesId: ''
    };
  }

  componentWillMount() {
    this.animate()
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    AsyncStorage.getItem('userId').then((id) => this.setState({ userId: JSON.parse(id) }))
    AsyncStorage.getItem('gameRoomId').then((id) => this.setState({ gameRoomId: JSON.parse(id) }))
    const { params } = this.props.navigation.state
    this.setState({
      // set required data
      score: params.gameObj.score1,
      subCategoryId: params.gameObj.subCategoryId,
      right: params.gameObj.right,
      wrong: params.gameObj.wrong,
      myQuestions: params.gameObj.myQuestions,
      selectedLanguage: params.gameObj.selectedLanguage,
      gameType: params.gameObj.gameType,
      otherUserId: params.gameObj.otherUserId,
      graphData: params.gameObj.graphArray,

      // set Profile data
      name: userProfileData.name,
      country: userProfileData.country,
      state: userProfileData.state,
      win: userProfileData.win,
      lose: userProfileData.lose,
      image: userProfileData.avatar,
    })

    MusicFunc('Game_Review_Music', 'play')
    setTimeout(() => {
      this.matchAnswers()
      this.setUserStatus()
    }, 500)
  }

  // ********************* handle Back Button **********************
  handleBackButton = () => {
    // ToastAndroid.show('You can not go back from this page using back button', ToastAndroid.SHORT);
    this.props.navigation.popToTop();
    return true;
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }


  // ************************* set user status false ****************************

  setUserStatus() {
    let variables = {
      "_id": this.state.userId,
      "status": "ONLINE"
    }
    return webservice(variables, "users/onlineFalse", "POST")
      .then((resp) => {
      })
  }

  animate() {
    this.animatedValue.setValue(0)
    Animated.timing(
      this.animatedValue,
      {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear
      }
    ).start(() => this.animate())
  }

  logoutModalOpen = (visible) => {
    this.setState({ logoutModal: !visible });
  }

  logoutModalClose = (visible) => {
    this.setState({ logoutModal: false })
  }

  ListViewItemSeparator = () => {
    return (
      <View
        style={{
          height: .5,
          width: "100%",
          backgroundColor: "#000",
        }}
      />
    );
  }

  GetListViewItem(rowData) {
    Alert.alert(rowData);
  }

  GoTo_top_function = () => {
    this.refs.ListView_Reference.scrollTo({ animated: true }, 0);
  }

  GoTo_bottom_function = () => {
    this.refs.ListView_Reference.scrollToEnd({ animated: true });
  }

  gameFeedback(quesId) {
    this.setState({ status: true, currentQuesId: quesId })
  }

  gameFeedbackDone() {
    this.setState({ status: false })
    let variables = {
      "quesId": this.state.currentQuesId,
      "userId": this.state.userId,
      "reason": this.state.feedback,
      "type": "topten"
    }
    return webservice(variables, "admin/reportQues", "POST")
      .then((resp) => {
        if (resp.data.responseCode === 200) {
          this.setState({ feedback: '' })
        }
        else if (resp.data.responseCode === 1000) {
          alert(resp.data.responseMessage)
        }
      })
  }

  answerModalOpen = (index) => {
    this.setState({ answerModal: true, index: index });
  }

  answerModalClose = (index) => {
    this.setState({ answerModal: false, index: index })
  }

  scrollFrom(event) {
  }

  onScroll = (event) => {
  }

  matchAnswers() {
    for (let i in this.state.myQuestions) {
      let { selectAnswer, correctAnswer } = this.state.myQuestions[i]
      if (selectAnswer && correctAnswer == "a") this.setState({ selected_a: true })
      else if (selectAnswer && correctAnswer == "b") this.setState({ selected_b: true })
      else if (selectAnswer && correctAnswer == "c") this.setState({ selected_c: true })
      else if (selectAnswer && correctAnswer == "d") this.setState({ selected_d: true })
    }
  }

  callback;
  static _dataRefresh(a) {
    callback = a
  }

  _onPressHome() {
    MusicFunc('Game_Review_Music', 'stop')
    if (this.disabled) return;
    this.disabled = true;
    setTimeout(() => {
      this.disabled = false;
    }, 500);
    this.props.navigation.navigate('Home')
  }

  _onPressTopics() {
    MusicFunc('Game_Review_Music', 'stop')
    if (this.disabled) return;
    this.disabled = true;
    setTimeout(() => {
      this.disabled = false;
    }, 500);
    this.props.navigation.navigate('Topics')
  }

  _onPressReplay() {
    MusicFunc('Game_Review_Music', 'stop')
    if (this.disabled) return;
    this.disabled = true;
    setTimeout(() => {
      this.disabled = false;
    }, 500);

    if (this.state.gameType === 'friend') {
      this._createGameRoom()
    }
    if (this.state.gameType === 'random') {
      callback();
      this.props.navigation.pop(4)
    }
    else {
      callback();
      this.props.navigation.pop(2)
    }
  }

  // ************************* create Game Room *****************************

  _createGameRoom() {
    let variables = {
      "sendRequestBy": this.state.userId,
      "gameType": "topten",
      "severity": "Easy",
      "categoryId": this.state.subCategoryId,
      "gameMode": "DULE",
      "sendRequestTo": this.state.otherUserId
    }
    return (
      webservice(variables, "users/createGameRoomtop10", "POST")
        .then((resp) => {
          if (resp.data.responseCode === 200) {
            AsyncStorage.setItem('gameRoomId', JSON.stringify(resp.data.data.gameId))
            this.props.navigation.navigate("LoaderDual", { requestType: "outgoing", data: { gamePlayType: 'topten' } })
          }
          else if (resp.data.responseCode === 1000) {
            alert(resp.data.responseMessage)
          }
        })
    )
  }

  render() {
    const top = this.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 300]
    })
    return (
      <View style={[styles.MainContainer, { bottom: scaleHeight(20) }]}>
        <Loader visible={this.state.isLoading} />
        <View style={{ paddingTop: scaleHeight(10) }}>
          <TouchableOpacity style={{ flexDirection: 'row', top: scaleHeight(12) }} onPress={() => this.props.navigation.navigate('TabNav')}>
            <Image source={back} style={{ width: scaleWidth(25), height: scaleHeight(25) }} />
            <Text style={{ fontSize: normalizeFont(20), fontWeight: 'bold', marginLeft: scaleWidth(5) }}>
              <Textellipsis mytextvar={this.state.name} maxlimit={15} ></Textellipsis>
            </Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', paddingTop: scaleHeight(5), marginVertical: scaleHeight(5) }}>
            <TouchableOpacity onPress={() => this.logoutModalOpen()} style={{ shadowColor: 'black', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.5, shadowRadius: 1, }}>
              <Image source={(this.state.image !== null || this.state.image === "") ? { uri: this.state.image } : profileImage} style={{ width: scaleWidth(90), height: scaleHeight(80), borderRadius: 10, borderColor: 'white', borderWidth: 5 }} resizeMode='contain' />
            </TouchableOpacity>
            <ImageBackground source={require('../image/Gameplay/Bluescroce.png')} style={{ alignSelf: 'center', left: scaleWidth(5) }} >
              <Text style={{ color: 'white', padding: 7, }}>{this.state.score}</Text>
            </ImageBackground>
          </View>
        </View>
        {this.state.logoutModal ?
          <Alert
            onRequestClose={() => this.logoutModalOpen(!this.state.logoutModal)}
            visible={this.state.logoutModal}
            cancelButton={() => this.setState({ logoutModal: false })}
            logoutModalClose={() => this.logoutModalClose(this.state.logoutModal)}
            image={this.state.image}
            name={this.state.name}
            country={this.state.country}
            states={this.state.states}
            win={this.state.win}
            lose={this.state.lose}
          /> : null}
        <View style={{ backgroundColor: '#BEBEBE', paddingVertical: scaleHeight(1), marginTop: scaleHeight(10) }}></View>
        {this.state.status == false ?
          <View style={{ flex: 1, }}>
            <View style={{ backgroundColor: '#BEBEBE', paddingVertical: scaleHeight(15), marginTop: scaleHeight(3), alignItems: 'center' }}>
              <Text style={{ fontWeight: '900', fontSize: normalizeFont(20), }}>Score  {this.state.score}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <ScrollView ref='ListView_Reference' keyboardShouldPersistTaps='always' showsVerticalScrollIndicator={false} onScroll={(event) => this.onScroll(event)}>
                <View style={{ width: '98%' }}>
                  <View style={{ alignItems: 'center', marginTop: scaleHeight(40) }}>
                    <Image source={require('../image/GameComplete/GameComplete.png')} />
                  </View>
                  <TouchableOpacity onPress={() => this._onPressHome()} style={{ marginTop: scaleHeight(30), marginHorizontal: scaleWidth(40), justifyContent: 'center', alignItems: 'center' }}>
                    <ImageBackground source={require('../image/select_mode/Duel.png')} style={{ width: width - scaleWidth(120), height: scaleHeight(60), justifyContent: 'center', alignItems: 'center' }} resizeMode='contain'>
                      <Text style={{ color: 'white', fontSize: normalizeFont(18), fontWeight: '900', justifyContent: 'center', alignSelf: 'center', alignItems: "center" }}>Home</Text>
                    </ImageBackground>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this._onPressTopics()} style={{ marginTop: scaleHeight(15), marginHorizontal: scaleWidth(40), justifyContent: 'center', alignItems: 'center' }}>
                    <ImageBackground source={require('../image/select_mode/sollo.png')} style={{ width: width - scaleWidth(120), height: scaleHeight(60), justifyContent: 'center', alignItems: 'center' }} resizeMode='contain'>
                      <Text style={{ color: 'white', fontSize: normalizeFont(18), fontWeight: '900', position: 'absolute', zIndex: 1, justifyContent: 'center' }}>Topics</Text>
                    </ImageBackground>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this._onPressReplay()} style={{ marginTop: scaleHeight(15), marginHorizontal: scaleWidth(40), justifyContent: 'center', alignItems: 'center' }}>
                    <ImageBackground source={require('../image/select_mode/group.png')} style={{ width: width - scaleWidth(120), height: scaleHeight(60), justifyContent: 'center', alignItems: 'center' }} resizeMode='contain'>
                      <Text style={{ color: 'white', fontSize: normalizeFont(18), fontWeight: '900', position: 'absolute', zIndex: 1, justifyContent: 'center' }}>Replay</Text>
                    </ImageBackground>
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: scaleHeight(50) }}>
                    <Text style={{ fontSize: normalizeFont(25), fontWeight: '500', color: 'green' }}>Correct:</Text>
                    <Text style={{ fontSize: normalizeFont(25), fontWeight: '500', color: 'black' }}> {this.state.right}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: scaleHeight(20) }}>
                    <Text style={{ fontSize: normalizeFont(25), fontWeight: '500', color: 'red', paddingLeft: scaleWidth(10) }}>Wrong :</Text>
                    <Text style={{ fontSize: normalizeFont(25), fontWeight: '500', color: 'black' }}> {this.state.wrong}</Text>
                  </View>

                  {this.state.graphData !== undefined ?
                    this.state.gameType == 'timed' ?
                      <View style={{ padding: scaleWidth(20) }}>
                        <View style={{ flexDirection: 'row' }}>
                          <View style={{ width: scaleWidth(15), height: scaleHeight(15), borderRadius: scaleWidth(7.5), backgroundColor: '#f47a41' }} />
                          <Text>Time taken</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                          <View style={{ width: scaleWidth(15), height: scaleHeight(15), borderRadius: scaleWidth(7.5), backgroundColor: '#42aaf4' }} />
                          <Text>Score for each question</Text>
                        </View>
                      </View>
                      : this.state.gameType == 'friend' || this.state.gameType == 'random' ?
                        <View style={{ padding: scaleWidth(20) }}>
                          <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: scaleWidth(15), height: scaleHeight(15), borderRadius: scaleWidth(7.5), backgroundColor: 'green' }} />
                            <Text>Time taken to answer Player 1</Text>
                          </View>
                          <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: scaleWidth(15), height: scaleHeight(15), borderRadius: scaleWidth(7.5), backgroundColor: 'skyblue' }} />
                            <Text>Score for each question Player 1</Text>
                          </View>
                          <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: scaleWidth(15), height: scaleHeight(15), borderRadius: scaleWidth(7.5), backgroundColor: 'red' }} />
                            <Text>Time taken to answer Player 2</Text>
                          </View>
                          <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: scaleWidth(15), height: scaleHeight(15), borderRadius: scaleWidth(7.5), backgroundColor: 'orange' }} />
                            <Text>Score for each question Player 2</Text>
                          </View>
                        </View> : null
                    : null}

                  {this.state.graphData !== undefined ?
                    <Graph styleBar={this.state.graphData} gameType={this.state.gameType} />
                    : null}

                  <FlatList
                    data={this.state.myQuestions}
                    renderItem={({ item, index }) =>
                      <View style={{ alignItems: 'center', marginHorizontal: scaleWidth(10), marginTop: scaleHeight(50), }}>
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={{ color: 'black', alignSelf: 'flex-start', fontSize: normalizeFont(18), fontWeight: '900', }}>{this.state.selectedLanguage == "English" ? 'Q. ' + (index + 1) : 'प्र. ' + (index + 1)} </Text>
                          <Text style={{ color: 'black', alignSelf: 'flex-start', fontSize: normalizeFont(18), fontWeight: '900', width: width - scaleWidth(60) }}>{this.state.selectedLanguage == "English" ? item.english.question : item.hindi.question}</Text>
                        </View>
                        {/* show question image */}
                        {item.image != '' ?
                          <View style={{ flexDirection: 'row', paddingHorizontal: scaleWidth(25) }}>
                            <View style={{ width: width - scaleWidth(160) }}>
                              <ImageBackground source={(item.selectAnswer === 'a' && item.correctAnswer === 'a') ? rightQuestionBG : item.correctAnswer === 'a' ? rightQuestionBG : item.selectAnswer === 'a' ? wrongQuestionBG : defaultQuestionBG} resizeMode='stretch' style={{ width: width - scaleWidth(160), height: scaleHeight(50), marginTop: scaleHeight(15), justifyContent: 'center', alignItems: 'center', }} >
                                <Text style={{ textAlign: 'center', color: 'black', fontSize: 16, fontWeight: '600', justifyContent: 'center', }}>{this.state.selectedLanguage == "English" ? item.english.a : item.hindi.a}</Text>
                              </ImageBackground>
                              <ImageBackground source={(item.selectAnswer === 'b' && item.correctAnswer === 'b') ? rightQuestionBG : item.correctAnswer === 'b' ? rightQuestionBG : item.selectAnswer === 'b' ? wrongQuestionBG : defaultQuestionBG} resizeMode='stretch' style={{ width: width - scaleWidth(160), height: scaleHeight(50), marginTop: scaleHeight(15), justifyContent: 'center', alignItems: 'center', }} >
                                <Text style={{ textAlign: 'center', color: 'black', fontSize: 16, fontWeight: '600', justifyContent: 'center', }}>{this.state.selectedLanguage == "English" ? item.english.b : item.hindi.b}</Text>
                              </ImageBackground>
                              <ImageBackground source={(item.selectAnswer === 'c' && item.correctAnswer === 'c') ? rightQuestionBG : item.correctAnswer === 'c' ? rightQuestionBG : item.selectAnswer === 'c' ? wrongQuestionBG : defaultQuestionBG} resizeMode='stretch' style={{ width: width - scaleWidth(160), height: scaleHeight(50), marginTop: scaleHeight(15), justifyContent: 'center', alignItems: 'center', }} >
                                <Text style={{ textAlign: 'center', color: 'black', fontSize: 16, fontWeight: '600', justifyContent: 'center', }}>{this.state.selectedLanguage == "English" ? item.english.c : item.hindi.c}</Text>
                              </ImageBackground>
                              <ImageBackground source={(item.selectAnswer === 'd' && item.correctAnswer === 'd') ? rightQuestionBG : item.correctAnswer === 'd' ? rightQuestionBG : item.selectAnswer === 'd' ? wrongQuestionBG : defaultQuestionBG} resizeMode='stretch' style={{ width: width - scaleWidth(160), height: scaleHeight(50), marginTop: scaleHeight(15), justifyContent: 'center', alignItems: 'center', }} >
                                <Text style={{ textAlign: 'center', color: 'black', fontSize: 16, fontWeight: '600', justifyContent: 'center', }}>{this.state.selectedLanguage == "English" ? item.english.d : item.hindi.d}</Text>
                              </ImageBackground>
                            </View>
                            <View style={{ backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', paddingHorizontal: scaleWidth(10) }}>
                              <Image source={(item.image != null || item.image != '') ? { uri: item.image } : defaultImage} resizeMode='contain' style={{ width: scaleWidth(120), height: scaleHeight(125) }} />
                            </View>
                          </View>
                          :
                          <View>
                            <View style={{ marginTop: scaleHeight(15), marginHorizontal: scaleWidth(40), justifyContent: 'center', alignItems: 'center', }}>
                              <Image source={(item.selectAnswer === 'a' && item.correctAnswer === 'a') ? rightQuestionBG : item.correctAnswer === 'a' ? rightQuestionBG : item.selectAnswer === 'a' ? wrongQuestionBG : defaultQuestionBG} style={{ position: 'relative' }} />
                              <Text style={{ color: 'black', fontSize: 16, fontWeight: '600', position: 'absolute', zIndex: 1, justifyContent: 'center', }}>{this.state.selectedLanguage == "English" ? item.english.a : item.hindi.a}</Text>
                            </View>
                            <View style={{ marginTop: scaleHeight(15), marginHorizontal: scaleWidth(40), justifyContent: 'center', alignItems: 'center' }}>
                              <Image source={(item.selectAnswer === 'b' && item.correctAnswer === 'b') ? rightQuestionBG : item.correctAnswer === 'b' ? rightQuestionBG : item.selectAnswer === 'b' ? wrongQuestionBG : defaultQuestionBG} style={{ position: 'relative' }} />
                              <Text style={{ color: 'black', fontSize: 16, fontWeight: '600', position: 'absolute', zIndex: 1, justifyContent: 'center', }}>{this.state.selectedLanguage == "English" ? item.english.b : item.hindi.b}</Text>
                            </View>
                            <View style={{ marginTop: scaleHeight(15), marginHorizontal: scaleWidth(40), justifyContent: 'center', alignItems: 'center' }}>
                              <Image source={(item.selectAnswer === 'c' && item.correctAnswer === 'c') ? rightQuestionBG : item.correctAnswer === 'c' ? rightQuestionBG : item.selectAnswer === 'c' ? wrongQuestionBG : defaultQuestionBG} style={{ position: 'relative' }} />
                              <Text style={{ color: 'black', fontSize: 16, fontWeight: '600', position: 'absolute', zIndex: 1, justifyContent: 'center', }}>{this.state.selectedLanguage == "English" ? item.english.c : item.hindi.c}</Text>
                            </View>
                            <View style={{ marginTop: scaleHeight(15), marginHorizontal: scaleWidth(40), justifyContent: 'center', alignItems: 'center' }}>
                              <Image source={(item.selectAnswer === 'd' && item.correctAnswer === 'd') ? rightQuestionBG : item.correctAnswer === 'd' ? rightQuestionBG : item.selectAnswer === 'd' ? wrongQuestionBG : defaultQuestionBG} style={{ position: 'relative' }} />
                              <Text style={{ color: 'black', fontSize: 16, fontWeight: '600', position: 'absolute', zIndex: 1, justifyContent: 'center', }}>{this.state.selectedLanguage == "English" ? item.english.d : item.hindi.d}</Text>
                            </View>
                          </View>}

                        {item.explanation !== ' ' ?
                          // <TouchableOpacity onPress={() => this.answerModalOpen(index)} style={{ flexDirection: 'row', marginHorizontal: scaleWidth(15), paddingVertical: scaleHeight(10), backgroundColor: 'lightgray', borderColor: 'red', marginTop: scaleHeight(10), borderWidth: 1, }}>
                          //   <Image source={require('../image/Result/i.png')} style={{ marginTop: 5, marginLeft: 3 }} />
                          //   <Text numberOfLines={3} style={{ fontSize: normalizeFont(18), fontWeight: '600', paddingHorizontal: scaleWidth(10) }}>{this.state.selectedLanguage == "English" ? item.english.explanation : item.hindi.explanation}</Text>
                          // </TouchableOpacity>
                          <TouchableOpacity onPress={() => this.answerModalOpen(index)}>
                            <View style={{ flexDirection: 'row', backgroundColor: 'lightgray', borderColor: 'red', width: width - scaleWidth(50), marginTop: scaleHeight(10), borderWidth: 1, marginLeft: 10, marginRight: 10, padding: 10 }}>
                              <Image source={require('../image/Result/i.png')} style={{ marginTop: 5, marginRight: 3 }} />
                              <Text numberOfLines={5} style={{ fontSize: normalizeFont(18), fontWeight: '600', marginRight: 10, width: width - scaleWidth(90) }}>{this.state.selectedLanguage == "English" ? item.english.explanation : item.hindi.explanation}</Text>
                            </View>
                          </TouchableOpacity>
                          : null}
                        <TouchableOpacity style={{ marginTop: scaleHeight(10), marginHorizontal: scaleWidth(40), justifyContent: 'center', alignItems: 'center' }} onPress={() => { this.gameFeedback(item._id), MusicFunc('Button_Click_Music') }}>
                          <Image source={require('../image/club/btn.png')} style={{ position: 'relative' }} />
                          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600', position: 'absolute', zIndex: 1, justifyContent: 'center', }}>Feedback</Text>
                        </TouchableOpacity>
                      </View>}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal={false}
                    paddingBottom={50}
                  />
                </View>
              </ScrollView>
            </View>
            <TouchableOpacity activeOpacity={0.5} onPress={this.GoTo_top_function} style={styles.topButton} >
              <Image source={require('../image/Gameplay/arrow_up.png')} style={styles.topButton_Image} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.5} onPress={this.GoTo_bottom_function} style={styles.bottomButton} >
              <Image source={require('../image/Gameplay/arrow.png')} style={styles.bottomButton_Image} />
            </TouchableOpacity>
            {this.state.answerModal ?
              <AnswerAlert
                title='OK'
                onRequestClose={() => { this.answerModalOpen(!this.state.answerModal) }}
                visible={this.state.answerModal}
                Next={() => this.setState({ answerModal: false })}
                explanation={this.state.selectedLanguage == "English" ? this.state.myQuestions[this.state.index].english.explanation : this.state.myQuestions[this.state.index].hindi.explanation}
                cancelButton={() => this.setState({ logoutModal: false })}
                answerModalClose={() => this.answerModalClose(this.state.answerModal)}
              /> : null}
          </View>
          :
          <View>
            <TextInput allowFontScaling={false}
              maxLength={200}
              value={this.state.feedback}
              multiline={true}
              onChangeText={(text) => this.setState({ feedback: text })}
              placeholderTextColor="gray"
              underlineColorAndroid="transparent"
              style={{
                fontSize: normalizeFont(16), color: "black", height: scaleHeight(150),
                fontWeight: '200', borderColor: 'lightgray', borderWidth: 2,
                marginTop: scaleHeight(20), marginHorizontal: scaleWidth(20),
                borderRadius: 5, borderBottomWidth: 1.5, borderBottomColor: 'gray',
                borderTopWidth: 1.5, borderTopColor: 'gray', paddingLeft: 5, fontWeight: '600'
              }}
              textAlignVertical="top"
              placeholder="Enter text...."
              autoFocus={true}
              returnKeyType='done'
            />
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: scaleHeight(30) }}>
              <TouchableOpacity style={{ marginVertical: scaleHeight(10), }} onPress={() => this.gameFeedbackDone()} >
                <ImageBackground
                  source={require('../image/welcome/btn2.png')}
                  style={{ width: scaleWidth(80), height: scaleHeight(40), justifyContent: 'center', alignItems: 'center' }}
                  resizeMode='stretch'
                >
                  <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: scaleHeight(8), color: 'white', fontWeight: '800', fontSize: normalizeFont(17) }}>Submit</Text>
                </ImageBackground>
              </TouchableOpacity>
            </View>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity style={{ marginVertical: scaleHeight(10), }} onPress={() => this.setState({ status: false, feedback: '' })}>
                <ImageBackground
                  source={require('../image/welcome/btn2.png')}
                  style={{ width: scaleWidth(80), height: scaleHeight(40), justifyContent: 'center', alignItems: 'center' }}
                  resizeMode='stretch'
                >
                  <Text style={{ color: 'white', fontWeight: '800', fontSize: normalizeFont(17), textAlign: 'center' }}>Close</Text>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          </View>}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
  },
  rowViewContainer: {
    fontSize: 18,
    paddingRight: scaleWidth(10),
    paddingTop: scaleHeight(10),
    paddingBottom: scaleHeight(10),
  },
  topButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    right: scaleWidth(5),
    bottom: scaleHeight(75),
  },
  topButton_Image: {
    resizeMode: 'contain',
    width: 30,
    height: 30,
  },
  bottomButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    right: scaleWidth(5),
    bottom: scaleHeight(38),
  },
  bottomButton_Image: {
    resizeMode: 'contain',
    width: 30,
    height: 30,
  }
});
