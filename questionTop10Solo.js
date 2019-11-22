import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Easing,
  Animated,
  AsyncStorage,
  Modal,
  BackHandler,
  ToastAndroid,
  AppRegistry
} from "react-native";
import * as Animatable from "react-native-animatable";
import {
  scaleWidth,
  scaleHeight,
  normalizeFont
} from "../components/common/Responsive";
import { MusicFunc } from "../components/common/SoundFunc";
import ProfileModal from "./profileModal";
import AnswerModal from "./answerModal";
import QuitModal from "./quitModal";
import webservice from "../webService/Api";
import Loader from "./loader";

import CustomAlert from "./clubAlert";
import Textellipsis from "../components/common/Textellipsis";

const { width, height } = Dimensions.get("window");
const defaultQuestionBG = require("../image/question/Question1.png");
const rightQuestionBG = require("../image/question/Green.png");
const wrongQuestionBG = require("../image/question/Red.png");
const back = require("../image/BackIcon/back-icon.png");
const greyDot = require("../image/question/greyDot.png");
const redDot = require("../image/question/redDot.png");
const greenDot = require("../image/question/greenDot.png");
const profileImage = require("../image/user.png");
let correctAnswer, questionList;

export default class QuestionTop10Solo extends Component {
  disabled = false;
  constructor(props) {
    super(props);
    this.state = {
      onCheckedAnswer: false,
      subCategoryId: null,
      questionArray: [],
      modalVisible: false,
      quitModal: false,
      selectedLanguage: "English",
      gameType: "practice",
      index: 0,
      right: false,
      wrong: false,
      rightCount: 0,
      wrongCount: 0,
      selected_a: null,
      selected_b: null,
      selected_c: null,
      selected_d: null,
      score1: 0,
      timeRemaining: 10,
      bonus: "",
      userId: "",
      name: "",
      country: "",
      state: "",
      win: "",
      lose: "",
      image: "",
      questionImage: "",
      Avatar: null,
      isLoading: false,
      gameRoomId: "",
      oneTimeClick: true,
      lock: false,
      isQuesImg: false,
      winStatus: false,
      graphArray: [
        {
          Player1: []
        }
      ],
      warningAlert: false,
      warningAlertMessage: ""
    };
    this.animatedValue0 = new Animated.Value(0);
    this.animatedValue1 = new Animated.Value(0);
    this.animatedValue2 = new Animated.Value(0);
    this.animatedValue3 = new Animated.Value(0);
    this.animatedValue4 = new Animated.Value(0);
    this.animatedValue5 = new Animated.Value(0);
    this.animatedValue6 = new Animated.Value(0);
    this.animatedValue7 = new Animated.Value(0);
  }
  componentDidMount() {
    this.setState({ isLoading: true });
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);

    //  ******************** get gameType ********************

    let type = this.props.navigation.state.params.type;
    if (type.playGameWith === "friend" || type === "friend")
      this.setState({ gameType: "timed", playGameWith: "friend" });
    else this.setState({ gameType: type });
    // this.animate()       // line 358

    //  ******************** get userId ********************

    AsyncStorage.getItem("userId").then(id => {
      this.setState({ userId: JSON.parse(id) });
    });
    setTimeout(() => {
      this.viewProfile();
    }, 500);

    //  ******************** get gameRoomId ********************

    AsyncStorage.getItem("gameRoomId").then(res => {
      this.setState({ gameRoomId: JSON.parse(res) });
    });

    //  ******************** get subCategoryId ********************

    AsyncStorage.getItem("subCategoryId").then(id => {
      this.setState({ subCategoryId: id });
    });

    setTimeout(() => {
      MusicFunc("Question_Appear_Music");
      this.setUserStatus();
      this.getQuestions(this.state.subCategoryId);
    }, 1000);

    setTimeout(() => {
      MusicFunc("Option_Appear_Music");
    }, 2000);

    //  ******************** get language ********************

    AsyncStorage.getItem("language").then(lang => {
      if (lang == null) {
        this.setState({ selectedLanguage: "English" });
      } else {
        this.setState({ selectedLanguage: lang });
      }
    });

    //  ******************** start the timer ********************

