import React, { Component } from "react";
import {
  KeyboardAvoidingView,
  FlatList,
  Text,
  View,
  Dimensions,
  ImageBackground,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
  AsyncStorage
} from "react-native";
import styles from "../components/styles/styles";
import {
  scaleWidth,
  scaleHeight,
  normalizeFont
} from "../components/common/Responsive";
const { width, height } = Dimensions.get("window");
import topic from "../image/home/icon.png";
const avatar = require("../image/create/default.png");
import { socket } from "../webService/global";
import webservice from "../webService/Api";
import Loader from "./loader";
import Textellipsis from "../components/common/Textellipsis";
import OfflineRequest from "./offlineRequstModal";
let showRightHeader = false;

const HeaderBack = ({ navigation, props }) => (
  <TouchableOpacity
    onPress={() => navigation.goBack(null)}
    style={{ flex: 0.5, paddingTop: scaleHeight(10) }}
  >
    <Image
      source={require("../image/BackIcon/back-icon.png")}
      style={{ tintColor: "white" }}
    />
  </TouchableOpacity>
);
const HeaderWithAddFriendList = props => (
  <View
    style={{
      flex: 1,
      justifyContent: "flex-start",
      paddingTop: scaleHeight(8)
    }}
  >
    <Text style={{ color: "white", fontSize: normalizeFont(22) }}>
      {props.title}
    </Text>
  </View>
);
const ImageHeaderWithAddFriendList = props => {
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
      />
    </ImageBackground>
  );
};
const ImageHeader = props => {
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
        <HeaderBack {...props} style={{ backgroundColor: "transparent" }} />
        <HeaderWithAddFriendList
          {...props}
          style={{ backgroundColor: "transparent" }}
        />
      </View>
    </ImageBackground>
  );
};

export default class FriendList extends Component {
  static navigationOptions = ({ navigation, props }) => {
    return {
      tabBarVisible: true,
      header: props => (
        <View>
          {navigation.state.params.onlineFriends ? (
            <ImageHeaderWithAddFriendList {...props} title="FriendList" />
          ) : (
            <ImageHeader {...props} title="FriendList" />
          )}
        </View>
      )
    };
  };

