import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet
} from 'react-native';
import Agenda from '../src/agenda';
import dateutils from '../src/dateutils';
import { config } from '../config';
import XDate from 'xdate';

XDate.locales['en-c'] = {
  monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  monthNamesShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
};

XDate.defaultLocale = 'en-c';


export default class AgendaScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: {},
      selected: XDate().toString('yyyy-MM-dd'),
      earliestDate: config.earliestDate,
      lastDate: config.lastDate,
      minDate: config.earliestDate,
      maxDate: config.lastDate,
      dataSize: 0,
    };
    this.loadDataSize = 31;    
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      selected: XDate(prevState.selected),
      dataFirstDay: XDate(prevState.selected),
      // To indicate whether the data is being refreshed on scroll
      // Avoids race condition as the user is scrolling
      // And prevents further calls until one set of data is loaded
      loadingData: false,
    };
  }    

  render() {
    return (
      <Agenda
        items={this.state.items}
        loadData={this.loadData.bind(this)}
        loadingData={this.state.loadingData}
        dataFirstDay={this.state.dataFirstDay}        
        selected={this.state.selected}        
        renderItem={this.renderItem.bind(this)}
        renderDay={this.renderDay.bind(this)}
        renderEmptyDate={this.renderEmptyDate.bind(this)}
        rowHasChanged={this.rowHasChanged.bind(this)}
        renderKnob={this.renderKnob.bind(this)}
        theme={{flexDirection: 'column'}}
        onCalendarToggled={this.onCalendarToggled}
        earliestDate={this.state.earliestDate}
        lastDate={this.state.lastDate}
        minDate={this.state.minDate}
        maxDate={this.state.maxDate}     
    
        // markingType={'period'}
        // markedDates={{
        //    '2017-05-08': {textColor: '#666'},
        //    '2017-05-09': {textColor: '#666'},
        //    '2017-05-14': {startingDay: true, endingDay: true, color: 'blue'},
        //    '2017-05-21': {startingDay: true, color: 'blue'},
        //    '2017-05-22': {endingDay: true, color: 'gray'},
        //    '2017-05-24': {startingDay: true, color: 'gray'},
        //    '2017-05-25': {color: 'gray'},
        //    '2017-05-26': {endingDay: true, color: 'gray'}}}
         // monthFormat={'yyyy'}
         // theme={{calendarBackground: 'red', agendaKnobColor: 'green'}}
        //renderDay={(day, item) => (<Text>{day ? day.day: 'item'}</Text>)}
      />
    );
  }

  loadData(day, callback = () => {}) {    
    setTimeout(() => {
      if (!day) {        
        day = this.state.dataFirstDay.clone();
        if (this.state.dataSize > 0) {
          day.addDays(this.state.dataSize);
        }
      }
      const dayStr = day.toString('yyyy-MM-dd');
      let items; 
      let newFirstDay = false;
      const diff = this.state.dataFirstDay.diffDays(day)
      if (this.state.items[dayStr]
        || (diff <= this.state.dataSize + 1
        && diff >= 0)
        ) {
        items = { ...this.state.items };
      } else {
        items = {};
        newFirstDay = day.clone();
      }
      const iterator = day.clone();
      for (let i = 0; i < this.loadDataSize; i++) {        
        const strTime = iterator.toString('yyyy-MM-dd');
        if (!items[strTime]) {
          items[strTime] = [];
          const numItems = Math.floor(Math.random() * 5);
          for (let j = 0; j < numItems; j++) {
            items[strTime].push({
              name: 'Item for ' + strTime,
              height: Math.max(50, Math.floor(Math.random() * 150))
            });
          }
        }
        iterator.addDays(1);
      }
      this.setState({
        items,
        dataFirstDay: newFirstDay ? newFirstDay : this.state.dataFirstDay,
        // Set to false to indicate that next call to loadData can be safely made
        loadingData: false,
        dataSize: Object.keys(items).length,
      }, callback());
    }, 1000);
  }

  onCalendarToggled = (val) => {
    // Can use this trigger to show something on screen when the calendar toggles
    // true means the calendar is open
    // false means the calendar is collapsed
  }

  renderItem(item) {
    return (
      <View style={[styles.item, {height: item.height}]}><Text>{item.name}</Text></View>
    );
  }

  renderKnob(selectedDay) {
    return (
      // <View style={styles.knob}><Text>"Something"</Text></View>
      <View style={styles.knob}><Text>{XDate(selectedDay).toString("MMM d, yyyy")}</Text></View>
    );
  }

  renderDay(date, item) {
    const today = dateutils.sameDate(date, XDate()) ? styles.today : undefined;
    if (date) {
      return (
        <View style={styles.day}>
          <Text allowFontScaling={false} style={[styles.dayText, today]}>{XDate(date.dateString).toString("MMM d, yyyy")}</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.noDay}/>
      );
    }
  }

  renderEmptyDate() {
    return (
      <View style={styles.emptyDate}><Text>This is empty date!</Text></View>
    );
  }

  rowHasChanged(r1, r2) {
    return r1.name !== r2.name;
  }

  timeToString(time) {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
  }
}

const styles = StyleSheet.create({
  theme: {
    flexDirection: 'column'
  },
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 0,
    marginTop: 0,
    borderColor: 'red',
    borderWidth: 0.5,
  },
  emptyDate: {
    height: 15,
    flex:1,
    paddingTop: 30
  },
  day: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: 'white',
  },
  noDay: {
    height: 0,
  },
  today: {
    // color: appStyle.agendaTodayColor
  },
  dayText: {
    fontSize: 16,
    fontWeight: '200',
    // color: appStyle.agendaDayTextColor,
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: 'rgba(0,0,0,0)'
  },
  knob:{
    backgroundColor: 'pink',
  },
});