    this.timer(); // line 359
  }

  // ********************* handle Back Button **********************
  handleBackButton = () => {
    // ToastAndroid.show('You can not go back from this page using back button', ToastAndroid.SHORT);
    this.setState({ quitModal: true });
    return true;
  };

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  viewProfile = () => {
    let variables = {
      userId: this.state.userId
    };
    return webservice(variables, "users/viewProfile", "POST").then(resp => {
      if (resp.data.responseCode === 200) {
        this.setState({
          name: resp.data.data[0].name,
          country: resp.data.data[0].country,
          state: resp.data.data[0].state,
          win: resp.data.data[0].win,
          lose: resp.data.data[0].lose,
          image: resp.data.data[0].avatar,
          isLoading: false
        });
      } else {
        this.setState({ isLoading: false });
      }
    });
  };

  logoutModalOpen = visible => {
    this.setState({ logoutModal: !visible });
  };

  logoutModalClose = visible => {
    this.setState({ logoutModal: false });
  };

  timer() {
    setTimeout(() => {
      if (this.state.gameType == "timed") {
        setTimeout(() => {
          MusicFunc("Clock_Tik_Music");
        }, 1000);
        if (this.state.timeRemaining !== 0)
          this.interval = setInterval(() => {
            this.tick();
          }, 1000);
      }
    }, 4000);
  }

  //  ******************** timer function ********************

  tick() {
    let { questionArray } = this.state;
    let checkAns = this.state.questionArray[this.state.index];
    if (this.state.timeRemaining == 0) {
      MusicFunc("Clock_Tik_Music", "stop");
      if (this.state.onCheckedAnswer == false) {
        if (correctAnswer == "a") {
          this.setState({ selected_a: true, right: true });
          checkAns.value = "red";
          MusicFunc("Right_Answer_Music");
          setTimeout(() => {
            this.nextQuestion();
          }, 1000);
        } else if (correctAnswer == "b") {
          this.setState({ selected_b: true, right: true });
          checkAns.value = "red";
          MusicFunc("Right_Answer_Music");
          setTimeout(() => {
            this.nextQuestion();
          }, 1000);
        } else if (correctAnswer == "c") {
          this.setState({ selected_c: true, right: true });
          checkAns.value = "red";
          MusicFunc("Right_Answer_Music");
          setTimeout(() => {
            this.nextQuestion();
          }, 1000);
        } else if (correctAnswer == "d") {
          this.setState({ selected_d: true, right: true });
          checkAns.value = "red";
          MusicFunc("Right_Answer_Music");
          setTimeout(() => {
            this.nextQuestion();
          }, 1000);
        }
        setTimeout(() => {
          clearInterval(this.interval);
        }, 500);
      }
      clearInterval(this.interval);
      return;
    } else {
      if (!this.state.onCheckedAnswer) {
        this.disabled = false;
        this.setState({
          timeRemaining: this.state.timeRemaining - 1,
          lock: false
        });
      }

      if (this.state.modalVisible == true) {
        var remainingTime = this.state.timeRemaining;
        this.setState({ remainingTime: remainingTime });
      }
    }
  }

  //  ******************** animation functions ********************

  animate() {
    this.animatedValue0.setValue(0);
    this.animatedValue1.setValue(0);
    this.animatedValue2.setValue(0);
    this.animatedValue3.setValue(0);
    this.animatedValue4.setValue(0);
    this.animatedValue5.setValue(0);
    this.animatedValue6.setValue(0);
    this.animatedValue7.setValue(0);
    const createAnimation = (value, duration, easing, delay = 0) => {
      return Animated.timing(value, {
        toValue: 1,
        duration,
        easing,
        delay
      });
    };
    Animated.parallel([
      createAnimation(this.animatedValue1, 2000, Easing.ease),
      createAnimation(this.animatedValue0, 1000, Easing.ease, 2000),
      createAnimation(this.animatedValue2, 1000, Easing.ease, 2000),
      createAnimation(this.animatedValue3, 1000, Easing.ease, 2000),
      createAnimation(this.animatedValue4, 1000, Easing.ease, 2000),
      createAnimation(this.animatedValue5, 1000, Easing.ease, 2000),
      createAnimation(this.animatedValue6, 1000, Easing.ease, 3500),
      createAnimation(this.animatedValue7, 1000, Easing.ease, 4000)
    ]).start();
  }

  fadeOutLeft = answer => {
    debugger;
    if (this.state.gameType == "timed") {
      this.clock
        .fadeOutLeft(1000)
        .then(endState => (endState.finished ? this.zoomIn(answer) : null));
    } else {
      this.updateScore(answer);
    }
  };

  zoomIn = answer => {
    this.setState({ bonus: this.state.timeRemaining }, () =>
      this.plus
        .zoomIn(500)
        .then(endState =>
          endState.finished
            ? this.plus
                .fadeOutLeft(1000)
                .then(endState =>
                  endState.finished ? this.updateScore(answer) : null
                )
            : null
        )
    );
  };
  bounce = () =>
    this.score.shake(500).then(endState =>
      endState.finished
        ? setTimeout(() => {
            this.nextQuestion();
          }, 1000)
        : null
    );

  reset() {
    if (this.state.gameType === "timed") {
      this.clock.pulse();
      this.plus.pulse();
      this.score.pulse();
    }
  }

  // ************************* set user status false ****************************

  setUserStatus() {
    let variables = {
      _id: this.state.userId,
      status: "BUSY"
    };
    return webservice(variables, "users/onlineFalse", "POST").then(resp => {});
  }

  //  ******************** get the questions using gameRoomId ********************

  getQuestions(id) {
    this.setState({ isLoading: true });
    let variables = {
      gameRoomId: this.state.gameRoomId
    };
    let lang = this.state.selectedLanguage.toLowerCase();
    return webservice(variables, "topten/getQuestionByRoomID", "POST").then(
      resp => {
        console.log("Question =>> ", JSON.stringify(resp.data.data));
        if (resp.data.responseCode === 200) {
          for (let i in resp.data.data) {
            if (!resp.data.data[1][lang].hasOwnProperty("question")) {
              this.setState({
                warningAlert: true,
                warningAlertMessage: `No questions found in ${
                  this.state.selectedLanguage
                } language`
              });
              clearInterval(this.interval);
              break;
            }
            this.animate();
            resp.data.data[i]["selectAnswer"] = "";
            resp.data.data[i]["value"] = "";
            // this.animate()
            // this.timer()
          }
          this.setState({
            questionArray: resp.data.data,
            isLoading: false,
            questionImage: resp.data.data[0].image
          });
          resp.data.data[0].image == ""
            ? this.setState({ isQuesImg: false })
            : this.setState({ isQuesImg: true });
        } else if (resp.data.responseCode === 400) {
          this.setState({ isLoading: false });
          alert("400--" + resp.data.responseMessage);
        }
      }
    );
  }

  //  ******************** check the selected Answer ********************

  onCheckedAnswer(answer) {
    MusicFunc("Clock_Tik_Music", "stop");
    if (this.disabled) return;
    this.disabled = true;
    let checkAns = this.state.questionArray[this.state.index];
    let correctAnswer = this.state.questionArray[this.state.index]
      .correctAnswer;
    if (this.state.oneTimeClick) {
      if (answer === "a") {
        if (correctAnswer === answer) {
          MusicFunc("Right_Answer_Music");
          checkAns.value = "green";
          this.setState({ selected_a: true, oneTimeClick: false });
          // this.updateScore(answer)
          this.fadeOutLeft(answer);
        } else {
          this.setState({ selected_a: false, oneTimeClick: false });
          this.updateScore(answer);
          setTimeout(() => {
            if (this.state.gameType === "timed") this.nextQuestion();
          }, 1000);
          MusicFunc("Wrong_Answer_Music");
          checkAns.value = "red";
        }
        clearInterval(this.interval);
        // setTimeout(() => {
        //     // if (this.state.gameType === 'timed') this.nextQuestion()
        // }, 1000)
      } else if (answer === "b") {
        if (correctAnswer === answer) {
          MusicFunc("Right_Answer_Music");
          checkAns.value = "green";
          this.setState({ selected_b: true, oneTimeClick: false });
          // this.updateScore(answer)
          this.fadeOutLeft(answer);
        } else {
          MusicFunc("Wrong_Answer_Music");
          this.setState({ selected_b: false, oneTimeClick: false });
          this.updateScore(answer);
          setTimeout(() => {
            if (this.state.gameType === "timed") this.nextQuestion();
          }, 1000);
          checkAns.value = "red";
        }
        clearInterval(this.interval);
        // setTimeout(() => {
        //     // if (this.state.gameType === 'timed') this.nextQuestion()
        // }, 1000)
      } else if (answer === "c") {
        if (correctAnswer === answer) {
          MusicFunc("Right_Answer_Music");
          checkAns.value = "green";
          this.setState({ selected_c: true, oneTimeClick: false });
          // this.updateScore(answer)
          this.fadeOutLeft(answer);
        } else {
          MusicFunc("Wrong_Answer_Music");
          this.setState({ selected_c: false, oneTimeClick: false });
          this.updateScore(answer);
          setTimeout(() => {
            if (this.state.gameType === "timed") this.nextQuestion();
          }, 1000);
          checkAns.value = "red";
        }
        clearInterval(this.interval);
        // setTimeout(() => {
        //     // if (this.state.gameType === 'timed') this.nextQuestion()
        // }, 1000)
      } else if (answer === "d") {
        if (correctAnswer === answer) {
          MusicFunc("Right_Answer_Music");
          checkAns.value = "green";
          this.setState({ selected_d: true, oneTimeClick: false });
          // this.updateScore(answer)
          this.fadeOutLeft(answer);
        } else {
          MusicFunc("Wrong_Answer_Music");
          this.setState({ selected_d: false, oneTimeClick: false });
          this.updateScore(answer);
          setTimeout(() => {
            if (this.state.gameType === "timed") this.nextQuestion();
          }, 1000);
          checkAns.value = "red";
        }
        clearInterval(this.interval);
        // setTimeout(() => {
        //     // if (this.state.gameType === 'timed') this.nextQuestion()
        // }, 1000)
      }
      if (correctAnswer == "a") {
        this.setState({ selected_a: true, right: true });
      } else if (correctAnswer == "b") {
        this.setState({ selected_b: true, right: true });
      } else if (correctAnswer == "c") {
        this.setState({ selected_c: true, right: true });
      } else if (correctAnswer == "d") {
        this.setState({ selected_d: true, right: true });
      }
      let { questionArray } = this.state;
      let selectAns = questionArray[this.state.index];
      selectAns.selectAnswer = answer;
      this.setState({ questionArray });
      setTimeout(() => {
        if (this.state.gameType === "practice") {
          questionList.explanation === " "
            ? this.nextQuestion()
            : this.setState({ modalVisible: true });
        }
      }, 500);
    }
  }

  updateScore(answer) {
    debugger
    if (this.state.timeRemaining != 0) {
      if (answer == correctAnswer) {
        this.state.gameType == "practice"
          ? this.setState({
              score1: this.state.score1 + 10,
              rightCount: this.state.rightCount + 1
            })
          : this.state.gameType == "timed"
          ? this.setState(
              {
                score1: this.state.score1 + 10 + this.state.timeRemaining,
                rightCount: this.state.rightCount + 1
              },
              () => this.bounce()
            )
          : null;
      } else {
        this.setState({ wrongCount: this.state.wrongCount + 1 });
      }
      // ~~~~~~~~~~~ store Graph Data ~~~~~~~~~~~~~~

      let graphData = {};
      graphData = {
        score1: answer === correctAnswer ? 10 : 0,
        timeRemaining1: this.state.timeRemaining
      };
      this.state.graphArray[0].Player1.push(graphData);
    }
  }

  answerModalClose() {
    this.setState({ modalVisible: false });
  }

  nextQuestion() {
    this.setState({ modalVisible: false, oneTimeClick: true });
    let { index, questionArray } = this.state;
    index++;
    this.reset();
    if (index <= questionArray.length - 1) {
      this.setState({ index, questionImage: questionArray[index].image });
      this.timer();
      this.animate();
      setTimeout(() => {
        MusicFunc("Question_Appear_Music");
      }, 1000);
      setTimeout(() => {
        MusicFunc("Option_Appear_Music");
      }, 2000);
      setTimeout(() => {
        if (this.state.gameType != "timed") this.disabled = false;
      }, 2500);
    } else {
      setTimeout(() => {
        this._gameResults();
      }, 500);
    }
    this.setState({
      selected_a: null,
      selected_b: null,
      selected_c: null,
      selected_d: null,
      timeRemaining: 10,
      bonus: ""
    });
  }

  // ********************* game Results (win/lose) *************************

  _gameResults() {
    if (this.state.score1 > 60) {
      this.setState({ winStatus: true });
    }
    setTimeout(() => {
      this._saveGameHistory();
    }, 500);
  }

  _saveGameHistory() {
    this.setState({ lock: false, isLoading: true });
    MusicFunc("Clock_Tik_Music", "stop");
    let gameObj = {
      score1: this.state.score1,
      myQuestions: this.state.questionArray,
      subCategoryId: this.state.subCategoryId,
      right: this.state.rightCount,
      wrong: this.state.wrongCount,
      selectedLanguage: this.state.selectedLanguage,
      gameType: this.state.gameType,
      graphArray: this.state.graphArray
    };
    let variables = {
      userId: this.state.userId,
      gameRoomId: this.state.gameRoomId,
      totalScore: this.state.score1,
      win: "true",
      lose: "false"
    };
    return webservice(variables, "topTen/saveGameHistory", "POST").then(
      resp => {
        this.setState({ isLoading: false });
        if (resp.data.responseCode === 200) {
          clearInterval(this.interval);
          this.setState({ index: 0, timeRemaining: 10 });
          if (this.state.playGameWith === "friend")
            this.props.navigation.navigate("LeaderBoard", {
              gameRoomId: this.state.gameRoomId
            });
          else
            this.props.navigation.navigate("GameComplete", {
              gameObj: gameObj
            });
        } else if (resp.data.responseCode === 1000) {
          setTimeout(() => {
            alert(resp.data.responseMessage);
          }, 1000);
        }
      }
    );
  }

  //  ******************** Quit Game ********************

  _quitGame() {
    clearInterval(this.interval);
    MusicFunc("Clock_Tik_Music", "stop");
    this.setState({ quitModal: false });
    setTimeout(() => {
      var gameLeftObj = {
        sentRequestBy: this.state.senderId,
        sentRequestTo: this.state.receiverId,
        gameRoomId: this.state.gameRoomId
      };
      this.state.gameType === "friend"
        ? socket.emit("gameLeft", gameLeftObj)
        : null;
      this.props.navigation.navigate("Home");
    }, 200);
  }

  resize() {
    let { index, questionArray, selectedLanguage } = this.state;
    let lang = selectedLanguage.toLowerCase();
    let Options = { ...questionArray[index][lang] };
    delete Options["question"];
    if (Options) {
      for (let item in Options) {
        item.length > 25 ? true : false;
      }
    }

    // if(selectedLanguage === 'English'){
    //     if (english_Opt) {
    //         for(let item in english_Opt){
    //             item.length > 25 ? true :  false
    //         }
    //     }
    // }

    // if (questionArray[index].english.a.length > 25 || questionArray[index].english.b.length > 25 || questionArray[index].english.c.length > 25 || questionArray[index].english.d.length > 25 || questionArray[index].hindi.a.length > 25 || questionArray[index].hindi.b.length > 25 || questionArray[index].hindi.c.length > 25 || questionArray[index].hindi.d.length > 25) {
    //     return 'yes'
    // } else {
    //     return 'no'
    // }
  }

  resizeQues() {
    let { index, questionArray, selectedLanguage } = this.state;
    let lang = selectedLanguage.toLowerCase();
    let question = { ...questionArray[index][lang] };
    if (question) {
      question.length > 180 ? true : false;
    }
    // return 'no'
    // let { index, questionArray, selectedLanguage } = this.state
    // if (questionArray[index].english.question.length > 180 || questionArray[index].hindi.b.length > 180) {
    //     return 'yes'
    // } else {
    //     return 'no'
    // }
  }

  render() {
    const introButton = this.animatedValue1.interpolate({
      inputRange: [0, 1],
      outputRange: [-500, 1]
    });
    const opacity = this.animatedValue0.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    });
    const exitButton = this.animatedValue6.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 400]
    });
    const exitButton1 = this.animatedValue7.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 500]
    });
    const introButton1 = this.animatedValue2.interpolate({
      inputRange: [0, 1],
      outputRange: [-50, 5]
    });
    const introButton2 = this.animatedValue3.interpolate({
      inputRange: [0, 1],
      outputRange: [-80, 5.5]
    });
    const introButton3 = this.animatedValue4.interpolate({
      inputRange: [0, 1],
      outputRange: [-120, 6]
    });
    const introButton4 = this.animatedValue5.interpolate({
      inputRange: [0, 1],
      outputRange: [-150, 6.5]
    });

    // *** with image
    const introButton11 = this.animatedValue2.interpolate({
      inputRange: [0, 1],
      outputRange: [-250, 5]
    });
    const introButton21 = this.animatedValue3.interpolate({
      inputRange: [0, 1],
      outputRange: [-250, 5]
    });
    const introButton31 = this.animatedValue4.interpolate({
      inputRange: [0, 1],
      outputRange: [-125, 6]
    });
    const introButton41 = this.animatedValue5.interpolate({
      inputRange: [0, 1],
      outputRange: [-125, 6]
    });

    let {
      questionArray,
      index,
      selectedLanguage,
      right,
      wrong,
      score1,
      selected_a,
      selected_b,
      selected_c,
      selected_d
    } = this.state;
    if (this.state.questionArray.length > 0) {
      if (selectedLanguage == "English") {
        questionList = questionArray[index].english;
        correctAnswer = questionArray[index].correctAnswer;
      } else if (selectedLanguage == "Hindi") {
        questionList = questionArray[index].hindi;
        correctAnswer = questionArray[index].correctAnswer;
      }
    }

    return this.state.questionArray.length > 0 ? (
      <ImageBackground
        source={require("../image/Invite_friend/bg.png")}
        style={{ flex: 1 }}
      >
        <Loader visible={this.state.isLoading} />
        <View style={{ paddingTop: scaleHeight(10) }}>
          <TouchableOpacity
            style={{ flexDirection: "row", top: scaleHeight(8) }}
            onPress={() => {
              this.setState({ quitModal: true }),
                MusicFunc("Clock_Tik_Music", "stop"),
                MusicFunc("Button_Click_Music");
            }}
          >
            <Image
              source={back}
              style={{ width: scaleWidth(25), height: scaleHeight(25) }}
            />
            <Text style={{ fontSize: normalizeFont(18) }}>
              <Textellipsis mytextvar={this.state.name} maxlimit={15} />
            </Text>
          </TouchableOpacity>
          <QuitModal
            visible={this.state.quitModal}
            message="Are you sure you want to quit game?"
            No={() => this.setState({ quitModal: false })}
            Yes={() => this._quitGame()}
          />
          <CustomAlert
            visible={this.state.warningAlert}
            alertMessage={this.state.warningAlertMessage}
            buttonTitle="Go to Home"
            cancelButton={() =>
              this.setState({ warningAlert: !this.state.warningAlert }, () =>
                this.props.navigation.popToTop()
              )
            }
          />
          {this.state.logoutModal ? (
            <ProfileModal
              onRequestClose={() =>
                this.logoutModalOpen(!this.state.logoutModal)
              }
              visible={this.state.logoutModal}
              alertMessage={this.state.alertMessage}
              cancelButton={() => this.setState({ logoutModal: false })}
              logoutModalClose={() =>
                this.logoutModalClose(this.state.logoutModal)
              }
              image={this.state.image}
              name={this.state.name}
              country={this.state.country}
              states={this.state.states}
              win={this.state.win}
              lose={this.state.lose}
            />
          ) : null}
          <View style={styles.termsContainer}>
            <View style={{ flexDirection: "row", paddingTop: scaleHeight(5) }}>
              <TouchableOpacity
                onPress={() => {
                  this.logoutModalOpen();
                }}
                style={{
                  shadowColor: "black",
                  shadowOffset: { width: 2, height: 2 },
                  shadowOpacity: 0.5,
                  shadowRadius: 1
                }}
              >
                <Image
                  source={
                    this.state.image ? { uri: this.state.image } : profileImage
                  }
                  style={{
                    width: scaleWidth(80),
                    height: scaleHeight(80),
                    borderRadius: 10,
                    borderColor: "white",
                    borderWidth: 5
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Animatable.View
                ref={ref => (this.score = ref)}
                iterationCount={1}
                style={{ alignItems: "center", justifyContent: "center" }}
              >
                <ImageBackground
                  source={require("../image/Gameplay/Bluescroce.png")}
                  style={{
                    alignSelf: "center",
                    justifyContent: "center",
                    alignItems: "center",
                    width: scaleWidth(40),
                    paddingVertical: scaleHeight(7.5),
                    paddingHorizontal: scaleWidth(5),
                    marginLeft: scaleWidth(3)
                  }}
                  resizeMode="contain"
                >
                  <Text
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: normalizeFont(16)
                    }}
                  >
                    {score1}
                  </Text>
                </ImageBackground>
              </Animatable.View>
            </View>

            {this.state.gameType == "timed" ? (
              <Animatable.View
                ref={ref => (this.plus = ref)}
                style={{
                  right: scaleWidth(15),
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <ImageBackground
                  source={require("../image/Gameplay/score.png")}
                  style={{
                    height: scaleHeight(40),
                    width: scaleWidth(50),
                    justifyContent: "flex-end",
                    transform: [{ rotate: "180deg" }]
                  }}
                  resizeMode="contain"
                >
                  <View
                    style={{
                      width: "70%",
                      height: "100%",
                      backgroundColor: "transparent",
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    <Text
                      style={{
                        fontSize: normalizeFont(20),
                        color: "#fff",
                        fontWeight: "bold",
                        textAlign: "center",
                        transform: [{ rotate: "180deg" }]
                      }}
                    >
                      {this.state.bonus}
                    </Text>
                  </View>
                </ImageBackground>
              </Animatable.View>
            ) : null}
            {this.state.gameType == "timed" ? (
              <Animatable.View
                ref={ref => (this.clock = ref)}
                iterationCount={1}
                style={{ justifyContent: "center", alignItems: "center" }}
              >
                <ImageBackground
                  source={require("../image/Gameplay/clock.png")}
                  style={{
                    height: scaleHeight(75),
                    width: scaleWidth(65),
                    alignSelf: "center",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: scaleWidth(5)
                  }}
                  resizeMode="stretch"
                >
                  <Text
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: normalizeFont(22),
                      top: scaleHeight(2),
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center"
                    }}
                  >
                    {this.state.timeRemaining}
                  </Text>
                </ImageBackground>
              </Animatable.View>
            ) : null}
          </View>

          {this.state.gameType == "timed" ? (
            <Image
              source={require("../image/Gameplay/line.png")}
              style={{ width }}
            />
          ) : (
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  height: 25,
                  width: score1 + "%",
                  backgroundColor: "#0055d1"
                }}
              />
              <View
                style={{
                  height: 35,
                  width: 15,
                  backgroundColor: "#00bbe8",
                  marginTop: -5,
                  borderRadius: 1,
                  borderWidth: 1,
                  borderColor: "grey"
                }}
              />
              <View
                style={{
                  height: 25,
                  width: "100%",
                  backgroundColor: "#ff642b"
                }}
              />
            </View>
          )}
          <View style={{ flexDirection: "row", alignItems: "center", width }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                flex: 3,
                marginLeft: scaleWidth(7.5),
                marginRight: scaleWidth(40)
              }}
            >
              <Image
                source={
                  questionArray[0].value == "green"
                    ? greenDot
                    : questionArray[0].value == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
              <Image
                source={
                  questionArray[1].value == "green"
                    ? greenDot
                    : questionArray[1].value == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
              <Image
                source={
                  questionArray[2].value == "green"
                    ? greenDot
                    : questionArray[2].value == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
              <Image
                source={
                  questionArray[3].value == "green"
                    ? greenDot
                    : questionArray[3].value == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
              <Image
                source={
                  questionArray[4].value == "green"
                    ? greenDot
                    : questionArray[4].value == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
              <Image
                source={
                  questionArray[5].value == "green"
                    ? greenDot
                    : questionArray[5].value == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
              <Image
                source={
                  questionArray[6].value == "green"
                    ? greenDot
                    : questionArray[6].value == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
              <Image
                source={
                  questionArray[7].value == "green"
                    ? greenDot
                    : questionArray[7].value == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
              <Image
                source={
                  questionArray[8].value == "green"
                    ? greenDot
                    : questionArray[8].value == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
              <Image
                source={
                  questionArray[9].value == "green"
                    ? greenDot
                    : questionArray[9].value == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
            </View>
            <View style={{ justifyContent: "center" }}>
              <ImageBackground
                source={require("../image/Gameplay/Questtion.png")}
                style={{
                  alignItems: "center",
                  paddingHorizontal: scaleWidth(7.5),
                  paddingVertical: scaleHeight(5)
                }}
                resizeMode="stretch"
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: normalizeFont(17)
                  }}
                >
                  Q. {index + 1}
                </Text>
              </ImageBackground>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                flex: 3,
                marginRight: scaleWidth(7.5),
                marginLeft: scaleWidth(40)
              }}
            />
          </View>
          <ScrollView>
            <View
              style={{
                justifyContent: "space-around",
                flexDirection: "column",
                alignItems: "center",
                height: (height / 3) * 1.9
              }}
            >
              {this.state.onCheckedAnswer ? (
                <Animated.View
                  style={{
                    left: exitButton,
                    zIndex: 1,
                    position: "relative",
                    top: 0,
                    backgroundColor: "transparent"
                  }}
                >
                  <Text style={styles.terms}>{questionList.question}</Text>
                </Animated.View>
              ) : (
                <Animated.View
                  style={{
                    left: introButton,
                    zIndex: 1,
                    position: "relative",
                    top: 0,
                    backgroundColor: "transparent"
                  }}
                >
                  <Text
                    style={[
                      styles.terms,
                      {
                        fontSize: this.resizeQues()
                          ? normalizeFont(16)
                          : normalizeFont(20)
                      }
                    ]}
                  >
                    {questionList.question}
                  </Text>
                </Animated.View>
              )}

              {!this.state.onCheckedAnswer ? (
                <Animated.View
                  style={{
                    left: introButton,
                    zIndex: 1,
                    position: "relative",
                    top: 0,
                    backgroundColor: "transparent"
                  }}
                >
                  {this.state.isQuesImg ? (
                    <View>
                      <View
                        style={{
                          backgroundColor: "rgba(162, 160, 160, 0.5)",
                          width: width - scaleWidth(158),
                          height: 160,
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                      >
                        <Image
                          resizeMode="contain"
                          source={{ uri: this.state.questionImage }}
                          style={{
                            width: 200,
                            height: 150
                          }}
                        />
                      </View>
                    </View>
                  ) : null}
                </Animated.View>
              ) : null}

              {!this.state.isQuesImg ? (
                <Animated.View style={{ opacity, top: 0 }}>
                  <Animated.View
                    style={{
                      top: introButton1,
                      position: "relative",
                      zIndex: 0
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => this.onCheckedAnswer("a")}
                      style={{ marginVertical: scaleHeight(6) }}
                    >
                      <ImageBackground
                        source={
                          selected_a
                            ? rightQuestionBG
                            : selected_a === false
                            ? wrongQuestionBG
                            : defaultQuestionBG
                        }
                        style={{
                          justifyContent: "center",
                          width: width - scaleWidth(75),
                          height: scaleHeight(50)
                        }}
                        resizeMode="stretch"
                      >
                        <Text
                          style={{
                            alignSelf: "center",
                            color: "black",
                            fontWeight: "800",
                            fontSize: this.resize()
                              ? normalizeFont(13)
                              : normalizeFont(17)
                          }}
                        >
                          {questionList.a}
                        </Text>
                      </ImageBackground>
                    </TouchableOpacity>
                  </Animated.View>
                  <Animated.View
                    style={{
                      top: introButton2,
                      position: "relative",
                      zIndex: 0
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => this.onCheckedAnswer("b")}
                      style={{ marginVertical: scaleHeight(6) }}
                    >
                      <ImageBackground
                        source={
                          selected_b
                            ? rightQuestionBG
                            : selected_b === false
                            ? wrongQuestionBG
                            : defaultQuestionBG
                        }
                        style={{
                          justifyContent: "center",
                          width: width - scaleWidth(75),
                          height: scaleHeight(50)
                        }}
                        resizeMode="stretch"
                      >
                        <Text
                          style={{
                            alignSelf: "center",
                            color: "black",
                            fontWeight: "800",
                            fontSize: this.resize()
                              ? normalizeFont(13)
                              : normalizeFont(17)
                          }}
                        >
                          {questionList.b}
                        </Text>
                      </ImageBackground>
                    </TouchableOpacity>
                  </Animated.View>
                  <Animated.View
                    style={{
                      top: introButton3,
                      position: "relative",
                      zIndex: 0
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => this.onCheckedAnswer("c")}
                      style={{ marginVertical: scaleHeight(6) }}
                    >
                      <ImageBackground
                        source={
                          selected_c
                            ? rightQuestionBG
                            : selected_c === false
                            ? wrongQuestionBG
                            : defaultQuestionBG
                        }
                        style={{
                          justifyContent: "center",
                          width: width - scaleWidth(75),
                          height: scaleHeight(50)
                        }}
                        resizeMode="stretch"
                      >
                        <Text
                          style={{
                            alignSelf: "center",
                            color: "black",
                            fontWeight: "800",
                            fontSize: this.resize()
                              ? normalizeFont(13)
                              : normalizeFont(17)
                          }}
                        >
                          {questionList.c}
                        </Text>
                      </ImageBackground>
                    </TouchableOpacity>
                  </Animated.View>
                  <Animated.View
                    style={{
                      top: introButton4,
                      position: "relative",
                      zIndex: 0
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => this.onCheckedAnswer("d")}
                      style={{
                        marginTop: scaleHeight(6),
                        marginBottom: scaleHeight(10)
                      }}
                    >
                      <ImageBackground
                        source={
                          selected_d
                            ? rightQuestionBG
                            : selected_d === false
                            ? wrongQuestionBG
                            : defaultQuestionBG
                        }
                        style={{
                          justifyContent: "center",
                          width: width - scaleWidth(75),
                          height: scaleHeight(50)
                        }}
                        resizeMode="stretch"
                      >
                        <Text
                          style={{
                            alignSelf: "center",
                            color: "black",
                            fontWeight: "800",
                            fontSize: this.resize()
                              ? normalizeFont(13)
                              : normalizeFont(17)
                          }}
                        >
                          {questionList.d}
                        </Text>
                      </ImageBackground>
                    </TouchableOpacity>
                  </Animated.View>
                </Animated.View>
              ) : (
                <Animated.View
                  style={{ opacity, top: 0, flexDirection: "row" }}
                >
                  <View style={{ flex: 1 }}>
                    <Animated.View
                      style={{
                        left: introButton11,
                        position: "relative",
                        alignSelf: "center",
                        zIndex: 0,
                        paddingHorizontal: scaleWidth(5),
                        marginHorizontal: scaleWidth(5)
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => this.onCheckedAnswer("a")}
                        style={{ marginVertical: scaleHeight(6) }}
                      >
                        <ImageBackground
                          source={
                            selected_a
                              ? rightQuestionBG
                              : selected_a === false
                              ? wrongQuestionBG
                              : defaultQuestionBG
                          }
                          style={{
                            width: width / 2 - 20,
                            height: scaleHeight(50),
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                          resizeMode="stretch"
                        >
                          <Text
                            style={{
                              width: width / 2 - 25,
                              textAlign: "center",
                              paddingHorizontal: 2.5,
                              color: "black",
                              fontWeight: "800",
                              fontSize:
                                this.resize() == "yes"
                                  ? normalizeFont(13)
                                  : normalizeFont(17)
                            }}
                          >
                            {questionList.a}
                          </Text>
                        </ImageBackground>
                      </TouchableOpacity>
                    </Animated.View>
                    <Animated.View
                      style={{
                        left: introButton21,
                        position: "relative",
                        alignSelf: "center",
                        zIndex: 0,
                        paddingHorizontal: scaleWidth(5),
                        marginHorizontal: scaleWidth(5)
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => this.onCheckedAnswer("b")}
                        style={{ marginVertical: scaleHeight(6) }}
                      >
                        <ImageBackground
                          source={
                            selected_b
                              ? rightQuestionBG
                              : selected_b === false
                              ? wrongQuestionBG
                              : defaultQuestionBG
                          }
                          style={{
                            width: width / 2 - 20,
                            height: scaleHeight(50),
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                          resizeMode="stretch"
                        >
                          <Text
                            style={{
                              width: width / 2 - 25,
                              textAlign: "center",
                              paddingHorizontal: 2.5,
                              color: "black",
                              fontWeight: "800",
                              fontSize:
                                this.resize() == "yes"
                                  ? normalizeFont(13)
                                  : normalizeFont(17)
                            }}
                          >
                            {questionList.b}
                          </Text>
                        </ImageBackground>
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Animated.View
                      style={{
                        right: introButton31,
                        position: "relative",
                        alignSelf: "center",
                        zIndex: 0,
                        paddingHorizontal: scaleWidth(5),
                        marginHorizontal: scaleWidth(5)
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => this.onCheckedAnswer("c")}
                        style={{ marginVertical: scaleHeight(6) }}
                      >
                        <ImageBackground
                          source={
                            selected_c
                              ? rightQuestionBG
                              : selected_c === false
                              ? wrongQuestionBG
                              : defaultQuestionBG
                          }
                          style={{
                            width: width / 2 - 20,
                            height: scaleHeight(50),
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                          resizeMode="stretch"
                        >
                          <Text
                            style={{
                              width: width / 2 - 25,
                              alignSelf: "center",
                              textAlign: "center",
                              paddingHorizontal: 2.5,
                              color: "black",
                              fontWeight: "800",
                              fontSize:
                                this.resize() == "yes"
                                  ? normalizeFont(13)
                                  : normalizeFont(17)
                            }}
                          >
                            {questionList.c}
                          </Text>
                        </ImageBackground>
                      </TouchableOpacity>
                    </Animated.View>
                    <Animated.View
                      style={{
                        right: introButton41,
                        position: "relative",
                        alignSelf: "center",
                        zIndex: 0,
                        paddingHorizontal: scaleWidth(5),
                        marginHorizontal: scaleWidth(5)
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => this.onCheckedAnswer("d")}
                        style={{
                          marginTop: scaleHeight(6),
                          marginBottom: scaleHeight(10)
                        }}
                      >
                        <ImageBackground
                          source={
                            selected_d
                              ? rightQuestionBG
                              : selected_d === false
                              ? wrongQuestionBG
                              : defaultQuestionBG
                          }
                          style={{
                            width: width / 2 - 20,
                            height: scaleHeight(50),
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                          resizeMode="stretch"
                        >
                          <Text
                            style={{
                              width: width / 2 - 25,
                              alignSelf: "center",
                              textAlign: "center",
                              paddingHorizontal: 2.5,
                              color: "black",
                              fontWeight: "800",
                              fontSize:
                                this.resize() == "yes"
                                  ? normalizeFont(13)
                                  : normalizeFont(17)
                            }}
                          >
                            {questionList.d}
                          </Text>
                        </ImageBackground>
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                </Animated.View>
              )}
            </View>
          </ScrollView>
          <AnswerModal
            visible={this.state.modalVisible}
            answerModalClose={() => this.answerModalClose()}
            explanation={
              questionList.explanation !== "" ? questionList.explanation : ""
            }
            Next={() => {
              this.nextQuestion(), MusicFunc("Button_Click_Music");
            }}
            title="Next"
          />
          <Modal
            visible={this.state.lock}
            animationType="none"
            transparent={true}
          />
        </View>
      </ImageBackground>
    ) : (
      <Loader visible={this.state.isLoading} />
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF"
  },
  termsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10
  },
  terms: {
    fontSize: normalizeFont(20),
    color: "black",
    fontWeight: "800",
    textAlign: "center",
    marginVertical: scaleHeight(5),
    paddingHorizontal: scaleWidth(5)
  }
});
