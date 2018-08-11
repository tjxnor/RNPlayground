import React from 'react'
import { StyleSheet, Platform, Image, Text, View } from 'react-native'
import { createSwitchNavigator } from 'react-navigation'
import firebase from 'firebase'
// import the different screens
import Loading from './src/views/Loading'
import SignUp from './src/views/SignUp'
import Login from './src/views/Login'
import LoginOptions from './src/views/LoginOptions'
import Main from './src/views/Main'
import MainTabsNav from './src/MainTabsNav'
import MainStackNav from './src/MainStackNav'
import { config } from './config'
// create our app's navigation stack

const Nav = createSwitchNavigator(
  {
    Loading,
    SignUp,
    LoginOptions,
    Main,
    MainStackNav,
    MainTabsNav
  },
  {
    initialRouteName: 'Loading'
  }
)

class App extends React.Component {
  componentWillMount() {
    const { apiKey, authDomain, databaseURL, projectId, storageBucket, messagingSenderId } = config;
    firebase.initializeApp({
      apiKey, authDomain, databaseURL, projectId, storageBucket, messagingSenderId
    })
  }

  render() {
    return <Nav />
  }
}


export default App