  disabled = false;
  constructor(props) {
    super(props);
    this.state = {
      userId: "",
      isLoading: false,
      selectedSubCategoryId: null,
      gamePlayType: "",
      selectedUserName: "",
      offlineUserModal: false
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    AsyncStorage.getItem("userId").then(resp =>
      this.setState({ userId: JSON.parse(resp) }, () => {
        this.getOnlineFriends();
      })
    );
    AsyncStorage.getItem("subCategoryId").then(resp =>
      this.setState({ selectedSubCategoryId: resp })
    );

    let { params } = this.props.navigation.state;
    this.setState({ gamePlayType: params.gamePlayType });
    socket.on("onlineUserUpdated", onlineUsers => {
      socket.emit("get_online_friends", { userId: this.state.userId });
    });
    // setTimeout(() => {
    //   this.getOnlineFriends();
    // }, 500);
  }

  // ************************* get online users via sockets *****************************

  getOnlineFriends() {
    socket.emit("get_online_friends", { userId: this.state.userId });
    socket.on("receive_online_friends", data => {
      const dataOnline = data.data;
      for (let i in dataOnline) {
        if (dataOnline[i].userId.isOnline === "BUSY") {
          dataOnline[i].status = "Busy";
        }
      }
      this.setState({ onlineFriends: dataOnline, isLoading: false });
    });
  }

  // ************************* get online users status *****************************

  getUserStatus(id, index) {
    let variables = {
      userId: this.state.userId
    };
    return webservice(variables, "users/getUserStatus", "POST").then(resp => {
      if (resp.data.data.isOnline === "BUSY") {
        Alert.alert("TOK", "User is BUSY", [{ text: "OK" }]);
      } else {
        this._createGameRoom(id, index);
      }
    });
  }

  // ************************* create Game Room *****************************

  _createGameRoom(id, index) {
    if (this.disabled) return;
    this.disabled = true;
    setTimeout(() => {
      this.disabled = false;
    }, 500);

    if (this.state.onlineFriends[index].status == "Busy") {
      let currentPlayer = this.state.onlineFriends[index].userId.name;
      alert(currentPlayer + " is currently Busy.");
    } else if (this.state.onlineFriends[index].status == "offline") {
      this.setState({
        selectedUserName: this.state.onlineFriends[index].userId.name,
        offlineUserModal: true
      });
    } else {
      this.setState({ isLoading: true });
      let otherUserId = id;
      let variables = {
        sendRequestBy: this.state.userId,
        gameType: this.state.gamePlayType,
        severity: "Easy",
        categoryId: this.state.selectedSubCategoryId,
        gameMode: "DULE",
        sendRequestTo: otherUserId
      };
      return webservice(variables, "users/createGameRoomtop10", "POST").then(
        resp => {
          this.setState({ isLoading: false });
          if (resp.data.responseCode === 200) {
            AsyncStorage.setItem(
              "gameRoomId",
              JSON.stringify(resp.data.data.gameId)
            );
            let data = { gamePlayType: this.state.gamePlayType };
            this.props.navigation.navigate("LoaderDual", {
              requestType: "outgoing",
              data: data
            });
          } else if (resp.data.responseCode === 100) {
            alert(resp.data.responseMessage);
          }
        }
      );
    }
  }

  _refreshFriendList() {
    this.setState({ isLoading: true });
    this.getOnlineFriends();
  }

  navigate() {
    this.props.navigation.navigate("InviteFriend");
  }

  render() {
    return (
      <ImageBackground
        source={require("../image/Invite_friend/bg.png")}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <Loader visible={this.state.isLoading} />
          {this.state.onlineFriends ? (
            this.state.onlineFriends.length > 0 ? (
              <View
                style={[
                  styles.commonContainer,
                  {
                    paddingTop: scaleHeight(10),
                    backgroundColor: "transparent"
                  }
                ]}
              >
                <FlatList
                  style={{
                    width: "100%",
                    backgroundColor: "transparent",
                    marginVertical: scaleHeight(40)
                  }}
                  data={this.state.onlineFriends}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        borderBottomWidth: 2,
                        borderBottomColor: "lightgrey",
                        alignItems: "center",
                        backgroundColor: "transparent"
                      }}
                      onPress={() =>
                        this._createGameRoom(item.userId._id, index)
                      }
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginHorizontal: 10,
                          marginVertical: 10,
                          flex: 1
                        }}
                      >
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Image
                            source={
                              item.userId.avatar !== null ||
                              item.userId.avatar === ""
                                ? { uri: item.userId.avatar }
                                : avatar
                            }
                            style={{
                              height: scaleHeight(45),
                              width: scaleWidth(45),
                              marginLeft: 10
                            }}
                          />
                          <Text
                            style={{
                              marginLeft: scaleWidth(12),
                              fontWeight: "bold",
                              fontSize: normalizeFont(20)
                            }}
                          >
                            <Textellipsis
                              mytextvar={item.userId.name}
                              maxlimit={15}
                            />
                          </Text>
                        </View>
                        <View>
                          <Image
                            source={
                              item.status == "online"
                                ? require("../image/friendList/online.png")
                                : item.status == "Busy"
                                ? require("../image/friendList/busy.png")
                                : require("../image/friendList/offline.png")
                            }
                            style={{
                              height: scaleHeight(12),
                              width: scaleWidth(12)
                            }}
                            resizeMode="contain"
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                  onRefresh={() => this._refreshFriendList()}
                  refreshing={this.state.isLoading}
                />
              </View>
            ) : (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1
                }}
              >
                <TouchableOpacity onPress={() => this.navigate()}>
                  <Text
                    style={{ color: "black", fontWeight: "bold", fontSize: 17 }}
                  >
                    Please add friends
                  </Text>
                  <Image
                    source={require("../image/friendList/plus.png")}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      alignSelf: "center"
                    }}
                  />
                </TouchableOpacity>
              </View>
            )
          ) : null}
          {/* Friend Request Alert */}
          {this.state.offlineUserModal == true ? (
            <OfflineRequest
              userName={this.state.selectedUserName}
              OkPress={() =>
                this.setState({
                  offlineUserModal: false
                })
              }
            />
          ) : null}
        </KeyboardAvoidingView>
      </ImageBackground>
    );
  }
}
