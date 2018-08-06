import React from 'react'
import { StyleSheet, Platform, Image, Text, View, Button } from 'react-native'
import firebase from 'firebase'

export default class Main extends React.Component {
  state = { currentUser: null }
  handleLogout = () => {
    // const { email, password } = this.state
    firebase
      .auth()
      .signOut()
      .then(() => this.props.navigation.navigate('Loading'))
      .catch(error => this.setState({ errorMessage: error.message }))
  }
  componentDidMount() {
    const { currentUser } = firebase.auth()
    console.log(currentUser.photoURL)
    this.setState({ currentUser, photoUrl: currentUser.photoURL })
  }

  render() {
    const { currentUser, photoUrl } = this.state

    return (
          <View style={styles.container}>
            <Text>
              Hi {currentUser && currentUser.email && currentUser.displayName}!
            </Text>
            <Image style={styles.image} source={{ uri: photoUrl }} />
            <Button title="Logout" onPress={this.handleLogout} />
          </View>
        )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    marginTop: 15,
    width: 150,
    height: 150,
    borderColor: "rgba(0,0,0,0.2)",
    borderWidth: 3,
    borderRadius: 150
  }
})