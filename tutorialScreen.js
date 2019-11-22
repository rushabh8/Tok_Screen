import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet, Text,
    View, Dimensions,
    ImageBackground,
    Platform,
    ScrollView,
    TouchableOpacity,
    Image, TextInput, FlatList
} from 'react-native';
// import ImageSlider from 'react-native-image-slider';
import styles from '../components/styles/styles'
import { scaleWidth, scaleHeight, normalizeFont } from '../components/common/Responsive';
const { width, height } = Dimensions.get('window');
export default class tutorialScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        }
    }


    render() {
        return (
    <View style={[styles.commonContainer,{paddingTop: scaleHeight(75)}]}>
    <FlatList
    style={{  }}
    horizontal={true}
    keyExtractor={(item, index) => index.toString()}
    showsHorizontalScrollIndicator={false}
    data={[
        {
            'image':require('../image/TutorialScreen/Home.png') ,
           
        },
        {
            'image':require('../image/TutorialScreen/Select-Game.png'),
           
        },
        {
            'image': require('../image/TutorialScreen/your-topic.png'),
           
        },
        {
            'image':  require('../image/TutorialScreen/Select-Mode.png')
           
        },
        {
            'image': require('../image/TutorialScreen/Select-type.png'),
            
        },
        {
            'image':  require('../image/TutorialScreen/Game-start-soon.png')
            
        },
        {
            'image':  require('../image/TutorialScreen/Test1.png'),
            
        },
        {
            'image':  require('../image/TutorialScreen/Explanation_practice-mode.png'),
            
        },
        {
            'image':   require('../image/TutorialScreen/Select-type_Random&play_with_friend.png')
            
        },
        {
            'image':  require('../image/TutorialScreen/searching.png'),
            
        },
        {
            'image':   require('../image/TutorialScreen/Random_gameplay.png')
            
        },
        {
            'image':   require('../image/TutorialScreen/Group.png'),
            
        },
        {
            'image':   require('../image/TutorialScreen/Game-request-accept.png'),
            
        },
        {
            'image': require('../image/TutorialScreen/Friend-List..png'),
            
        },
        {
            'image':  require('../image/TutorialScreen/Group-GamePlay.png'), 
            
        },
        {
            'image': require('../image/TutorialScreen/select-your-mode.png')
            
        },
        {
            'image':  require('../image/TutorialScreen/test.png'),
            
        },
        {
            'image': require('../image/TutorialScreen/next-question.png'),
            
        },
        {
            'image': require('../image/TutorialScreen/time-mode-question.png'),
            
        },
        {
            'image':  require('../image/TutorialScreen/dual-mode.png'),
            
        },
        {
            'image':  require('../image/TutorialScreen/test12.png'),
            
        },
        {
            'image':  require('../image/TutorialScreen/test3.png'),
            
        },
        {
            'image':   require('../image/TutorialScreen/leaderboard.png'),
            
        },
    ]}
    renderItem={({ item }) =>
     <View style={{flex:1,marginHorizontal:20}}>
            <Image source={item.image} style={{height:scaleHeight(500),width:scaleWidth(250)}}/>
    </View>
}
/>
</View>
    )
      }

}
