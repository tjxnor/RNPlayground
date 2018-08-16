import React from 'react';
import { createStackNavigator } from 'react-navigation';

import MenuScreen from './src/screens/menu';
import CalendarsScreen from './src/screens/calendars';
import AgendaScreen from './src/screens/agenda';
import CalendarsList from './src/screens/calendarsList';
import HorizontalCalendarList from './src/screens/horizontalCalendarList';

// import {LocaleConfig} from 'react-native-calendars';

// LocaleConfig.locales['fr'] = {
//   monthNames: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
//   monthNamesShort: ['Janv.','Févr.','Mars','Avril','Mai','Juin','Juil.','Août','Sept.','Oct.','Nov.','Déc.'],
//   dayNames: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
//   dayNamesShort: ['Dim.','Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.']
// };

// LocaleConfig.defaultLocale = 'fr';



const Nav = createStackNavigator(
  {
    Menu: {
      screen: MenuScreen,
      title: "Menu"
    },
    Calendar: {
      screen: CalendarsScreen, 
      title: "Calendar"
    },
    Agenda: {
      screen: AgendaScreen,
      title: "Agenda"
    },
    CalendarsList: {
      screen: CalendarsList,
      title: "Calendar List"
    },
    HorizontalCalendarList: {
      screen: HorizontalCalendarList,
      title: "Horizontal Calendar List"
    },
  },
  {
    initialRouteName: 'Menu'
  }
)

class App extends React.Component {
  render() {
    return <Nav />
  }
}

export default App
