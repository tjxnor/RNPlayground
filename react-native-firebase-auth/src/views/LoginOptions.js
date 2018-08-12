import React from 'react'
import { StyleSheet, Text, TextInput, View, Button } from 'react-native'
import firebase from 'firebase'
import Expo from "expo"

export default class LoginOptions extends React.Component {
  state = { email: '', password: '', errorMessage: null }
  
  // Using a redirect.

  handleLoginWithGoogle = async () => {
    try {
      const result = await Expo.Google.logInAsync({
        androidClientId:
          "506834437624-6bt0cd92oj8q36knli61q2p88rlbl9oa.apps.googleusercontent.com",
        //iosClientId: YOUR_CLIENT_ID_HERE,  <-- if you use iOS
        scopes: ["profile", "email"]
      })

      if (result.type === "success") {
        var credential = firebase.auth.GoogleAuthProvider.credential(
              result.idToken);
        firebase.auth().signInAndRetrieveDataWithCredential(credential)
        // .then(() => this.props.navigation.navigate('Loading'))
        .catch(error => this.setState({ errorMessage: error.message }))
        // this.setState({
        //   signedIn: true,
        //   name: result.user.name,
        //   photoUrl: result.user.photoUrl
        // })
      } else {
        console.log("cancelled")
      }
    } catch (e) {
      console.log("error", e)
    }
  }

  // handleLoginWithGoogleFirebase = () => {
  //   const { email, password } = this.state;

  //   firebase.auth().getRedirectResult().then(function(result) {
  //     if (result.credential) {
  //       // This gives you a Google Access Token.
  //       var token = result.credential.accessToken;
  //     }
  //     var user = result.user;
  //   })
  //   .catch(error => this.setState({ errorMessage: error.message }));

  //   // Start a sign in process for an unauthenticated user.
  //   var provider = new firebase.auth.GoogleAuthProvider();
  //   provider.addScope('profile');
  //   provider.addScope('email');
  //   firebase.auth().signInWithRedirect(provider);
  // }
  
  handleLogin = () => {
    const { email, password } = this.state
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      // .then(() => this.props.navigation.navigate('Loading'))
      .catch(error => this.setState({ errorMessage: error.message }))
  }

  render() {
    return (
      <View style={styles.container}>
        <Button title="Login With Google" onPress={this.handleLoginWithGoogle} />
        <Text>Login</Text>
        {this.state.errorMessage &&
          <Text style={{ color: 'red' }}>
            {this.state.errorMessage}
          </Text>}
        <TextInput
          style={styles.textInput}
          autoCapitalize="none"
          placeholder="Email"
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
        <TextInput
          secureTextEntry
          style={styles.textInput}
          autoCapitalize="none"
          placeholder="Password"
          onChangeText={password => this.setState({ password })}
          value={this.state.password}
        />
        <Button title="Login" onPress={this.handleLogin} />
        <Button
          title="Don't have an account? Sign Up"
          onPress={() => this.props.navigation.navigate('SignUp')}
        />
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
  textInput: {
    height: 40,
    width: '90%',
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 8
  }
})