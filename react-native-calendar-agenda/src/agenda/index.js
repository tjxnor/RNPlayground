import React, {Component} from 'react';
import {
  Text,
  View,
  Dimensions,
  Animated,
  ViewPropTypes,
} from 'react-native';
import PropTypes from 'prop-types';
import XDate from 'xdate';

import {parseDate, xdateToData} from '../interface';
import dateutils from '../dateutils';
import CalendarList from '../calendar-list';
import ItemList from './item-list';
import styleConstructor from './style';
import { VelocityTracker } from '../input';

const HEADER_HEIGHT = 104;
const KNOB_HEIGHT = 24;

//Fallback when RN version is < 0.44
const viewPropTypes = ViewPropTypes || View.propTypes;

export default class AgendaView extends Component {
  static propTypes = {
    // Specify theme properties to override specific styles for calendar parts. Default = {}
    theme: PropTypes.object,

    // agenda container style
    style: viewPropTypes.style,

    // the list of items that have to be displayed in agenda. If you want to render item as empty date
    // the value of date key has to be an empty array []. If there exists no value for date key it is
    // considered that the date in question is not yet loaded
    items: PropTypes.object,

    // callback that fires when the calendar is opened or closed
    onCalendarToggled: PropTypes.func,
    // callback that gets called on day press
    onDayPress: PropTypes.func,
    // callback that gets called when day changes while scrolling agenda list
    onDaychange: PropTypes.func,
    // specify how each item should be rendered in agenda
    renderItem: PropTypes.func,
    // specify how each date should be rendered. day can be undefined if the item is not first in that day.
    renderDay: PropTypes.func,
    // specify how agenda knob should look like
    renderKnob: PropTypes.func,
    // specify how empty date content with no items should be rendered
    renderEmptyDay: PropTypes.func,
    // specify what should be rendered instead of ActivityIndicator
    renderEmptyData: PropTypes.func,
    // specify your item comparison function for increased performance
    rowHasChanged: PropTypes.func,

    // Max amount of months allowed to scroll to the past. Default = 50
    pastScrollRange: PropTypes.number,

    // Max amount of months allowed to scroll to the future. Default = 50
    futureScrollRange: PropTypes.number,

    // initially selected day
    selected: PropTypes.any,
    // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
    minDate: PropTypes.any,
    // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
    maxDate: PropTypes.any,

    // Earliest date to show on the agenda view. See pastScrollRange for calendar view.
    earliestDate: PropTypes.any,

    // Last date in future to show on agenda view. See futureScrollRange for calendar view.
    lastDate: PropTypes.any,

    // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
    firstDay: PropTypes.number,

    // Collection of dates that have to be marked. Default = items
    markedDates: PropTypes.object,
    // Optional marking type if custom markedDates are provided
    markingType: PropTypes.string,

    // Hide knob button. Default = false
    hideKnob: PropTypes.bool,
    // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
    monthFormat: PropTypes.string,
    // A RefreshControl component, used to provide pull-to-refresh functionality for the ScrollView.
    refreshControl: PropTypes.element,
    // If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make sure to also set the refreshing prop correctly.
    onRefresh: PropTypes.func,
    // Set this true while waiting for new data from a refresh.
    refreshing: PropTypes.bool,
    // Display loading indicador. Default = false
    displayLoadingIndicator: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.styles = styleConstructor(props.theme);
    const windowSize = Dimensions.get('window');
    this.viewHeight = windowSize.height;
    this.viewWidth = windowSize.width;
    this.scrollTimeout = undefined;
    this.headerState = 'idle';
    this.state = {
      scrollY: new Animated.Value(0),
      calendarIsReady: false,
      calendarScrollable: false,
      firstReservationLoad: false,
      selectedDay: parseDate(this.props.selected) || XDate(true),
      topDay: parseDate(this.props.selected) || XDate(true),
      loadingData: this.props.loadingData || false,
      // Initial value is false, to indicate not to scroll to item
      scrollToItem: false,
    };
    this.scrollToIndex = 0;
    this.currentMonth = this.state.selectedDay.clone();
    this.onLayout = this.onLayout.bind(this);
    this.onScrollPadLayout = this.onScrollPadLayout.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onStartDrag = this.onStartDrag.bind(this);
    this.onSnapAfterDrag = this.onSnapAfterDrag.bind(this);
    this.generateMarkings = this.generateMarkings.bind(this);
    this.knobTracker = new VelocityTracker();
    this.state.scrollY.addListener(({value}) => this.knobTracker.add(value));
  }

