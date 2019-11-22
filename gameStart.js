
import React, { Component } from 'react';
import { StyleSheet, Text, Image, ImageBackground } from 'react-native';
import { scaleHeight } from '../components/common/Responsive';
import { MusicFunc } from '../components/common/SoundFunc';
import GameComplete from "./gameComplete";
import GameCompleteSmartSort from "./gameCompleteSmartSort";

export default class Gamestart extends Component {
  componentDidMount() {
    GameComplete._dataRefresh(this._refresh)
    GameCompleteSmartSort._dataRefresh(this._refresh)
    this._getLoaded()
  }

  callback;
  static _dataRefresh(a) {
    callback = a
  }

  _refresh = () => {
    this._getLoaded()
  }

  _getLoaded() {
    MusicFunc('Background_Music', 'stop')
    MusicFunc('Game_Review_Music', 'stop')
    MusicFunc('Three_Sec_Music');

    setTimeout(() => {
      let type = this.props.navigation.state.params.type.type
      let gamePlayType = this.props.navigation.state.params.type.gamePlayType;
      gamePlayType === "topten" ?
        this.props.navigation.navigate('QuestionTop10Solo', { type: type }) :
        this.props.navigation.navigate('QuestionSmartSortSolo', { type: type })
    }, 5000)
  }

  render() {
    return (
      <ImageBackground source={require('../image/Invite_friend/bg.png')} style={{ flex: 1 }}>
        <Text style={styles.terms}>
          GAME WILL START SOON
        </Text>
        <Image resizeMode="stretch" source={require('../image/GIF/CLOCK.gif')}
          style={{ alignSelf: 'center', top: scaleHeight(120), height: 120, width: 100 }} />
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  terms: {
    fontSize: 20,
    fontWeight: '800',
    top: scaleHeight(60),
    alignSelf: 'center'
  }
});



