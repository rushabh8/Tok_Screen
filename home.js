import React, { Component } from "react";
import {
  Alert,
  Text,
  View,
  Dimensions,
  ImageBackground,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  AsyncStorage
} from "react-native";
import ProfileAlert from "./profileModal";
import FriendRequest from "./friendRequestModal";
import styles from "../components/styles/styles";
import {
  scaleWidth,
  scaleHeight,
  normalizeFont
} from "../components/common/Responsive";
import { MusicFunc, isBackgroundMusic } from "../components/common/SoundFunc";
import { socket } from "../webService/global";
import { userProfile, userProfileData } from "../webService/ApiStore";
import webservice from "../webService/Api";
import Loader from "./loader";
import EditProfile from "./editProfile";
import SelectMode from "./selectMode";
import Textellipsis from "../components/common/Textellipsis";

const { width } = Dimensions.get("window");
const avatar = require("../image/create/default.png");
const profileImage = require("../image/home/image.png");
var searchText = "";

const HeaderLeft = ({ navigation, props }) => (
  <TouchableOpacity
    onPress={() => {
      navigation.navigate("Setting"), MusicFunc("Button_Click_Music");
    }}
    style={{
      flex: 2,
      justifyContent: "flex-start",
      paddingTop: scaleHeight(10)
    }}
  >
    <Image
      source={require("../image/home/setting.png")}
      style={{ tintColor: "white" }}
    />
  </TouchableOpacity>
);

const HeaderRight = ({ navigation, props }) => (
  <TouchableOpacity
    onPress={() => {
      alert("We are working on this!!"), MusicFunc("Button_Click_Music");
    }}
    style={{
      flex: 2,
      justifyContent: "flex-end",
      paddingBottom: scaleHeight(10),
      alignItems: "flex-end"
    }}
  >
    <Image
      source={require("../image/home/chat.png")}
      style={{ tintColor: "white" }}
    />
  </TouchableOpacity>
);

const Header = props => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: scaleWidth(2.5)
    }}
  >
    <Text style={{ color: "white", fontSize: normalizeFont(23) }}>
      {props.title}
    </Text>
  </View>
);

const Footer = ({ navigation, props }) => (
  <View style={{ backgroundColor: "white" }}>
    <View style={[styles.homeSearchView, { marginVertical: 10 }]}>
      <TextInput
        allowFontScaling={false}
        maxLength={100}
        autoCapitalize="none"
        placeholderTextColor="white"
        onEndEditing={() => {
          searchText != ""
            ? navigation.navigate("SearchPlayerTopic", { data: searchText })
            : null,
            (searchText = "");
        }}
        underlineColorAndroid="transparent"
        style={styles.homeSearchText}
        placeholder="Search Player/Topic"
        returnKeyType="search"
        onChangeText={text => (searchText = text)}
      />
      <TouchableOpacity
        style={{ flex: 0.3 }}
        onPress={() => {
          if (searchText != "")
            navigation.navigate("SearchPlayerTopic", { data: searchText }),
              (searchText = ""),
              MusicFunc("Button_Click_Music");
        }}
      >
        <Image
          source={require("../image/create/search.png")}
          style={{ marginRight: 25 }}
        />
      </TouchableOpacity>
    </View>
    <View
      style={{
        backgroundColor: "#D00E17",
        width: width,
        height: 1,
        marginTop: 2.5
      }}
    />
  </View>
);

const ImageHeaderHome = props => {
  return (
    <ImageBackground
      style={{
        width,
        height: Platform.OS == "ios" ? 45 : 55,
        position: "absolute",
        top: 0,
        left: 0
      }}
      source={require("../image/Reset_Password/header.png")}
      resizeMode="cover"
    >
      <View
        style={{
          paddingHorizontal: 10,
          flexDirection: "row",
          height: 45,
          backgroundColor: "transparent"
        }}
      >
        <HeaderLeft {...props} style={{ backgroundColor: "transparent" }} />
        <Header {...props} style={{ backgroundColor: "transparent" }} />
        <HeaderRight {...props} style={{ backgroundColor: "transparent" }} />
      </View>
      <Footer {...props} style={{ backgroundColor: "transparent" }} />
    </ImageBackground>
  );
};

let gameRequestCount;

