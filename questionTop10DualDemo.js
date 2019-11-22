import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Modal,
  Dimensions,
  Easing,
  Animated,
  Platform,
  AsyncStorage,
  BackHandler,
  ToastAndroid
} from "react-native";
import * as Animatable from "react-native-animatable";
import {
  scaleWidth,
  scaleHeight,
  normalizeFont,
  scaleWidthMenu
} from "../components/common/Responsive";
import { MusicFunc } from "../components/common/SoundFunc";
import ProfileAlert from "./profileModal";
import AnswerModal from "./answerModal";
import QuitModal from "./quitModal";
import Loader from "./loader";
import { socket, initUser } from "../webService/global";
import webservice from "../webService/Api";
import {
  userProfileData,
  otherUserProfile,
  otherUserProfileData
} from "../webService/ApiStore";
import CustomAlert from "./clubAlert";
import Textellipsis from "../components/common/Textellipsis";

const greyDot = require("../image/question/greyDot.png");
const redDot = require("../image/question/redDot.png");
const greenDot = require("../image/question/greenDot.png");
const { width, height } = Dimensions.get("window");
const defaultQuestionBG = require("../image/question/Question1.png");
const rightQuestionBG = require("../image/question/Green.png");
const wrongQuestionBG = require("../image/question/Red.png");
const back = require("../image/BackIcon/back-icon.png");
const profileImage = require("../image/user.png");

let correctAnswer;

