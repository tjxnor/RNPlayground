import React, {Component} from 'react';
import {
  FlatList,
  ActivityIndicator,
  View
} from 'react-native';
import Reservation from './reservation';
import PropTypes from 'prop-types';
import XDate from 'xdate';

import dateutils from '../../dateutils';
import styleConstructor from './style';

class ItemList extends Component {
  static propTypes = {
    // specify your item comparison function for increased performance
    rowHasChanged: PropTypes.func,
    // specify how each item should be rendered in agenda
    renderItem: PropTypes.func,
    // specify how each date should be rendered. day can be undefined if the item is not first in that day.
    renderDay: PropTypes.func,
    // specify how empty date content with no items should be rendered
    renderEmptyDate: PropTypes.func,
    // callback that gets called when day changes while scrolling agenda list
    onDayChange: PropTypes.func,
    // onScroll ListView event
    onScroll: PropTypes.func,
    // the list of items that have to be displayed in agenda. If you want to render item as empty date
    // the value of date key kas to be an empty array []. If there exists no value for date key it is
    // considered that the date in question is not yet loaded
    reservations: PropTypes.object,

    selectedDay: PropTypes.instanceOf(XDate),
    topDay: PropTypes.instanceOf(XDate),
    refreshControl: PropTypes.element,
    refreshing: PropTypes.bool,
    onRefresh: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.styles = styleConstructor(props.theme);    
    this.state = {
      items: [],
      listScrollPosition: 0,
      heights: [],
    };
    this.heights=[];
    this.selectedDay = this.props.selectedDay;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // If scrollToItem is true in the nextProps
    // find scrollPosition and set listScrollPosition
    if (nextProps.scrollToItem) {
      let scrollPosition = 0;
      for (let i = 0; i < nextProps.scrollToIndex; i++) {
        scrollPosition += prevState.heights[i] || 0;
      }        
      return {
        listScrollPosition: scrollPosition
      }
      return prevState;
    } else 
    return prevState;
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Before the component renders
    // Scroll to the list item if indicator is true
    if (nextProps.scrollToItem) {
      this.list.scrollToOffset({offset: nextState.listScrollPosition, animated: true});
    }
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
   
  }
  
  onScroll(event) {
    const yOffset = event.nativeEvent.contentOffset.y;
    this.props.onScroll(yOffset);
    let topRowOffset = 0;
    let ind;
    for (ind = 0; ind < this.state.heights.length; ind++) {
      if (topRowOffset + this.state.heights[ind] >= yOffset) {
        break;
      }
      topRowOffset += this.state.heights[ind];
    }
    const row = this.props.items[ind];
    if (!row) return;
    const day = row.day;
    const sameDate = dateutils.sameDate(day, this.selectedDay);    
    // If the date has changed due to scrolling
    // and not due to programmatic list scroll
    // Set these parameters so the calendaer can update itself
    if (!sameDate && !this.props.scrollToItem) {
      this.selectedDay = day.clone();
      this.props.onDayChange(day.clone());
    }

  }

  onRowLayoutChange(ind, event) {
    this.state.heights[ind] = event.nativeEvent.layout.height;
  }

  renderRow({item, index}) {    
    return (
      <View onLayout={this.onRowLayoutChange.bind(this, index)}>
        <Reservation
          item={item}
          renderItem={this.props.renderItem}
          renderDay={this.props.renderDay}
          renderEmptyDate={this.props.renderEmptyDate}
          theme={this.props.theme}
          rowHasChanged={this.props.rowHasChanged}
        />
      </View>
    );
  }

  render() {
    return (
      <FlatList
        ref={(c) => this.list = c}
        style={this.props.style}
        contentContainerStyle={this.styles.content}
        renderItem={this.renderRow.bind(this)}
        data={this.props.items}
        onScroll={this.onScroll.bind(this)}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={200}
        onMoveShouldSetResponderCapture={() => {return false;}}
        keyExtractor={(item, index) => String(index)}
        refreshControl={this.props.refreshControl}
        refreshing={this.props.refreshing || false}
        onRefresh={this.props.onRefresh}
        onEndReached={this.props.handleLoadMore}
        onEndThreshold={0}
      />
    );
  }
}

export default ItemList;
