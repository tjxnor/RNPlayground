import React from 'react';
import { createStackNavigator } from 'react-navigation';

import AgendaScreen from './implementations/agenda';


const Nav = createStackNavigator(
  {
    Agenda: {
      screen: AgendaScreen,
      title: "Agenda"
    },
  },
  {
    initialRouteName: 'Agenda'
  }
)

class App extends React.Component {
  render() {
    return <Nav />
  }
}

export default App