export default class QuestionTop10Dual extends Component {
  constructor(props) {
    super(props);
    this.state = {
      onCheckedAnswer: false,
      subCategoryId: null,
      questionArray: [],
      modalVisible: false,
      quitModal: false,
      selectedLanguage: "English",
      gameType: "",
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
      score2: 0,
      bonus1: "",
      bonus2: "",
      timeRemaining: 10,
      userId: "",
      otherUserId: "",
      name: "",
      otherName: "",
      country: "",
      country2: "",
      state: "",
      state2: "",
      win: "",
      win2: "",
      lose: "",
      lose2: "",
      image1: "",
      image2: "",
      Avatar: null,
      isLoading: false,
      otherPlayerAnswer: null,
      connected: null,
      senderId: "",
      receiverId: "",
      oneTimeClick: true,
      bothUserSelected: false,
      otherAns: false,
      otherUserSelected: "",
      otherSelected_a: false,
      otherSelected_b: false,
      otherSelected_c: false,
      otherSelected_d: false,
      lock: false,
      winStatus: false,
      profile2Modal: false,
      graphArray: [
        {
          Player1: [],
          Player2: []
        }
      ],
      bothPlayerReady: false,
      gamePlayType: "",
      dualGameObj: "",
      tempGraph: "",

      isQuesImg: false,
      questionImage: "",
      myAnswer: "",
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
    this._getLoaded();
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  _getLoaded() {
    var playerReadyCount = 0,
      gameLeftCount = 0;
    MusicFunc("Background_Music", "stop");
    this.setState({ isLoading: true });

    //  ******************** get gameType ********************

    let type = this.props.navigation.state.params.data;
    let { params } = this.props.navigation.state;
    this.setState({
      gameType: type.playGameWith,
      image2: type.image2,
      senderId: type.senderId,
      receiverId: type.userId,
      otherUserId: type.userId,
      otherUserData: type.otherUserData,
      gamePlayType: type.gamePlayType
    });
    if (!this.state.gameType === "friend" || "random")
      this.setState({ otherName: type.friendName });
    // this.animate()

    //  ******************** get userId ********************

    AsyncStorage.getItem("userId").then(id => {
      this.setState({ userId: JSON.parse(id) });
    });

    setTimeout(() => {
      this.setState({
        name: userProfileData.name,
        country: userProfileData.country,
        state: userProfileData.state,
        win: userProfileData.win,
        lose: userProfileData.lose,
        image1: userProfileData.avatar,

        otherName: otherUserProfileData.name,
        image2: otherUserProfileData.avatar,
        country2: otherUserProfileData.country,
        state2: otherUserProfileData.state,
        win2: otherUserProfileData.win,
        lose2: otherUserProfileData.lose,
        myTopics2: otherUserProfileData.interests
      });
    }, 500);

    //  ******************** get gameRoomId ********************

    AsyncStorage.getItem("gameRoomId").then(res => {
      this.setState({ gameRoomId: JSON.parse(res) });
    });

    //  ******************** get subCategoryId ********************

    AsyncStorage.getItem("subCategoryId").then(id => {
      this.setState({ subCategoryId: id });
    });

    //  ******************** get language ********************

    AsyncStorage.getItem("language").then(lang => {
      if (lang == null) this.setState({ selectedLanguage: "English" });
      else this.setState({ selectedLanguage: lang });
    });

    // ************************ Music Handling ****************

    setTimeout(() => {
      MusicFunc("Question_Appear_Music");
      this.setUserStatus();
      this.getQuestions();
    }, 1000);

    setTimeout(() => {
      MusicFunc("Option_Appear_Music");
    }, 2000);

    // Sockets Applied to get otherPlayer ANswer ******

    socket.on("player_ready", data => {
      if (playerReadyCount == 0) {
        this.setState({ bothPlayerReady: true, isLoading: false });
        setTimeout(() => {
          this.timer();
        }, 500);
        playerReadyCount = 1;
      }
    });

    socket.on("otherAnswer", data => {
      this.setState({
        bothUserSelected: true,
        otherUserSelected: data.otherPlayerAns,
        dualGameObj: data.dualGameObj
      });
      this.matchAnswer(data.otherPlayerAns);
    });

    socket.on("myScore", scoreData => {
      this.setState({
        score2: JSON.stringify(scoreData.other_player_score_new.currentScore)
      });

      // ~~~~~~~~~~~ store Graph Data ~~~~~~~~~~~~~~

      let temp = scoreData.scoreGameObj[this.state.receiverId].scoreArr;
      let count = 0;
      this.setState({ tempGraph: temp });
      if (this.state.index == 9) {
        if (count == 0) {
          count++;
          for (i in temp) {
            let graphData = {};
            graphData = {
              score2: temp[i].currentQuesScore,
              timeRemaining2: temp[i].timeRemaining
            };
            this.state.graphArray[0].Player2.push(graphData);
          }
        }
      }
    });

    socket.on("gameLeft", data => {
      if (gameLeftCount == 0) {
        gameLeftCount = 1;
        clearInterval(this.interval);
        socket.removeListener("otherAnswer");
        MusicFunc("Clock_Tik_Music", "stop");
        setTimeout(() => {
          Alert.alert("TOK", "Other Player left the game", [
            {
              text: "OK",
              onPress: () => {
                this.props.navigation.navigate("Home"),
                  this.setState({ index: 0 });
              }
            }
          ]);
        }, 100);
      }
    });

    setTimeout(() => {
      this.state.gameType === "random" ? this.timer() : null;
      JSON.stringify(otherUserProfileData).length != 0
        ? this.ViewOtherPlayerProfile()
        : null;
    }, 500);
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

  //  ******************** start timer function ********************

  timer() {
    clearInterval(this.interval);
    setTimeout(() => {
      this.setState({ isLoading: false });
      setTimeout(() => {
        MusicFunc("Clock_Tik_Music", "play");
      }, 1000);
      if (this.state.timeRemaining !== 0)
        this.interval = setInterval(() => {
          this.tick();
        }, 1000);
    }, 4000);
  }

  //  ******************** timer function ********************

  tick(otherUserSelectAns) {
    let { questionArray, index } = this.state;
    let checkAns = this.state.questionArray[this.state.index];
    if (this.state.timeRemaining == 0) {
      MusicFunc("Clock_Tik_Music", "stop");
      let socket_req = {
        gameId: this.state.gameRoomId,
        question_Id: questionArray[index].question_Id,
        correctAnswer: "0",
        myScore: this.state.score1,
        sentRequestBy: this.state.senderId,
        sentRequestTo: this.state.receiverId,
        dualGameObj: this.state.dualGameObj
      };

      if (this.state.myAnswer === "") {
        checkAns.value = "red";
      }

      socket.emit("isUserOnline", this.state.userId, returnData => {
        if (returnData.key) socket.emit("otherAnswer", socket_req);
        else {
          initUser(this.state.userId, this.state.name);
          setTimeout(() => {
            socket.emit("otherAnswer", socket_req);
          }, 500);
        }
      });

      if (this.state.gameType === "random") {
        this.setState({ bothUserSelected: false });
        if (this.state.onCheckedAnswer == false) {
          if (correctAnswer == "a") {
            MusicFunc("Right_Answer_Music");
            checkAns.valueOther = "red";
            this.setState({ selected_a: true, right: true });
            setTimeout(() => {
              this.nextQuestion();
            }, 1000);
          } else if (correctAnswer == "b") {
            MusicFunc("Right_Answer_Music");
            checkAns.valueOther = "red";
            this.setState({ selected_b: true, right: true });
            setTimeout(() => {
              this.nextQuestion();
            }, 1000);
          } else if (correctAnswer == "c") {
            MusicFunc("Right_Answer_Music");
            checkAns.valueOther = "red";
            this.setState({ selected_c: true, right: true });
            setTimeout(() => {
              this.nextQuestion();
            }, 1000);
          } else if (correctAnswer == "d") {
            MusicFunc("Right_Answer_Music");
            checkAns.valueOther = "red";
            this.setState({ selected_d: true, right: true });
            setTimeout(() => {
              this.nextQuestion();
            }, 1000);
          }

          otherUserSelectAns == correctAnswer
            ? (checkAns.valueOther = "green")
            : (checkAns.valueOther = "red");

          if (otherUserSelectAns == "a") {
            this.setState({
              otherSelected_a:
                otherUserSelectAns != correctAnswer ? true : false
            });
          } else if (otherUserSelectAns == "b") {
            this.setState({
              otherSelected_b:
                otherUserSelectAns != correctAnswer ? true : false
            });
          } else if (otherUserSelectAns == "c") {
            this.setState({
              otherSelected_c:
                otherUserSelectAns != correctAnswer ? true : false
            });
          } else if (otherUserSelectAns == "d") {
            this.setState({
              otherSelected_d:
                otherUserSelectAns != correctAnswer ? true : false
            });
          }

          setTimeout(() => {
            clearInterval(this.interval);
          }, 500);
        }
      }
      clearInterval(this.interval);
      return;
    } else {
      if (!this.state.onCheckedAnswer) {
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

  matchAnswer(otherUserSelectAns) {
    let { questionArray, index } = this.state;
    let checkAns = questionArray[index];
    this.setState({ bothUserSelected: false });

    if (this.state.myAnswer === "") {
      checkAns.value = "red";
    }

    if (this.state.onCheckedAnswer == false) {
      if (correctAnswer == "a") {
        MusicFunc("Right_Answer_Music");
        checkAns.valueOther = "red";
        this.setState({ selected_a: true, right: true });
        setTimeout(() => {
          this.nextQuestion();
        }, 1000);
      } else if (correctAnswer == "b") {
        MusicFunc("Right_Answer_Music");
        checkAns.valueOther = "red";
        this.setState({ selected_b: true, right: true });
        setTimeout(() => {
          this.nextQuestion();
        }, 1000);
      } else if (correctAnswer == "c") {
        MusicFunc("Right_Answer_Music");
        checkAns.valueOther = "red";
        this.setState({ selected_c: true, right: true });
        setTimeout(() => {
          this.nextQuestion();
        }, 1000);
      } else if (correctAnswer == "d") {
        MusicFunc("Right_Answer_Music");
        checkAns.valueOther = "red";
        this.setState({ selected_d: true, right: true });
        setTimeout(() => {
          this.nextQuestion();
        }, 1000);
      }

      otherUserSelectAns == correctAnswer
        ? (checkAns.valueOther = "green")
        : (checkAns.valueOther = "red");

      if (otherUserSelectAns == "a") {
        this.setState({
          otherSelected_a: otherUserSelectAns != correctAnswer ? true : false
        });
      } else if (otherUserSelectAns == "b") {
        this.setState({
          otherSelected_b: otherUserSelectAns != correctAnswer ? true : false
        });
      } else if (otherUserSelectAns == "c") {
        this.setState({
          otherSelected_c: otherUserSelectAns != correctAnswer ? true : false
        });
      } else if (otherUserSelectAns == "d") {
        this.setState({
          otherSelected_d: otherUserSelectAns != correctAnswer ? true : false
        });
      }

      setTimeout(() => {
        clearInterval(this.interval);
      }, 500);
    }
    clearInterval(this.interval);
    return;
  }

  logoutModalOpen = visible => {
    this.setState({ logoutModal: !visible });
  };
  logoutModalClose = visible => {
    this.setState({ logoutModal: false });
  };

  // ************************* view OTHER USER profile *****************************

  ViewOtherPlayerProfile = () => {
    let variables = {
      userId: this.state.otherUserId
    };
    return webservice(variables, "users/viewProfile", "POST").then(resp => {
      if (resp.data.responseCode === 200) {
        otherUserProfile(resp.data.data[0]);
        this.setState({
          otherName: resp.data.data[0].name,
          image2: resp.data.data[0].avatar,
          country2: resp.data.data[0].country,
          state2: resp.data.data[0].state,
          win2: resp.data.data[0].win,
          lose2: resp.data.data[0].lose,
          myTopics2: resp.data.data[0].interests
        });
      }
    });
  };

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

    // +_+_+_+_+_+_+_+_+_+_+ CUSTOM ANIMATION +_+_+_+_+_+_+_+_+_+_+

    Animatable.initializeRegistryWithDefinitions({
      fadeOutLeft: {
        from: {
          scale: 0.75,
          opacity: 1,
          transform: [
            {
              translateX: 0,
              translateY: 10
            }
          ]
        },
        to: {
          scale: 1,
          opacity: 0,
          transform: [
            {
              translateX: -10,
              translateY: 500
            }
          ]
        }
      },
      fadeOutRight: {
        from: {
          scale: 0.75,
          transform: [
            {
              translateX: 0,
              translateY: 50
            }
          ]
        },
        to: {
          scale: 1,
          transform: [
            {
              translateX: 10,
              translateY: 50
            }
          ]
        }
      }
    });
  }

  // =========== Custom Animation handler =============

  fadeOutLeft = (answer, qusId) =>
    this.clock
      .slideOutLeft()
      .then(endState =>
        endState.finished ? this.zoomIn1(answer, qusId) : null
      );
  fadeOutRight = (answer, qusId) =>
    this.clock
      .slideOutRight()
      .then(endState =>
        endState.finished ? this.zoomIn2(answer, qusId) : null
      );
  zoomIn1 = (answer, qusId) => {
    this.setState({ bonus1: this.state.timeRemaining }, () =>
      this.plus1
        .zoomIn(500)
        .then(endState =>
          endState.finished
            ? this.plus1
                .fadeOutLeft(1000)
                .then(endState =>
                  endState.finished ? this.updateScore(answer, qusId) : null
                )
            : null
        )
    );
  };
  zoomIn2 = (answer, qusId) => {
    this.setState({ bonus2: this.state.timeRemaining }, () =>
      this.plus2
        .zoomIn(500)
        .then(endState =>
          endState.finished
            ? this.plus2
                .fadeOutRight(1000)
                .then(endState =>
                  endState.finished
                    ? this.updateScoreOther(answer, qusId)
                    : null
                )
            : null
        )
    );
  };
  bounce = type => {
    // alert('s')
    let { myAnswer, otherUserSelected } = this.state;
    if (myAnswer == correctAnswer && otherUserSelected == correctAnswer) {
      // alert('1')
      this.score1.shake(500);
      this.score2.shake(500);
      setTimeout(() => {
        this.nextQuestion();
      }, 1000);
    } else if (
      myAnswer === correctAnswer &&
      otherUserSelected !== correctAnswer
    ) {
      // alert('2')
      // if(type===1){
      this.score1
        .shake(500)
        .then(endState =>
          endState.finished ? setTimeout(() => this.nextQuestion(), 1000) : null
        );
      // }
    } else if (
      myAnswer !== correctAnswer &&
      otherUserSelected === correctAnswer
    ) {
      // alert('3')
      this.score2
        .shake(500)
        .then(endState =>
          endState.finished ? setTimeout(() => this.nextQuestion(), 1000) : null
        );
    } else {
      // alert('4')
      this.nextQuestion();
    }
  };

  reset() {
    this.clock.pulse();
    this.plus1.pulse();
    // this.score1.pulse()
    this.plus2.pulse();
    // this.score2.pulse()
  }

  // ************************* set user status false ****************************

  setUserStatus() {
    let variables = {
      _id: this.state.userId,
      status: "BUSY"
    };
    return webservice(variables, "users/onlineFalse", "POST").then(resp => {});
  }

  // ******************** get the questions using gameRoomId ********************

  getQuestions() {
    this.setState({ isLoading: true });
    let variables = {
      gameRoomId: this.state.gameRoomId
    };
    let lang = this.state.selectedLanguage.toLowerCase();
    return webservice(variables, "topten/getQuestionByRoomID", "POST").then(
      resp => {
        //console.log('Questions ===> ', JSON.stringify(resp.data.data))
        if (resp.data.responseCode === 200) {
          for (let i in resp.data.data) {
            if (!resp.data.data[1][lang].hasOwnProperty("question")) {
              this.props.navigation.popToTop();
              this.setState({ isLoading: false }, () =>
                setTimeout(() => {
                  alert("No Question found");
                }, 500)
              );

              // this.setState({ warningAlert: true, warningAlertMessage: `No questions found in ${this.state.selectedLanguage} language` })
              clearInterval(this.interval);
              break;
            }
            this.animate();
            resp.data.data[i]["selectAnswer"] = "";
            resp.data.data[i]["value"] = "";
          }
          this.setState({
            questionArray: resp.data.data,
            isQuesImg: resp.data.data[0].image != "" ? true : false,
            questionImage: resp.data.data[0].image
          });

          // emit socket "Ready"
          let readySocketData = {
            status: true,
            sentRequestBy: this.state.senderId,
            sentRequestTo: this.state.receiverId,
            gameRoomId: this.state.gameRoomId
          };
          socket.emit("playerStatus", readySocketData);
        } else if (resp.data.responseCode === 400) {
          this.setState({ isLoading: false });
          alert("400--" + resp.data.responseMessage);
        } else if (resp.data.responseCode === 1000) {
          alert(resp.data.responseMessage);
        }
      }
    );
  }

  //  ******************** check the selected Answer ********************

  onCheckedAnswer(answer, qusId) {
    let checkAns = this.state.questionArray[this.state.index];
    this.setState({ myAnswer: answer });
    MusicFunc("Clock_Tik_Music", "stop");
    if (this.state.gameType === "friend") {
      if (this.state.oneTimeClick) {
        let socket_req = {
          gameId: this.state.gameRoomId,
          question_Id: qusId,
          myScore: this.state.score1,
          correctAnswer: answer,
          sentRequestBy: this.state.senderId,
          sentRequestTo: this.state.receiverId,
          dualGameObj: this.state.dualGameObj
        };
        //console.log('other answer socket data ==>>> ', JSON.stringify(socket_req))
        socket.emit("isUserOnline", this.state.userId, returnData => {
          if (returnData.key) socket.emit("otherAnswer", socket_req);
          else {
            initUser(this.state.userId, this.state.name);
            setTimeout(() => {
              socket.emit("otherAnswer", socket_req);
            }, 500);
          }
        });

        let correctAnswer = this.state.questionArray[this.state.index]
          .correctAnswer;
        this.setState({ correctAnswer });
        let { otherPlayerAnswer } = this.state;
        if (answer === "a") {
          if (correctAnswer === answer) {
            this.setState({
              selected_a: true,
              rightCount: this.state.rightCount + 1,
              oneTimeClick: false
            });
            MusicFunc("Right_Answer_Music");
            checkAns.value = "green";
            this.updateScore(answer, qusId);
          } else {
            this.setState({
              selected_a: false,
              wrongCount: this.state.wrongCount + 1,
              oneTimeClick: false
            });
            MusicFunc("Wrong_Answer_Music");
            checkAns.value = "red";
            this.updateScore(answer, qusId);
          }
        } else if (answer === "b") {
          if (correctAnswer === answer) {
            this.setState({
              selected_b: true,
              rightCount: this.state.rightCount + 1,
              oneTimeClick: false
            });
            MusicFunc("Right_Answer_Music");
            checkAns.value = "green";
            this.updateScore(answer, qusId);
          } else {
            this.setState({
              selected_b: false,
              wrongCount: this.state.wrongCount + 1,
              oneTimeClick: false
            });
            MusicFunc("Wrong_Answer_Music");
            this.updateScore(answer, qusId);
            checkAns.value = "red";
          }
        } else if (answer === "c") {
          if (correctAnswer === answer) {
            this.setState({
              selected_c: true,
              rightCount: this.state.rightCount + 1,
              oneTimeClick: false
            });
            MusicFunc("Right_Answer_Music");
            checkAns.value = "green";
            this.updateScore(answer, qusId);
          } else {
            this.setState({
              selected_c: false,
              wrongCount: this.state.wrongCount + 1,
              oneTimeClick: false
            });
            MusicFunc("Wrong_Answer_Music");
            checkAns.value = "red";
            this.updateScore(answer, qusId);
          }
        } else if (answer === "d") {
          if (correctAnswer === answer) {
            this.setState({
              selected_d: true,
              rightCount: this.state.rightCount + 1,
              oneTimeClick: false
            });
            MusicFunc("Right_Answer_Music");
            checkAns.value = "green";
            this.updateScore(answer, qusId);
          } else {
            this.setState({
              selected_d: false,
              wrongCount: this.state.wrongCount + 1,
              oneTimeClick: false
            });
            MusicFunc("Wrong_Answer_Music");
            checkAns.value = "red";
            this.updateScore(answer, qusId);
          }
        }
        let { questionArray } = this.state;
        let selectAns = questionArray[this.state.index];
        selectAns.selectAnswer = answer;
        this.setState({ questionArray });
      }
    } else {
        debugger;
      this.setState({ lock: true });
      if (this.state.oneTimeClick) {
        let correctAnswer = this.state.questionArray[this.state.index]
          .correctAnswer;
        let { otherPlayerAnswer } = this.state;
        if (answer === "a") {
          if (correctAnswer === answer) {
            this.setState({
              selected_a: true,
              rightCount: this.state.rightCount + 1,
              oneTimeClick: false
            });
            MusicFunc("Right_Answer_Music");
            this.updateScore(answer);
            // this.fadeOutLeft(answer)
            checkAns.value = "green";
          } else {
            this.setState({
              selected_a: false,
              wrongCount: this.state.wrongCount + 1,
              oneTimeClick: false
            });
            MusicFunc("Wrong_Answer_Music");
            checkAns.value = "red";
            this.updateScore(answer, qusId);
            // setTimeout(() => {
            //     this.nextQuestion()
            // }, 1000)
          }
          clearInterval(this.interval);
          setTimeout(() => {
            this.nextQuestion();
          }, 1000);
        } else if (answer === "b") {
          if (correctAnswer === answer) {
            this.setState({
              selected_b: true,
              rightCount: this.state.rightCount + 1,
              oneTimeClick: false
            });
            MusicFunc("Right_Answer_Music");
            this.updateScore(answer);
            // this.fadeOutLeft(answer)
            checkAns.value = "green";
          } else {
            this.setState({
              selected_b: false,
              wrongCount: this.state.wrongCount + 1,
              oneTimeClick: false
            });
            MusicFunc("Wrong_Answer_Music");
            checkAns.value = "red";
            this.updateScore(answer, qusId);
            // setTimeout(() => {
            //     this.nextQuestion()
            // }, 1000)
          }
          clearInterval(this.interval);
          setTimeout(() => {
            this.nextQuestion();
          }, 1000);
        } else if (answer === "c") {
          if (correctAnswer === answer) {
            this.setState({
              selected_c: true,
              rightCount: this.state.rightCount + 1,
              oneTimeClick: false
            });
            MusicFunc("Right_Answer_Music");
            this.updateScore(answer);
            // this.fadeOutLeft(answer)
            checkAns.value = "green";
          } else {
            this.setState({
              selected_c: false,
              wrongCount: this.state.wrongCount + 1,
              oneTimeClick: false
            });
            MusicFunc("Wrong_Answer_Music");
            checkAns.value = "red";
            this.updateScore(answer, qusId);
            // setTimeout(() => {
            //     this.nextQuestion()
            // }, 1000)
          }
          clearInterval(this.interval);
          setTimeout(() => {
            this.nextQuestion();
          }, 1000);
        } else if (answer === "d") {
          if (correctAnswer === answer) {
            this.setState({
              selected_d: true,
              rightCount: this.state.rightCount + 1,
              oneTimeClick: false
            });
            MusicFunc("Right_Answer_Music");
            this.updateScore(answer);
            // this.fadeOutLeft(answer)
            checkAns.value = "green";
          } else {
            this.setState({
              selected_d: false,
              wrongCount: this.state.wrongCount + 1,
              oneTimeClick: false
            });
            MusicFunc("Wrong_Answer_Music");
            checkAns.value = "red";
            this.updateScore(answer, qusId);
            // setTimeout(() => {
            //     this.nextQuestion()
            // }, 1000)
          }
          clearInterval(this.interval);
          setTimeout(() => {
            this.nextQuestion();
          }, 1000);
        }
        if (correctAnswer == "a") {
          this.setState({ selected_a: true, right: true, oneTimeClick: false });
        } else if (correctAnswer == "b") {
          this.setState({ selected_b: true, right: true, oneTimeClick: false });
        } else if (correctAnswer == "c") {
          this.setState({ selected_c: true, right: true, oneTimeClick: false });
        } else if (correctAnswer == "d") {
          this.setState({ selected_d: true, right: true, oneTimeClick: false });
        }

        this.onCheckedAnswerByOther();

        let { questionArray } = this.state;
        let selectAns = questionArray[this.state.index];
        selectAns.selectAnswer = answer;
        this.setState({ questionArray });
      }
    }
  }

  onCheckedAnswerByOther() {
    var items = ["a", "b", "c", "d"];
    var randomElement = Math.floor(Math.random() * items.length);
    let { questionArray } = this.state;
    let checkAns = this.state.questionArray[this.state.index];
    let correctAnswer = this.state.questionArray[this.state.index]
      .correctAnswer;
    let otherPlayerAnswer = items[randomElement];
    if (otherPlayerAnswer === "a") {
      if (correctAnswer === otherPlayerAnswer) {
        this.setState({ selected_a: true });
        this.updateScoreOther(otherPlayerAnswer);
        // this.fadeOutRight(otherPlayerAnswer)
        checkAns.valueOther = "green";
      } else {
        this.setState({ selected_a: false });
        checkAns.valueOther = "red";
        this.updateScoreOther(otherPlayerAnswer);
      }
    } else if (otherPlayerAnswer === "b") {
      if (correctAnswer === otherPlayerAnswer) {
        this.setState({ selected_b: true });
        this.updateScoreOther(otherPlayerAnswer);
        // this.fadeOutRight(otherPlayerAnswer)
        checkAns.valueOther = "green";
      } else {
        this.setState({ selected_b: false });
        checkAns.valueOther = "red";
        this.updateScoreOther(otherPlayerAnswer);
      }
    } else if (otherPlayerAnswer === "c") {
      if (correctAnswer === otherPlayerAnswer) {
        this.setState({ selected_c: true });
        this.updateScoreOther(otherPlayerAnswer);
        // this.fadeOutRight(otherPlayerAnswer)
        checkAns.valueOther = "green";
      } else {
        this.setState({ selected_c: false });
        checkAns.valueOther = "red";
        this.updateScoreOther(otherPlayerAnswer);
      }
    } else if (otherPlayerAnswer === "d") {
      if (correctAnswer === otherPlayerAnswer) {
        this.setState({ selected_d: true });
        this.updateScoreOther(otherPlayerAnswer);
        // this.fadeOutRight(otherPlayerAnswer)
        checkAns.valueOther = "green";
      } else {
        this.setState({ selected_d: false });
        checkAns.valueOther = "red";
        this.updateScoreOther(otherPlayerAnswer);
      }
    }
  }

  //  ******************** update score ********************

  updateScore(answer, qusId) {
      debugger;
    if (answer != null && answer === correctAnswer)
      this.setState({
        score1: this.state.score1 + 10 + this.state.timeRemaining,
        bonus: ""
      });
    // ~~~~~~~~~~~ store Graph Data ~~~~~~~~~~~~~~

    let graphData = {};
    graphData = {
      score1: answer != null && answer === correctAnswer ? 10 : 0,
      timeRemaining1: this.state.timeRemaining
    };
    this.state.graphArray[0].Player1.push(graphData);

    setTimeout(() => {
      scoreObj = {
        gameId: this.state.gameRoomId,
        questionId: qusId,
        questionNo: this.state.index + 1,
        currentQuesScore: answer === correctAnswer ? 10 : 0,
        myScore: this.state.score1,
        sentRequestBy: this.state.senderId,
        sentRequestTo: this.state.receiverId,
        timeRemaining: this.state.timeRemaining
      };
      this.state.gameType === "friend"
        ? socket.emit("isUserOnline", this.state.userId, returnData => {
            if (returnData.key) socket.emit("myScore", scoreObj);
            else {
              initUser(this.state.userId, this.state.name);
              setTimeout(() => {
                socket.emit("myScore", scoreObj);
              }, 500);
            }
          })
        : null;
    }, 500);
  }

  //  ******************** update score other player ********************

  updateScoreOther(answer) {
    if (answer === correctAnswer)
      this.setState({
        score2: this.state.score2 + 10 + this.state.timeRemaining
      });

    // ~~~~~~~~~~ generate Random time in case of Random mode ~~~~~~~~~
    let timeArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let timeRemaining2 = Math.floor(Math.random() * timeArray.length);

    // ~~~~~~~~~~ store Graph Data ~~~~~~~~~
    let graphData = {};
    graphData = {
      score2: answer === correctAnswer ? 10 : 0,
      timeRemaining2:
        this.state.gameType === "friend"
          ? this.state.timeRemaining
          : timeRemaining2
    };
    this.state.graphArray[0].Player2.push(graphData);
  }

  answerModalClose() {
    this.setState({ modalVisible: false });
  }

  //  ******************** Display next question ********************

  nextQuestion() {
    this.setState({
      modalVisible: false,
      oneTimeClick: true,
      otherAns: false,
      otherSelected_a: false,
      otherSelected_b: false,
      otherSelected_c: false,
      otherSelected_d: false
    });
    let { index, questionArray } = this.state,
      gameCompleteCount = 0;
    index = index + 1;
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
    } else {
      gameCompleteCount = 1;
      if (gameCompleteCount == 1) {
        this._gameResults();
        gameCompleteCount = 2;
      }
    }
    this.setState({
      selected_a: null,
      selected_b: null,
      selected_c: null,
      selected_d: null,
      timeRemaining: 10,
      myAnswer: "",
      bonus1: "",
      bonus2: ""
    });
  }

  // ********************* game Results (win/lose) *************************

  _gameResults() {
    clearInterval(this.interval);
    if (this.state.score1 > this.state.score2) {
      this.setState({ winStatus: true });
    }
    let gameObj = {
      myUserId: this.state.userId,
      otherUserId: this.state.otherUserId,
      score1: this.state.score1,
      score2: this.state.score2,
      myQuestions: this.state.questionArray,
      subCategoryId: this.state.subCategoryId,
      right: this.state.rightCount,
      wrong: this.state.wrongCount,
      selectedLanguage: this.state.selectedLanguage,
      gameType: this.state.gameType,
      graphArray: this.state.graphArray,
      winStatus: this.state.winStatus,
      gamePlayType: this.state.gamePlayType
    };
    setTimeout(async () => {
      await clearInterval(this.interval);
      socket.removeListener("otherAnswer");
      socket.removeListener("myScore");
      socket.removeAllListeners([
        "otherAnswer",
        "gameLeft",
        "myScore",
        "player_ready"
      ]);
      this.setState({ lock: false, isLoading: false });
      this.props.navigation.navigate("Result", { gameObj: gameObj });
    }, 500);
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
      socket.removeListener("otherAnswer");
      socket.removeListener("myScore");
      this.props.navigation.navigate("Home");
    }, 200);
  }

  //  ******************** check user Online ********************

  _checkUserOnline() {
    socket.emit("isUserOnline", this.state.userId, returnData => {
      if (!returnData.key) {
        return { data: false };
      } else {
        return { data: true };
      }
    });
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
    // let { index, questionArray } = this.state
    // if (questionArray[index].english.a.length > 25 || questionArray[index].english.b.length > 25 || questionArray[index].english.c.length > 25 || questionArray[index].english.d.length > 25 || questionArray[index].hindi.a.length > 25 || questionArray[index].hindi.b.length > 25 || questionArray[index].hindi.c.length > 25 || questionArray[index].hindi.d.length > 25) {
    //     return 'yes'
    // } else {
    //     return 'no'
    // }
  }

  resizeQues() {
    let { index, questionArray } = this.state;
    if (
      questionArray[index].english.question.length > 170 ||
      questionArray[index].hindi.b.length > 170
    ) {
      return "yes";
    } else {
      return "no";
    }
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
      outputRange: [-80, 6]
    });
    const introButton3 = this.animatedValue4.interpolate({
      inputRange: [0, 1],
      outputRange: [-120, 7]
    });
    const introButton4 = this.animatedValue5.interpolate({
      inputRange: [0, 1],
      outputRange: [-150, 8]
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
      otherSelected_a,
      otherSelected_b,
      otherSelected_c,
      otherSelected_d,
      score1,
      otherAns,
      otherUserSelected,
      score2,
      selected_a,
      selected_b,
      selected_c,
      selected_d
    } = this.state;
    if (this.state.questionArray.length > 0) {
      if (index <= this.state.questionArray.length - 1) {
        if (selectedLanguage == "English") {
          questionList = questionArray[index].english;
          correctAnswer = questionArray[index].correctAnswer;
        } else if (selectedLanguage == "Hindi") {
          questionList = questionArray[index].hindi;
          correctAnswer = questionArray[index].correctAnswer;
        }
      }
    }

    return this.state.questionArray.length > 0 ? (
      <ImageBackground
        source={require("../image/Invite_friend/bg.png")}
        style={{ flex: 1 }}
      >
        <Loader visible={this.state.isLoading} />
        <View>
          <View style={{ paddingTop: scaleHeight(10) }}>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={{}}
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
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "row",
                  flex: 1,
                  justifyContent: "space-between",
                  paddingHorizontal: scaleWidth(10)
                }}
              >
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{ fontSize: normalizeFont(18), textAlign: "left" }}
                  >
                    <Textellipsis mytextvar={this.state.name} maxlimit={15} />
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: normalizeFont(18),
                      textAlign: "right",
                      right: scaleWidth(15)
                    }}
                  >
                    <Textellipsis
                      mytextvar={this.state.otherName}
                      maxlimit={15}
                    />
                  </Text>
                </View>
              </View>
            </View>
          </View>
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
          <QuitModal
            visible={this.state.quitModal}
            message="Are you sure you want to quit game?"
            No={() => this.setState({ quitModal: false })}
            Yes={() => this._quitGame()}
          />

          {this.state.logoutModal ? (
            <ProfileAlert
              onRequestClose={() =>
                this.logoutModalOpen(!this.state.logoutModal)
              }
              visible={this.state.logoutModal}
              alertMessage={this.state.alertMessage}
              cancelButton={() => this.setState({ logoutModal: false })}
              logoutModalClose={() =>
                this.logoutModalClose(this.state.logoutModal)
              }
              image={this.state.image1}
              name={this.state.name}
              country={this.state.country}
              states={this.state.states}
              win={this.state.win}
              lose={this.state.lose}
            />
          ) : null}

          <ProfileAlert
            onRequestClose={() => this.state.profile2Modal}
            visible={this.state.profile2Modal}
            cancelButton={() => this.setState({ profile2Modal: false })}
            logoutModalClose={() => this.setState({ profile2Modal: false })}
            image={this.state.image2}
            name={this.state.otherName}
            country={this.state.country2}
            states={this.state.states2}
            win={this.state.win2}
            lose={this.state.lose2}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
              marginHorizontal: scaleWidth(5),
              width: width - scaleWidth(10),
              padding: scaleHeight(5)
            }}
          >
            <TouchableOpacity
              onPress={() => this.logoutModalOpen()}
              style={{
                shadowColor: "black",
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 1,
                marginLeft: scaleWidth(-2)
              }}
            >
              <Image
                source={
                  this.state.image1 ? { uri: this.state.image1 } : profileImage
                }
                style={{
                  width: scaleWidth(80),
                  height: scaleHeight(100),
                  borderRadius: 10,
                  borderColor: "white",
                  borderWidth: 5
                }}
                resizeMode="stretch"
              />
            </TouchableOpacity>
            <Animatable.View ref={ref => (this.score1 = ref)}>
              <ImageBackground
                source={require("../image/Gameplay/Bluescroce.png")}
                style={{ width: scaleWidth(45), marginLeft: scaleWidth(7) }}
                resizeMode="contain"
              >
                <Text
                  style={{ color: "white", padding: 10, textAlign: "center" }}
                >
                  {score1}
                </Text>
              </ImageBackground>
            </Animatable.View>

            <View style={{ flexDirection: "row" }}>
              <Animatable.View
                ref={ref => (this.plus1 = ref)}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  left: scaleWidth(5)
                }}
              >
                <ImageBackground
                  source={require("../image/Gameplay/score.png")}
                  style={{
                    height: scaleHeight(30),
                    width: scaleWidth(40),
                    alignSelf: "center",
                    justifyContent: "center",
                    alignItems: "center",
                    transform: [{ rotate: "180deg" }]
                  }}
                  resizeMode="contain"
                >
                  <Text
                    style={{
                      fontSize: 18,
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center"
                    }}
                  >
                    {this.state.bonus2}
                  </Text>
                </ImageBackground>
              </Animatable.View>

              <ImageBackground
                source={require("../image/Gameplay/clock.png")}
                resizeMode="contain"
                style={{
                  bottom: 25,
                  width: scaleWidth(60),
                  height: scaleHeight(60),
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Animatable.Text
                  ref={ref => (this.clock = ref)}
                  style={{
                    color: "white",
                    fontSize: normalizeFont(22),
                    top: scaleHeight(2)
                  }}
                >
                  {this.state.timeRemaining}
                </Animatable.Text>
              </ImageBackground>

              <Animatable.View
                ref={ref => (this.plus2 = ref)}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  right: scaleWidth(5)
                }}
              >
                <ImageBackground
                  source={require("../image/Gameplay/score.png")}
                  style={{
                    height: scaleHeight(30),
                    width: scaleWidth(40),
                    alignSelf: "center",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                  resizeMode="contain"
                >
                  <Text
                    style={{
                      fontSize: 18,
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center"
                    }}
                  >
                    {this.state.bonus2}
                  </Text>
                </ImageBackground>
              </Animatable.View>
            </View>

            <Animatable.View ref={ref => (this.score2 = ref)}>
              <ImageBackground
                source={require("../image/Gameplay/Orangescore.png")}
                style={{ width: scaleWidth(45) }}
                resizeMode="contain"
              >
                <Text
                  style={{ color: "white", padding: 10, textAlign: "center" }}
                >
                  {score2}
                </Text>
              </ImageBackground>
            </Animatable.View>
            <TouchableOpacity
              onPress={() => this.setState({ profile2Modal: true })}
              style={{
                shadowColor: "black",
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 1
              }}
            >
              <Image
                source={
                  this.state.image2 ? { uri: this.state.image2 } : profileImage
                }
                style={{
                  width: scaleWidth(80),
                  height: scaleHeight(100),
                  borderRadius: 10,
                  borderColor: "white",
                  borderWidth: 5
                }}
              />
            </TouchableOpacity>
          </View>

          <Image
            source={require("../image/Gameplay/line.png")}
            style={{ width }}
          />
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
                  paddingHorizontal: scaleWidth(5)
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
            >
              <Image
                source={
                  questionArray[9].valueOther == "green"
                    ? greenDot
                    : questionArray[9].valueOther == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
              <Image
                source={
                  questionArray[8].valueOther == "green"
                    ? greenDot
                    : questionArray[8].valueOther == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
              <Image
                source={
                  questionArray[7].valueOther == "green"
                    ? greenDot
                    : questionArray[7].valueOther == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
              <Image
                source={
                  questionArray[6].valueOther == "green"
                    ? greenDot
                    : questionArray[6].valueOther == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
              <Image
                source={
                  questionArray[5].valueOther == "green"
                    ? greenDot
                    : questionArray[5].valueOther == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
              <Image
                source={
                  questionArray[4].valueOther == "green"
                    ? greenDot
                    : questionArray[4].valueOther == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
              <Image
                source={
                  questionArray[3].valueOther == "green"
                    ? greenDot
                    : questionArray[3].valueOther == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
              <Image
                source={
                  questionArray[2].valueOther == "green"
                    ? greenDot
                    : questionArray[2].valueOther == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
              <Image
                source={
                  questionArray[1].valueOther == "green"
                    ? greenDot
                    : questionArray[1].valueOther == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
              <Image
                source={
                  questionArray[0].valueOther == "green"
                    ? greenDot
                    : questionArray[0].valueOther == "red"
                    ? redDot
                    : greyDot
                }
                resizeMode="stretch"
              />
            </View>
          </View>

          <ScrollView>
            <View
              style={{
                justifyContent: "center",
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
                  <Text
                    multiline={true}
                    style={[
                      styles.terms,
                      {
                        fontSize:
                          this.resizeQues == "yes"
                            ? normalizeFont(16)
                            : normalizeFont(20)
                      }
                    ]}
                  >
                    {questionList.question}
                  </Text>
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
                    multiline={true}
                    style={[
                      styles.terms,
                      {
                        fontSize:
                          this.resizeQues == "yes"
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

              {/* {this.state.onCheckedAnswer ?
                                    <Animated.View style={{ top: exitButton1, position: 'relative', zIndex: 0, position: 'relative' }}>
                                        <TouchableOpacity onPress={() => this.onCheckedAnswer("a", this.state.questionArray[index].question_Id)} style={{ marginVertical: 10, }} >
                                            <Image source={otherSelected_a ? wrongQuestionBG : right ? rightQuestionBG : wrong ? wrongQuestionBG : defaultQuestionBG} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                            <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: 15, color: 'black', fontWeight: '800', fontSize: this.resize() == 'yes' ? normalizeFont(13) : normalizeFont(17) }}>{questionList.a}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => this.onCheckedAnswer("b", this.state.questionArray[index].question_Id)} style={{ marginVertical: 10, }} >
                                            <Image source={otherSelected_b ? wrongQuestionBG : right ? rightQuestionBG : wrong ? wrongQuestionBG : defaultQuestionBG} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                            <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: 15, color: 'black', fontWeight: '800', fontSize: this.resize() == 'yes' ? normalizeFont(13) : normalizeFont(17) }}>{questionList.b}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => this.onCheckedAnswer("c", this.state.questionArray[index].question_Id)} style={{ marginVertical: 10, }} >
                                            <Image source={otherSelected_c ? wrongQuestionBG : right ? rightQuestionBG : wrong ? wrongQuestionBG : defaultQuestionBG} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                            <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: 15, color: 'black', fontWeight: '800', fontSize: this.resize() == 'yes' ? normalizeFont(13) : normalizeFont(17) }}>{questionList.c}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => this.onCheckedAnswer("d", this.state.questionArray[index].question_Id)} style={{ marginVertical: 10, }} >
                                            <Image source={otherSelected_d ? wrongQuestionBG : right ? rightQuestionBG : wrong ? wrongQuestionBG : defaultQuestionBG} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                            <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: 15, color: 'black', fontWeight: '800', fontSize: this.resize() == 'yes' ? normalizeFont(13) : normalizeFont(17) }}>{questionList.d}</Text>
                                        </TouchableOpacity>

                                    </Animated.View>
                                    :
                                    <Animated.View
                                        style={{ opacity, top: Platform.OS === 'ios' ? 0 : -10 }} >
                                        <Animated.View style={{ top: introButton1, position: 'relative', zIndex: 0 }}>
                                            <TouchableOpacity onPress={() => this.onCheckedAnswer("a", this.state.questionArray[index].question_Id)} style={{ marginVertical: scaleHeight(10), }} >
                                                <Image source={otherSelected_a ? wrongQuestionBG : selected_a ? rightQuestionBG : selected_a === false ? wrongQuestionBG : defaultQuestionBG} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                                <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: 15, color: 'black', fontWeight: '800', fontSize: this.resize() == 'yes' ? normalizeFont(13) : normalizeFont(17) }}>{questionList.a}</Text>
                                            </TouchableOpacity>
                                        </Animated.View>
                                        <Animated.View style={{ top: introButton2, position: 'relative', zIndex: 0 }}>
                                            <TouchableOpacity onPress={() => this.onCheckedAnswer("b", this.state.questionArray[index].question_Id)} style={{ marginVertical: scaleHeight(10), }} >
                                                <Image source={otherSelected_b ? wrongQuestionBG : selected_b ? rightQuestionBG : selected_b === false ? wrongQuestionBG : defaultQuestionBG} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                                <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: 15, color: 'black', fontWeight: '800', fontSize: this.resize() == 'yes' ? normalizeFont(13) : normalizeFont(17) }}>{questionList.b}</Text>
                                            </TouchableOpacity>
                                        </Animated.View>
                                        <Animated.View style={{ top: introButton3, position: 'relative', zIndex: 0 }}>
                                            <TouchableOpacity onPress={() => this.onCheckedAnswer("c", this.state.questionArray[index].question_Id)} style={{ marginVertical: scaleHeight(10), }} >
                                                <Image source={otherSelected_c ? wrongQuestionBG : selected_c ? rightQuestionBG : selected_c === false ? wrongQuestionBG : defaultQuestionBG} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                                <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: 15, color: 'black', fontWeight: '800', fontSize: this.resize() == 'yes' ? normalizeFont(13) : normalizeFont(17) }}>{questionList.c}</Text>
                                            </TouchableOpacity>
                                        </Animated.View>

                                        <Animated.View style={{ top: introButton4, position: 'relative', zIndex: 0 }}>
                                            <TouchableOpacity onPress={() => this.onCheckedAnswer("d", this.state.questionArray[index].question_Id)} style={{ marginVertical: scaleHeight(10), }} >
                                                <Image source={otherSelected_d ? wrongQuestionBG : selected_d ? rightQuestionBG : selected_d === false ? wrongQuestionBG : defaultQuestionBG} style={{ zIndex: 0, position: 'relative' }} resizeMode='stretch' />
                                                <Text style={{ zIndex: 1, position: 'absolute', alignSelf: 'center', top: 15, color: 'black', fontWeight: '800', fontSize: this.resize() == 'yes' ? normalizeFont(13) : normalizeFont(17) }}>{questionList.d}</Text>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    </Animated.View>
                                } */}

              {!this.state.isQuesImg ? (
                <Animated.View
                  style={{ opacity, top: Platform.OS === "ios" ? 0 : -10 }}
                >
                  <Animated.View
                    style={{
                      top: introButton1,
                      position: "relative",
                      paddingHorizontal: scaleWidth(5)
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        this.onCheckedAnswer(
                          "a",
                          this.state.questionArray[index]._id
                        )
                      }
                      style={{ marginVertical: scaleHeight(10) }}
                    >
                      <ImageBackground
                        source={
                          otherSelected_a
                            ? wrongQuestionBG
                            : selected_a
                            ? rightQuestionBG
                            : selected_a === false
                            ? wrongQuestionBG
                            : defaultQuestionBG
                        }
                        style={{
                          width: width - 80,
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
                      top: introButton2,
                      position: "relative",
                      paddingHorizontal: scaleWidth(5)
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        this.onCheckedAnswer(
                          "b",
                          this.state.questionArray[index]._id
                        )
                      }
                      style={{ marginVertical: scaleHeight(10) }}
                    >
                      <ImageBackground
                        source={
                          otherSelected_b
                            ? wrongQuestionBG
                            : selected_b
                            ? rightQuestionBG
                            : selected_b === false
                            ? wrongQuestionBG
                            : defaultQuestionBG
                        }
                        style={{
                          width: width - 80,
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
                  <Animated.View
                    style={{
                      top: introButton3,
                      position: "relative",
                      paddingHorizontal: scaleWidth(5)
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        this.onCheckedAnswer(
                          "c",
                          this.state.questionArray[index]._id
                        )
                      }
                      style={{ marginVertical: scaleHeight(10) }}
                    >
                      <ImageBackground
                        source={
                          otherSelected_c
                            ? wrongQuestionBG
                            : selected_c
                            ? rightQuestionBG
                            : selected_c === false
                            ? wrongQuestionBG
                            : defaultQuestionBG
                        }
                        style={{
                          width: width - 80,
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
                      top: introButton4,
                      position: "relative",
                      paddingHorizontal: scaleWidth(5)
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        this.onCheckedAnswer(
                          "d",
                          this.state.questionArray[index]._id
                        )
                      }
                      style={{ marginVertical: scaleHeight(10) }}
                    >
                      <ImageBackground
                        source={
                          otherSelected_d
                            ? wrongQuestionBG
                            : selected_d
                            ? rightQuestionBG
                            : selected_d === false
                            ? wrongQuestionBG
                            : defaultQuestionBG
                        }
                        style={{
                          width: width - 80,
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
                        onPress={() =>
                          this.onCheckedAnswer(
                            "a",
                            this.state.questionArray[index]._id
                          )
                        }
                        style={{ marginVertical: scaleHeight(6) }}
                      >
                        <ImageBackground
                          source={
                            otherSelected_a
                              ? wrongQuestionBG
                              : selected_a
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
                              color: "black",
                              paddingHorizontal: 2.5,
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
                        onPress={() =>
                          this.onCheckedAnswer(
                            "b",
                            this.state.questionArray[index]._id
                          )
                        }
                        style={{ marginVertical: scaleHeight(6) }}
                      >
                        <ImageBackground
                          source={
                            otherSelected_b
                              ? wrongQuestionBG
                              : selected_b
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
                              color: "black",
                              paddingHorizontal: 2.5,
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
                        onPress={() =>
                          this.onCheckedAnswer(
                            "c",
                            this.state.questionArray[index]._id
                          )
                        }
                        style={{ marginVertical: scaleHeight(6) }}
                      >
                        <ImageBackground
                          source={
                            otherSelected_c
                              ? wrongQuestionBG
                              : selected_c
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
                              color: "black",
                              paddingHorizontal: 2.5,
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
                        onPress={() =>
                          this.onCheckedAnswer(
                            "d",
                            this.state.questionArray[index]._id
                          )
                        }
                        style={{
                          marginTop: scaleHeight(6),
                          marginBottom: scaleHeight(10)
                        }}
                      >
                        <ImageBackground
                          source={
                            otherSelected_d
                              ? wrongQuestionBG
                              : selected_d
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
                              color: "black",
                              paddingHorizontal: 2.5,
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
            explanation={questionList.explanation}
            Next={() => this.nextQuestion()}
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
    padding: scaleHeight(10)
  },
  terms: {
    fontSize: 20,
    color: "black",
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 30,
    paddingHorizontal: scaleWidth(2.5)
  }
});