export default class Home extends Component {
  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params || {};
    return {
      tabBarVisible: true,
      header: props => <ImageHeaderHome {...props} title="Home" />
    };
  };
  constructor(props) {
    disabled = false;
    super(props);
    this.state = {
      logoutModal: false,
      userId: "",
      name: "",
      country: "",
      state: "",
      win: "",
      lose: "",
      myTopics: [],
      image: "",
      isLoading: false,
      gameMode: "",
      ClubName: "",
      ClubMode: null,
      ClubGroupName: null,
      ClubScore: null,
      ClubImage: "",
      clubScoreText: "No History",
      rank: "",
      friendRequest: false,
      friendData: "",
      response: null,
      clubHistory: "",
      gameHistory: ""
    };
  }

  componentDidMount() {
    AsyncStorage.getItem("MusicOn").then(isMusic => {
      if (JSON.parse(isMusic))
        !isBackgroundMusic ? MusicFunc("Background_Music", "play") : null;
    });
    EditProfile._dataRefresh(this._refresh);
    SelectMode._dataRefresh(this.refresh_topic);
    this.setState({ isLoading: true });
    AsyncStorage.getItem("userId").then(res => {
      let userId = JSON.parse(res);
      this.setState({ userId }, () => {
        this.viewProfile();
        this.setUserStatus();
        this.gameHistory();
      });
      // setTimeout(() => {
      //     this.viewProfile()
      //     this.setUserStatus()
      //     this.gameHistory()
      // }, 500)
    });

    gameRequestCount = 0;
    socket.on("sendingGameRequest", data => {
      if (gameRequestCount == 0) {
        gameRequestCount = 1;
        setTimeout(() => {
          this.setState({ friendRequest: true, friendData: data });
        }, 500);
        typeof data.topicName == "object"
          ? this.setState({ gameType: "smartsort" })
          : this.setState({ gameType: "topten" });
        setTimeout(() => {
          if (this.state.response == null || this.state.response == false) {
            this.setState({ friendRequest: false });
          }
        }, 15000);
      }
    });
  }

  refresh_topic = () => {
    this.viewProfile();
  };

  //---------------------------------------- Game History API ---------------------------------------

  gameHistory = () => {
    let variables = {
      userId: this.state.userId
    };
    return webservice(variables, "users/gameHistory", "POST").then(resp => {
      let clubHistoryData = [];
      clubHistoryData = resp.data.data.filter(x => x.gameMode === "GROUP");
      this.setState({ clubHistory: clubHistoryData });

      let soloDualGameHistory = [];
      soloDualGameHistory = resp.data.data.filter(
        x => x.gameMode === "SOLO" || x.gameMode === "DULE"
      );
      this.setState({ gameHistory: soloDualGameHistory });
    });
  };

  //---------------------------------------- View Profile API ---------------------------------------

  viewProfile() {
    let variables = {
      userId: this.state.userId
    };
    return webservice(variables, "users/viewProfile", "POST").then(resp => {
      this.setState({ isLoading: false });
      if (resp.data.responseCode === 200) {
        AsyncStorage.setItem(
          "MyProfileData",
          JSON.stringify(resp.data.data[0])
        );
        this.setState({
          name: resp.data.data[0].name,
          country: resp.data.data[0].country,
          state: resp.data.data[0].state,
          win: resp.data.data[0].win,
          lose: resp.data.data[0].lose,
          myTopics: resp.data.data[0].interests,
          image: resp.data.data[0].avatar
        });
        if (resp.data.data[0].avatar != null || undefined || "") {
          AsyncStorage.setItem(
            "MyProfilePhoto",
            JSON.stringify(resp.data.data[0].avatar)
          );
        }
        userProfile(resp.data.data[0]);
      } else if (resp.data.responseCode === 1000) {
        this.setState({ isLoading: false }, () =>
          Alert.alert("TOK", resp.data.responseMessage, [
            { text: "Try Again", onPress: () => this.viewProfile() }
          ])
        );
      }
    });
  }

  //************************ Accept Reject Game Request API ******************** */

  AcceptReject_requests = requestResponse => {
    this.setState({ response: true, friendRequest: false });
    let variables = {
      gameStatus: requestResponse,
      sentRequestBy: this.state.friendData.sentRequestTo,
      sentRequestTo: this.state.friendData.sentRequestById,
      type: "GAMEREQUEST",
      gameId: this.state.friendData.gameID,
      notificationId: this.state.friendData.notifictaionId
    };
    return webservice(variables, "users/AcceptRejectGameRequest", "POST").then(
      resp => {
        if (resp.data.responseCode === 200) {
          AsyncStorage.setItem(
            "gameRoomId",
            JSON.stringify(this.state.friendData.gameID)
          );
          let dataType = {
            playGameWith: "friend",
            gamePlayType: this.state.gameType,
            userId: this.state.friendData.sentRequestById,
            senderId: this.state.friendData.sentRequestTo
          };
          if (this.state.friendData.gameMode === "DULE")
            this.props.navigation.navigate("LoaderDual", {
              data: dataType,
              requestType: "incoming",
              gameMode: "DUAL"
            });
          else
            this.props.navigation.navigate("GroupInfo", {
              data: dataType,
              requestType: "incoming",
              gameMode: "GROUP"
            });
        } else if (resp.data.responseCode === 500) {
          this.setState({ friendRequest: false }, () => {
            Alert.alert("TOK", "You have rejected Game request", [
              { text: "Cancel" },
              {
                text: "OK",
                onPress: () => this.props.navigation.navigate("Home")
              }
            ]);
          });
        }
      }
    );
  };

  // ************************* set user status false ****************************

  setUserStatus() {
    let variables = {
      _id: this.state.userId,
      status: "ONLINE"
    };
    return webservice(variables, "users/onlineFalse", "POST").then(resp => {});
  }

  logoutModalOpen = visible => {
    this.setState({ logoutModal: !visible });
  };
  logoutModalClose = visible => {
    this.setState({ logoutModal: false });
  };

  _onPressPlay() {
    if (this.disabled) return;
    this.disabled = true;
    setTimeout(() => {
      this.disabled = false;
    }, 500);
    this.props.navigation.navigate("SelectGame");
  }

  render() {
    return (
      <ImageBackground
        source={require("../image/Invite_friend/bg.png")}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={[styles.commonContainer, { top: scaleHeight(100) }]}
        >
          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <Loader visible={this.state.isLoading} />
            {Platform.OS == "android" ? (
              <View style={{ height: scaleHeight(10) }} />
            ) : null}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                marginTop:
                  Platform.OS == "ios" ? scaleHeight(15) : scaleHeight(2)
              }}
            >
              <View style={{ flexDirection: "column" }}>
                <Text
                  style={{
                    marginLeft: scaleWidth(6),
                    fontSize: normalizeFont(18),
                    fontWeight: "800",
                    fontSize: normalizeFont(18)
                  }}
                >
                  <Textellipsis mytextvar={this.state.name} maxlimit={15} />
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    this.logoutModalOpen();
                  }}
                  style={{
                    height: scaleHeight(80),
                    width: scaleWidth(80),
                    marginTop: scaleHeight(5),
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "black",
                    shadowOffset: { width: 2, height: 2 },
                    shadowOpacity: 0.5,
                    shadowRadius: 1
                  }}
                >
                  <Image
                    source={
                      this.state.image !== null || this.state.image === ""
                        ? { uri: this.state.image }
                        : profileImage
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
              </View>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    marginTop: scaleHeight(28),
                    fontSize: normalizeFont(16)
                  }}
                >
                  {this.state.country}{" "}
                </Text>
                {this.state.state === "" ||
                this.state.state === undefined ? null : (
                  <Text style={{ fontSize: normalizeFont(16) }}>
                    ({this.state.state})
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={{
                  width: scaleWidth(70),
                  height: scaleHeight(30),
                  backgroundColor: "#D00E17",
                  borderRadius: 5,
                  alignItems: "center",
                  marginTop: "18%",
                  borderBottomWidth: 2,
                  borderBottomColor: "#6E6E6E"
                }}
                onPress={() => {
                  this._onPressPlay(), MusicFunc("Button_Click_Music");
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: normalizeFont(16),
                    alignSelf: "center",
                    top: scaleHeight(5),
                    marginBottom: "10%"
                  }}
                >
                  Play
                </Text>
              </TouchableOpacity>
            </View>

            {this.state.logoutModal ? (
              <ProfileAlert
                onRequestClose={() => {
                  this.logoutModalOpen(!this.state.logoutModal);
                }}
                visible={this.state.logoutModal}
                alertMessage={this.state.alertMessage}
                cancelButton={() => this.setState({ logoutModal: false })}
                logoutModalClose={() =>
                  this.logoutModalClose(this.state.logoutModal)
                }
                image={this.state.image}
                name={this.state.name}
                country={this.state.country}
                states={
                  this.state.state === "" || this.state.state === undefined
                    ? null
                    : "(" + this.state.state + ")"
                }
                win={this.state.win}
                lose={this.state.lose}
              />
            ) : null}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                backgroundColor: "#ACACAC",
                marginTop: scaleHeight(10),
                paddingVertical: scaleHeight(5)
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginLeft: scaleWidth(15),
                  alignItems: "center"
                }}
              >
                <Image
                  source={require("../image/home//heart.png")}
                  style={{}}
                />
                <Text
                  style={{ fontWeight: "800", fontSize: normalizeFont(18) }}
                >
                  {" "}
                  My Topics
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate("MyTopics", {
                    gamePlayType: "topten"
                  }),
                    MusicFunc("Button_Click_Music");
                }}
              >
                <Image
                  source={require("../image/home/menu.png")}
                  style={{
                    marginRight: scaleWidth(15),
                    marginTop: scaleHeight(5)
                  }}
                />
              </TouchableOpacity>
            </View>
            {this.state.myTopics == null ? null : (
              <FlatList
                style={{ width: "100%" }}
                horizontal={true}
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                data={this.state.myTopics}
                renderItem={({ item }) => (
                  <View>
                    <TouchableOpacity
                      onPress={() => {
                        this.props.navigation.navigate("SelectMode", {
                          subCategoryId: item._id,
                          subCategoryName: item.subCategoryName,
                          image: item.imageUrl,
                          name: this.state.name,
                          gamePlayType: "topten"
                        }),
                          MusicFunc("Button_Click_Music"),
                          AsyncStorage.setItem("subCategoryId", item._id);
                      }}
                      style={{
                        height: scaleHeight(100),
                        width: scaleWidth(100),
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: scaleHeight(20),
                        marginHorizontal: scaleWidth(10),
                        shadowColor: "black",
                        shadowOffset: { width: 2, height: 2 },
                        shadowOpacity: 0.5,
                        shadowRadius: 1
                      }}
                    >
                      <Image
                        source={
                          item.imageUrl !== null || item.imageUrl === ""
                            ? { uri: item.imageUrl }
                            : avatar
                        }
                        style={{
                          width: scaleWidth(100),
                          height: scaleHeight(80),
                          borderRadius: 10,
                          borderColor: "white",
                          borderWidth: 5
                        }}
                      />
                    </TouchableOpacity>
                    <Text
                      style={{
                        alignSelf: "center",
                        fontWeight: "bold",
                        fontSize: normalizeFont(14),
                        width: scaleWidth(90),
                        textAlign: "center"
                      }}
                    >
                      {item.subCategoryName}
                    </Text>
                  </View>
                )}
              />
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                backgroundColor: "#ACACAC",
                marginTop: scaleHeight(10),
                paddingVertical: scaleHeight(5)
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginLeft: scaleWidth(15),
                  alignItems: "center"
                }}
              >
                <Image
                  source={require("../image/home//heart.png")}
                  style={{}}
                />
                <Text
                  style={{
                    fontWeight: "800",
                    fontSize: normalizeFont(18),
                    marginLeft: scaleWidth(2)
                  }}
                >
                  Game History
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate("SearchHistory"),
                    MusicFunc("Button_Click_Music");
                }}
              >
                <Image
                  source={require("../image/home/menu.png")}
                  style={{
                    marginRight: scaleWidth(15),
                    marginTop: scaleHeight(5)
                  }}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                width: width,
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: scaleWidth(20)
              }}
            >
              {/* ------------------------------------------ Club History ---------------------------------- */}

              {this.state.clubHistory.length != 0 ? (
                <View style={styles.homeHistory}>
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        alignSelf: "center",
                        fontWeight: "bold",
                        color: "red",
                        marginTop: scaleHeight(6),
                        fontSize: normalizeFont(16),
                        marginRight: 10
                      }}
                    >
                      CLUB
                    </Text>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{
                        alignSelf: "center",
                        fontWeight: "bold",
                        color: "red",
                        marginTop: scaleHeight(6),
                        fontSize: normalizeFont(16),
                        marginRight: 10
                      }}
                    >
                      {this.state.clubHistory[0].groupName}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 5
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "30%"
                      }}
                    >
                      <Image
                        source={{
                          uri: this.state.clubHistory[0].userData[0].avatar
                        }}
                        style={{
                          width: "80%",
                          height: scaleHeight(42),
                          borderRadius: scaleWidth(21)
                        }}
                        resizeMode="contain"
                      />
                    </View>
                    <View
                      style={{ marginHorizontal: scaleWidth(5), width: "70%" }}
                    >
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{ fontSize: normalizeFont(16), width: "100%" }}
                      >
                        {this.state.clubHistory[0].userData[0].name}
                      </Text>
                      <View style={{ flexDirection: "row" }}>
                        <Text
                          style={{
                            fontWeight: "bold",
                            fontSize: normalizeFont(16)
                          }}
                        >
                          Topic:
                        </Text>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{
                            marginHorizontal: scaleWidth(2),
                            width: "60%",
                            fontSize: normalizeFont(16)
                          }}
                        >
                          {
                            this.state.clubHistory[0].userData[0]
                              .subCategoryName
                          }
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row" }}>
                        <Text
                          style={{
                            fontWeight: "bold",
                            fontSize: normalizeFont(16)
                          }}
                        >
                          Score
                        </Text>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{
                            fontSize: normalizeFont(16),
                            marginHorizontal: scaleWidth(8)
                          }}
                        >
                          {this.state.clubHistory[0].userData[0].score}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        alignSelf: "center",
                        fontWeight: "bold",
                        color: "black",
                        fontSize: normalizeFont(16),
                        marginRight: scaleWidth(10)
                      }}
                    >
                      {this.state.rank}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.homeHistory}>
                  <Text style={{ textAlign: "center", color: "red" }}>
                    There is no Club History
                  </Text>
                </View>
              )}

              <View style={{ width: "2%" }} />

              {/* ------------------------------------ Game History  ----------------------------------------- */}
              {this.state.gameHistory.length != 0 ? (
                <View style={styles.homeHistory}>
                  {this.state.gameHistory[0].gameMode === "DULE" ? (
                    <Text
                      style={{
                        alignSelf: "center",
                        fontWeight: "bold",
                        color: "red",
                        fontSize: normalizeFont(16)
                      }}
                    >
                      DUEL
                    </Text>
                  ) : (
                    <Text
                      style={{
                        alignSelf: "center",
                        fontWeight: "bold",
                        color: "red",
                        fontSize: normalizeFont(16)
                      }}
                    >
                      SOLO
                    </Text>
                  )}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 5
                    }}
                  >
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        width: "30%"
                      }}
                    >
                      <Image
                        source={{
                          uri: this.state.gameHistory[0].userData[0].avatar
                        }}
                        style={{ width: "80%", height: scaleHeight(42) }}
                        resizeMode="contain"
                      />
                    </View>
                    <View
                      style={{ marginHorizontal: scaleWidth(5), width: "70%" }}
                    >
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{ fontSize: normalizeFont(16), width: "100%" }}
                      >
                        {this.state.gameHistory[0].userData[0].name}
                      </Text>
                      <View style={{ flexDirection: "row" }}>
                        <Text
                          style={{
                            fontWeight: "bold",
                            fontSize: normalizeFont(16)
                          }}
                        >
                          Topic:
                        </Text>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{
                            marginHorizontal: scaleWidth(2),
                            width: "60%",
                            fontSize: normalizeFont(16)
                          }}
                        >
                          {
                            this.state.gameHistory[0].userData[0]
                              .subCategoryName
                          }
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row" }}>
                        <Text
                          style={{
                            fontWeight: "bold",
                            fontSize: normalizeFont(16)
                          }}
                        >
                          Score
                        </Text>
                        <Text
                          style={{
                            fontSize: normalizeFont(16),
                            marginHorizontal: scaleWidth(2)
                          }}
                        >
                          {this.state.gameHistory[0].userData[0].score}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.homeHistory}>
                  <Text style={{ textAlign: "center", color: "red" }}>
                    There is no Game History
                  </Text>
                </View>
              )}
            </View>
            <View style={{ height: 120 }} />

            {/* Friend Request Alert */}
            {this.state.friendData != "" ? (
              <FriendRequest
                visible={this.state.friendRequest}
                message={this.state.friendData.sentRequestByName}
                topicName={
                  typeof this.state.friendData.topicName !== "object"
                    ? this.state.friendData.topicName
                    : "smartsort"
                }
                cancelButton={() => this.setState({ friendRequest: false })}
                onRequestClose={() => this.setState({ friendRequest: false })}
                No={() => this.AcceptReject_requests("REJECT")}
                Yes={() => this.AcceptReject_requests("ACCEPT")}
              />
            ) : null}
          </KeyboardAvoidingView>
        </ScrollView>
      </ImageBackground>
    );
  }
}