  static getDerivedStateFromProps(nextProps, prevState) {   
    nextProps.loadData()
    return prevState;   
  }

  componentDidUpdate(prevProps, prevState) {
    // If loadingData changed from false to true, new call to loadData can be made 
    if (!prevState.loadingData && this.state.loadingData) {
      this.props.loadData();
    } 
    // If the value of loadingData was true and did not change
    // Get the new value from the parent
    // Which might have set the value to fals (after a loadData call)
    if (prevState.loadingData && this.state.loadingData) {
      this.setState({
        loadingData: this.props.loadingData,
      })
    }
  }

  calendarOffset() {
    return 90 - (this.viewHeight / 2);
  }

  initialScrollPadPosition() {
    return Math.max(0, this.viewHeight - HEADER_HEIGHT);
  }

  setScrollPadPosition(y, animated) {
    this.scrollPad._component.scrollTo({x: 0, y, animated});
  }

  onScrollPadLayout() {
    // When user touches knob, the actual component that receives touch events is a ScrollView.
    // It needs to be scrolled to the bottom, so that when user moves finger downwards,
    // scroll position actually changes (it would stay at 0, when scrolled to the top).
    this.setScrollPadPosition(this.initialScrollPadPosition(), false);
    // delay rendering calendar in full height because otherwise it still flickers sometimes
    setTimeout(() => this.setState({calendarIsReady: true}), 0);
  }

  onLayout(event) {
    this.viewHeight = event.nativeEvent.layout.height;
    this.viewWidth = event.nativeEvent.layout.width;
    this.forceUpdate();
  }

  onTouchStart() {
    this.headerState = 'touched';
    if (this.knob) {
      this.knob.setNativeProps({style: { opacity: 0.5 }});
    }
  }

  onTouchEnd() {
    if (this.knob) {
      this.knob.setNativeProps({style: { opacity: 1 }});
    }

    if (this.headerState === 'touched') {
      this.setScrollPadPosition(0, true);
      this.enableCalendarScrolling();
    }
    this.headerState = 'idle';
  }

  onStartDrag() {
    this.headerState = 'dragged';
    this.knobTracker.reset();
  }

  onSnapAfterDrag(e) {
    // on Android onTouchEnd is not called if dragging was started
    this.onTouchEnd();
    const currentY = e.nativeEvent.contentOffset.y;
    this.knobTracker.add(currentY);
    const projectedY = currentY + this.knobTracker.estimateSpeed() * 250/*ms*/;
    const maxY = this.initialScrollPadPosition();
    const snapY = (projectedY > maxY / 2) ? maxY : 0;
    this.setScrollPadPosition(snapY, true);
    if (snapY === 0) {
      this.enableCalendarScrolling();
    }
  }

  enableCalendarScrolling() {
    this.setState({
      calendarScrollable: true
    });
    if (this.props.onCalendarToggled) {
      this.props.onCalendarToggled(true);
    }
    // Enlarge calendarOffset here as a workaround on iOS to force repaint.
    // Otherwise the month after current one or before current one remains invisible.
    // The problem is caused by overflow: 'hidden' style, which we need for dragging
    // to be performant.
    // Another working solution for this bug would be to set removeClippedSubviews={false}
    // in CalendarList listView, but that might impact performance when scrolling
    // month list in expanded CalendarList.
    // Further info https://github.com/facebook/react-native/issues/1831
    this.calendar.scrollToDay(this.state.selectedDay, this.calendarOffset() + 1, true);
  }

  chooseDay(d, optimisticScroll) {    
    const day = parseDate(d);
    this.setState({
      calendarScrollable: false,
      selectedDay: day.clone(),
      // Set indicator to true, since the change has happened
      // as a result of user selection, and not scrolling
      scrollToItem: true,
    });
    if (this.props.onCalendarToggled) {
      this.props.onCalendarToggled(false);
    }
    this.setScrollPadPosition(this.initialScrollPadPosition(), true);
    this.calendar.scrollToDay(day, this.calendarOffset(), true);
    if (this.props.loadData) {
      // After render and scrolling has happened
      // the callback will set the value to false       
      this.props.loadData(day, () => {this.setState({scrollToItem: false})});
    }
    if (this.props.onDayPress) {
      this.props.onDayPress(xdateToData(day));
    }
  }

