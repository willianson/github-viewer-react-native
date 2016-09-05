/**
 * By Willianson Araujo
 * At 2016-08-30
 */



import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View} from 'react-native';



class AwesomeProject extends Component {
  render() {
    return (
      <View>
        <Text>Sorry, current version is for Android only.</Text>
      </View>
    );
  }
}



AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
