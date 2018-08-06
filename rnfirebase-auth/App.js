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
// create our app's navigation stack

const Nav = createSwitchNavigator(
  {
    Loading,
    SignUp,
    Login,
    LoginOptions,
    Main
  },
  {
    initialRouteName: 'Loading'
  }
)

class App extends React.Component {
  componentWillMount() {
    firebase.initializeApp({
      apiKey: 'AIzaSyDmh7ODJYwgaqr-Jeekiq0HXmH8hYNNiTI',
      authDomain: 'schedulingapp-v1.firebaseapp.com',
      databaseURL: 'https://schedulingapp-v1.firebaseio.com',
      projectId: 'schedulingapp-v1',
      storageBucket: 'schedulingapp-v1.appspot.com',
      messagingSenderId: '506834437624'
    })
  }

  render() {
    return <Nav />
  }
}


export default App