  getItemsArr({ items }) {
    if (!items) {
      return []
    } else {
      let finalItems = [];
      // const { items, selectedDay } = nextProps;
      const iterator = this.props.dataFirstDay.clone();
      for (let i = 0; i < Object.keys(items).length; i++){    
        let it = [];
        if (dateutils.sameDate(iterator, this.state.selectedDay)) {
          this.scrollToIndex = finalItems.length;
        }
        const dayItems = items[iterator.toString('yyyy-MM-dd')];
        if (dayItems && dayItems.length) {
          it = dayItems.map((itemDetail, i) => {
            return {
              reservation: itemDetail,
              date: i ? false : iterator.clone(),
              day: iterator.clone(),
            };
          });
        } else if (dayItems) {
          it = [{
            date: iterator.clone(),
            day: iterator.clone(),
          }];
        }
        if (!it) {
          break;
        } else {
          finalItems = finalItems.concat(it);
        }
        iterator.addDays(1);
      }
      return finalItems;
    }
  }

  handleLoadMore() {
    // Make a call to loadData only if there are no existing calls in progress
    if (!this.state.loadingData) {
      this.setState({
        // Set to tru to indicate that no new calls to loadData should be made until this one returns
        loadingData: true
      });  
    }
  }

  renderItems() {
    return (
      <ItemList
        items={this.getItemsArr({ items: this.props.items })}
        // items={this.props.items}
        refreshControl={this.props.refreshControl}
        refreshing={this.props.refreshing}
        onRefresh={this.props.onRefresh}
        rowHasChanged={this.props.rowHasChanged}
        renderItem={this.props.renderItem}
        renderDay={this.props.renderDay}
        renderEmptyDate={this.props.renderEmptyDate}
        handleLoadMore={this.handleLoadMore.bind(this)}
        selectedDay={this.state.selectedDay}
        renderEmptyData={this.props.renderEmptyData}
        topDay={this.state.topDay}
        scrollToIndex = {this.scrollToIndex}
        // Indicates whether to scroll to list item on loading data and rendering
        scrollToItem = {this.state.scrollToItem}
        onDayChange={this.onDayChange.bind(this)}
        onScroll={() => {}}
        ref={(c) => this.list = c}
        theme={this.props.theme}
      />
    );
  }

  onDayChange(day) {
    const newDate = parseDate(day);
    const withAnimation = dateutils.sameMonth(newDate, this.state.selectedDay);
    this.calendar.scrollToDay(day, this.calendarOffset(), withAnimation);
    this.setState({
      selectedDay: parseDate(day)
    });

    if (this.props.onDayChange) {
      this.props.onDayChange(xdateToData(newDate));
    }
  }

  generateMarkings() {
    let markings = this.props.markedDates;
    if (!markings) {
      markings = {};
      Object.keys(this.props.items  || {}).forEach(key => {
        if (this.props.items[key] && this.props.items[key].length) {
          markings[key] = {marked: true};
        }
      });
    }
    const key = this.state.selectedDay.toString('yyyy-MM-dd');
    return {...markings, [key]: {...(markings[key] || {}), ...{selected: true}}};
  }

