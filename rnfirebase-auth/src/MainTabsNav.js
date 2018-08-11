import type {
  NavigationScreenProp,
  NavigationEventSubscription,
} from 'react-navigation';

import React from 'react';
import firebase from 'firebase'
import { Text, Platform, ScrollView, StatusBar, View, FlatList } from 'react-native';
import { SafeAreaView, createBottomTabNavigator } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SampleText from './common/SampleText';
import { Button  } from './common/ButtonWithMargin';
import Card from './common/Card';
import CardSection from './common/CardSection';
import StudioListScreen from './StudioListScreen';
import data from '../studios.json';
// import MyMainScreen from './MyMainScreen';
//import MyProfileScreen from './MyProfileScreen';

const MyNavScreen = ({ navigation, banner }) => (
  <SafeAreaView forceInset={{ horizontal: 'always', top: 'always' }}>
    <SampleText>{banner}</SampleText>
    <Button
      onPress={() => navigation.navigate('StudioList')}
      title="Go to studio list"
    />
    <Button
      onPress={() => navigation.navigate('Profile')}
      title="Go to profile tab"
    />
    <Button onPress={() => navigation.goBack(null)} title="Go back" />
	
    <StatusBar barStyle="default" />
  </SafeAreaView>
);

// const MyMainScreen = ({ navigation }) => (
//   <MyNavScreen banner="Main Screen Tab" navigation={navigation} />
// );

// MyMainScreen.navigationOptions = {
//   tabBarTestIDProps: {
//     testID: 'TEST_ID_HOME',
//     accessibilityLabel: 'TEST_ID_HOME_ACLBL',
//   },
//   tabBarLabel: 'Main',
//   tabBarIcon: ({ tintColor, focused }) => (
//     <Ionicons
//       name={focused ? 'ios-home' : 'ios-home-outline'}
//       size={26}
//       style={{ color: tintColor }}
//     />
//   ),
// };



class MyProfileScreen extends React.Component<MyProfileScreenProps> {
	state = { currentUser: null }
	handleLogout = () => {
  	firebase
  	  .auth()
  	  .signOut()
  	  // .then(() => this.props.navigation.navigate(''))
  	  .catch(error => this.setState({ errorMessage: error.message }))
	}
	componentDidMount() {
	  const { currentUser } = firebase.auth()
	  // console.log(currentUser.photoURL)
	  this.setState({ currentUser, photoUrl: currentUser.photoURL })
	}

  _s0: NavigationEventSubscription;
  _s1: NavigationEventSubscription;
  _s2: NavigationEventSubscription;
  _s3: NavigationEventSubscription;

  static navigationOptions = {
    tabBarLabel: 'Profile',
    tabBarIcon: ({ tintColor, focused }) => (
      <Ionicons
        name={focused ? 'ios-people' : 'ios-people-outline'}
        size={26}
        style={{ color: tintColor }}
      />
    ),
  };
  componentDidMount() {
    this._s0 = this.props.navigation.addListener('willFocus', this._onEvent);
    this._s1 = this.props.navigation.addListener('didFocus', this._onEvent);
    this._s2 = this.props.navigation.addListener('willBlur', this._onEvent);
    this._s3 = this.props.navigation.addListener('didBlur', this._onEvent);
  }
  componentWillUnmount() {
    this._s0.remove();
    this._s1.remove();
    this._s2.remove();
    this._s3.remove();
  }
  _onEvent = a => {
    // console.log('EVENT ON PEOPLE TAB', a.type, a);
  };
  render() {
    const { navigation } = this.props;
    return (
    	<View>
	    	<MyNavScreen banner="People Tab" navigation={navigation} />
	    	<Button title="Logout" onPress={this.handleLogout} />
	    </View>
    );
  }
}

const MainTabs = createBottomTabNavigator(
  {
    StudioList: {
      screen: StudioListScreen,
      path: '',
    },
    Profile: {
      screen: MyProfileScreen,
      path: 'profile',
    },
  },
  {
    tabBarOptions: {
      activeTintColor: '#FF8858',
    },
    initialRouteName: 'StudioList'
  }
);


type MainTabsContainerProps = {
  navigation: NavigationScreenProp<*>,
};

class MainTabsContainer extends React.Component<MainTabsContainerProps> {

  static router = MainTabs.router;
  _s0: NavigationEventSubscription;
  _s1: NavigationEventSubscription;
  _s2: NavigationEventSubscription;
  _s3: NavigationEventSubscription;

  componentDidMount() {
    this._s0 = this.props.navigation.addListener('willFocus', this._onAction);
    this._s1 = this.props.navigation.addListener('didFocus', this._onAction);
    this._s2 = this.props.navigation.addListener('willBlur', this._onAction);
    this._s3 = this.props.navigation.addListener('didBlur', this._onAction);
  }
  componentWillUnmount() {
    this._s0.remove();
    this._s1.remove();
    this._s2.remove();
    this._s3.remove();
  }
  _onAction = a => {
    // console.log('TABS EVENT', a.type, a);
  };
  render() {
    return <MainTabs navigation={this.props.navigation} />;
  }
}

export default MainTabsContainer;
