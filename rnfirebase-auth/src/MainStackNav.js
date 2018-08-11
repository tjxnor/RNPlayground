
import React from 'react';
import { createStackNavigator } from 'react-navigation';

import MainTabsNav from './MainTabsNav';
// import StudioStack from './StudioStack';
// import SearchScreen from './SearchScreen';

const MainStackNav = createStackNavigator(
{
  Root: {
    screen: MainTabsNav,
  }
  // StudioStack: {
  //   screen: StudioStack,
  //   path: '/studio/:name',
  //   navigationOptions: ({ navigation }) => ({
  //     title: `${navigation.state.params.name}'s Profile!`,
  //   }),
  // }.
  // Search: {
  //   screen: SearchScreen,    
  //   navigationOptions: {
  //     title: "Search",
  //   },
  // },
},
{
	initialRouteName: 'Root'
});

export default MainStackNav;