  render() {
    const agendaHeight = Math.max(0, this.viewHeight - HEADER_HEIGHT);
    const weekDaysNames = dateutils.weekDayNames(this.props.firstDay);
    const weekdaysStyle = [this.styles.weekdays, {
      opacity: this.state.scrollY.interpolate({
        inputRange: [agendaHeight - HEADER_HEIGHT, agendaHeight],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
      transform: [{ translateY: this.state.scrollY.interpolate({
        inputRange: [Math.max(0, agendaHeight - HEADER_HEIGHT), agendaHeight],
        outputRange: [-HEADER_HEIGHT, 0],
        extrapolate: 'clamp',
      })}]
    }];

    const headerTranslate = this.state.scrollY.interpolate({
      inputRange: [0, agendaHeight],
      outputRange: [agendaHeight, 0],
      extrapolate: 'clamp',
    });

    const contentTranslate = this.state.scrollY.interpolate({
      inputRange: [0, agendaHeight],
      outputRange: [0, agendaHeight/2],
      extrapolate: 'clamp',
    });

    const headerStyle = [
      this.styles.header,
      { bottom: agendaHeight, transform: [{ translateY: headerTranslate }] },
    ];

    if (!this.state.calendarIsReady) {
      // limit header height until everything is setup for calendar dragging
      headerStyle.push({height: 0});
      // fill header with appStyle.calendarBackground background to reduce flickering
      weekdaysStyle.push({height: HEADER_HEIGHT});
    }

    const shouldAllowDragging = !this.props.hideKnob && !this.state.calendarScrollable;
    const scrollPadPosition = (shouldAllowDragging ? HEADER_HEIGHT  : 0) - KNOB_HEIGHT;

    const scrollPadStyle = {
      position: 'absolute',
      width: 80,
      height: KNOB_HEIGHT,
      top: scrollPadPosition,
      left: (this.viewWidth - 80) / 2,
    };

    let knob = (<View style={this.styles.knobContainer}/>);

    if (!this.props.hideKnob) {
      const knobView = this.props.renderKnob ? this.props.renderKnob(this.state.selectedDay) : (<View style={this.styles.knob}/>);
      knob = this.state.calendarScrollable ? null : (
        <View style={this.styles.knobContainer}>
          <View ref={(c) => this.knob = c}>{knobView}</View>
        </View>
      );
    }

    return (
      <View onLayout={this.onLayout} style={[this.props.style, {flex: 1, overflow: 'hidden'}]}>
        <View style={this.styles.reservations}>
          {this.renderItems()}
        </View>
        <Animated.View style={headerStyle}>
          <Animated.View style={{flex:1, transform: [{ translateY: contentTranslate }]}}>
            <CalendarList
              onLayout={() => {
                this.calendar.scrollToDay(this.state.selectedDay.clone(), this.calendarOffset(), false);
              }}
              calendarWidth={this.viewWidth}
              theme={this.props.theme}
              onVisibleMonthsChange={() => {}}
              ref={(c) => this.calendar = c}
              minDate={this.props.minDate}
              maxDate={this.props.maxDate}
              current={this.currentMonth}
              markedDates={this.generateMarkings()}
              markingType={this.props.markingType}
              removeClippedSubviews={this.props.removeClippedSubviews}
              onDayPress={this.chooseDay.bind(this)}
              scrollingEnabled={this.state.calendarScrollable}
              hideExtraDays={this.state.calendarScrollable}
              firstDay={this.props.firstDay}
              monthFormat={this.props.monthFormat}
              pastScrollRange={this.props.pastScrollRange}
              futureScrollRange={this.props.futureScrollRange}
              dayComponent={this.props.dayComponent}
              disabledByDefault={this.props.disabledByDefault}
              displayLoadingIndicator={this.props.displayLoadingIndicator}
              showWeekNumbers={this.props.showWeekNumbers}
            />
          </Animated.View>
          {knob}
        </Animated.View>
        <Animated.View style={weekdaysStyle}>
          {this.props.showWeekNumbers && <Text allowFontScaling={false} style={this.styles.weekday} numberOfLines={1}></Text>}
          {weekDaysNames.map((day) => (
            <Text allowFontScaling={false} key={day} style={this.styles.weekday} numberOfLines={1}>{day}</Text>
          ))}
        </Animated.View>
        <Animated.ScrollView
          ref={c => this.scrollPad = c}
          overScrollMode='never'
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={scrollPadStyle}
          scrollEventThrottle={1}
          scrollsToTop={false}
          onTouchStart={this.onTouchStart}
          onTouchEnd={this.onTouchEnd}
          onScrollBeginDrag={this.onStartDrag}
          onScrollEndDrag={this.onSnapAfterDrag}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
            { useNativeDriver: true },
          )}
        >
          <View style={{height: agendaHeight + KNOB_HEIGHT}} onLayout={this.onScrollPadLayout} />
        </Animated.ScrollView>
      </View>
    );
  }
}
