
import React from 'react';
import { Text, Platform, ScrollView, StatusBar, View, FlatList } from 'react-native';
import { SafeAreaView, createBottomTabNavigator } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SampleText from './common/SampleText';
import Card from './common/Card';
import CardSection from './common/CardSection';
import data from '../studios.json';

class StudioSummary extends React.Component {
	render() {
	  const {
	    headerContentStyle,
	    categoryTextStyle,
	    titleTextStyle,
	    addressTextStyle
	  } = styles;

		const { item } = this.props;
		return (
			<Card>
				<CardSection>
					<View style={headerContentStyle}>
						<Text style={categoryTextStyle}>{item.type.toUpperCase()}</Text>
					</View>
				</CardSection>
				<CardSection>
					<View style={headerContentStyle}>
						<Text style={titleTextStyle}>{item.title}</Text>
						<Text style={addressTextStyle}>{item.address}</Text>
					</View>
				</CardSection>
			</Card>
			// <View >
			// 	<Text>{item.type}</Text>
			// 	<Text>{item.title}</Text>
			// 	<Text>{item.address}</Text>
			// </View>
		)
	}
}

class StudioListScreen extends React.Component {
  state = { currentUser: null }
	
  static navigationOptions = {
    tabBarLabel: 'Studio List',
    tabBarIcon: ({ tintColor, focused }) => (
      <Ionicons
        name={focused ? 'ios-home' : 'ios-home-outline'}
        size={26}
        style={{ color: tintColor }}
      />
    ),
  };
  
	_renderItem = ({item}) => (
		<StudioSummary item={item} />		
	);

	_keyExtractor = (item, index) => item.title;

  render() {
    const { navigation } = this.props;
    return (
    	<View>
    		<SafeAreaView forceInset={{ horizontal: 'always', top: 'always' }}>
	    		<SampleText>Studio List</SampleText>	    	
		    	<FlatList 
					data={data}
					keyExtractor={this._keyExtractor}
					renderItem={this._renderItem}
				/>
				</SafeAreaView>
	    </View>
    );
  }
}

const styles = {
  headerContentStyle: {
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
  titleTextStyle: {
    fontSize: 18
  },
  addressTextStyle: {
  	fontSize: 14
  },
  categoryTextStyle: {
  	fontSize: 14
  }
};

export default StudioListScreen;