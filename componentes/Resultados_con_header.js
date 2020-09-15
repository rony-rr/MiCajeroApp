import * as React from 'react';

import { StyleSheet, Text, View, ScrollView, Button,
            TouchableOpacity, ActivityIndicator, Alert, TouchableNativeFeedback,
            FlatList, Image, Picker, RefreshControl, AsyncStorage, StatusBar } from 'react-native';

import * as Permissions from 'expo-permissions';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Ionicons, FontAwesome, Entypo } from '@expo/vector-icons';

import { getDistance, getPreciseDistance } from 'geolib';
import * as Analytics from 'expo-firebase-analytics';

import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded
} from 'expo-ads-admob';


import { Dimensions } from "react-native";
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;


export default class ResultScreen extends React.Component {

  constructor(){
    super();
    this.state = {
      selected: 1,
      arrayBancos: [1, 2, 3, 4, 5, 6],
    };
  }

  componenDidMount(){

    this._captureScreenAnalytic();

  }

  _captureScreenAnalytic = async () => {

    await Analytics.setCurrentScreen('Home');
    await Analytics.logEvent('Resultados de un banco al app', {
      name: 'Home',
      screen: 'Home',
      purpose: 'Resultados de un banco',
      banco: this.props.route.params.banco
    });
    await Analytics.setSessionTimeoutDuration(1800000 ); // 30 mins 	El tiempo personalizado de inactividad en milisegundos antes de que finalice la sesión actual.

  }

  _deleteDataAnalytics = async () => {

    await Analytics.resetAnalyticsData(); //  Borra todos los datos analíticos para esta instancia del dispositivo y restablece el ID de la instancia de la aplicación.

  }

  bannerError() {
        console.log('An error');
        return 0;
  }

  renderAdBanner = () => {

    return(
      <AdMobBanner
                style={{ }}
                bannerSize="banner"
                adUnitID="ca-app-pub-8287263841467710/5791261114"
                didFailToReceiveAdWithError={this.bannerError}/>
    );

  }

  renderAdBannerList = () => {

    return(
      <AdMobBanner
                style={{  }}
                bannerSize="banner"
                adUnitID="ca-app-pub-8287263841467710/6518019422"
                didFailToReceiveAdWithError={this.bannerError}/>
    );

  }

  _getPreciseDistance = () => {
    var pdis = getPreciseDistance(
      { latitude: 13.6699535, longitude: -89.2752258 },
      { latitude: 13.6712149, longitude: -89.2695396 }
    );
    // console.log(`Precise Distance\n${pdis} Meter\nor\n${pdis / 1000} KM`);
    return pdis;
  }

  FlatListItemSeparator = () => {
	   return (
	     <View
	       style={{
	         height: 0,
	         width: "100%",
	         backgroundColor: "#000",
	       }}
	     />
	   );
 }

  listCardsItems = () => {

    var counter = 0;

    return(
      <FlatList
               data = {this.state.arrayBancos}
               ItemSeparatorComponent = {this.FlatListItemSeparator}

               renderItem = { ({item, index}) => {

                    if( counter == 2){

                      counter = counter + 1;

                      return(
                        <View style={ [ styles.cointainerWithBanner, { borderBottomColor: '#000',
                                                                       borderBottomWidth: 1 }] }>
                          <View style={ styles.containerCardView }>
                            <View style={ styles.logoContainer }>
                            <Image
                                  source={{uri : 'https://pbs.twimg.com/profile_images/919820695160410112/3cuYXF1B.jpg'}}
                                  style={{ width: 40, height: 40, borderRadius: 50 }} />
                            </View>
                            <View style={ styles.dataContainer }>
                              <Text>datos</Text>
                            </View>
                            <View style={ styles.buttonContainer }>
                              <TouchableNativeFeedback
                                background={TouchableNativeFeedback.Ripple('red')}>
                                <View style={ styles.goToMapButton }>
                                   <Text style={styles.goToMapButtonText }>Mapa</Text>
                                   <Text style={styles.distanceText }>a { this._getPreciseDistance()/1000 } KM</Text>
                                </View>
                              </TouchableNativeFeedback>
                            </View>
                          </View>
                          <View style={ { width: '100%', height: 60, justifyContent: 'center', alignItems: 'center' } }>
                            { this.renderAdBannerList() }
                          </View>
                        </View>
                      );

                    }else if( counter == 5 ){

                      counter = 0;

                      return(
                        <View style={ [ styles.cointainerWithBanner, { borderBottomColor: '#000',
                                                                       borderBottomWidth: 1 }] }>
                          <View style={ styles.containerCardView }>
                            <View style={ styles.logoContainer }>
                            <Image
                                  source={{uri : 'https://pbs.twimg.com/profile_images/919820695160410112/3cuYXF1B.jpg'}}
                                  style={{ width: 40, height: 40, borderRadius: 50 }} />
                            </View>
                            <View style={ styles.dataContainer }>
                              <Text>datos</Text>
                            </View>
                            <View style={ styles.buttonContainer }>
                              <TouchableNativeFeedback
                                background={TouchableNativeFeedback.Ripple('red')}>
                                <View style={ styles.goToMapButton }>
                                   <Text style={styles.goToMapButtonText }>Mapa</Text>
                                   <Text style={styles.distanceText }>a { this._getPreciseDistance()/1000 } KM</Text>
                                </View>
                              </TouchableNativeFeedback>
                            </View>
                          </View>
                          <View style={ { width: '100%', height: 60, justifyContent: 'center', alignItems: 'center' } }>
                            { this.renderAdBanner() }
                          </View>
                        </View>
                      );

                    }else{

                      counter = counter + 1;

                      return(
                        <View style={ [ styles.containerCardView, { borderBottomColor: '#000',
                                                                    borderBottomWidth: 1 }] }>
                          <View style={ styles.logoContainer }>
                            <Image
                                source={{uri : 'https://pbs.twimg.com/profile_images/919820695160410112/3cuYXF1B.jpg'}}
                                style={{ width: 40, height: 40, borderRadius: 50 }} />
                          </View>
                          <View style={ styles.dataContainer }><Text>datos</Text></View>
                          <View style={ styles.buttonContainer }>
                            <TouchableNativeFeedback
                              background={TouchableNativeFeedback.Ripple('red')}>
                              <View style={ styles.goToMapButton }>
                                 <Text style={styles.goToMapButtonText }>Mapa</Text>
                                 <Text style={styles.distanceText }>a { this._getPreciseDistance()/1000 } KM</Text>
                              </View>
                            </TouchableNativeFeedback>
                          </View>
                        </View>
                      );

                    }

               }  }
               keyExtractor={(item, index) => index.toString()}
      />
    );

  }

  render(){


    var { selected } = this.state;

    var render_lists_cards = null;

    if( this.state.arrayBancos.length > 0 ){

      render_lists_cards = this.listCardsItems();

    }else{
      render_lists_cards = null;
    }

    return(
        <View style={ styles.container }>

          <StatusBar barStyle="light-content" backgroundColor="rgba(91, 91, 91, 1)" />

          <View style={ styles.headerOption }>
            <View style={ [ styles.optionsInHeader, { borderBottomColor: selected == 1 ? "rgba(255, 210, 0, 1.0)" : "#FFF",
                                                      borderBottomWidth: selected == 1 ? 2.5 : 0
                                                    }] }>
              <Text
                    style={ [
                              styles.textOptionsInHeader,
                              {
                                color: selected == 1 ? "rgba(255, 210, 0, 1.0)" : "#FFF",
                                fontSize:  selected == 1 ? 20 : 14,
                              }
                            ] }
                    onPress={ () => this.setState({ selected: 1 }) }
                            >
                Normal
              </Text>
            </View>

            <View style={ [ styles.optionsInHeader, { borderBottomColor: selected == 2 ? "rgba(255, 210, 0, 1.0)" : "#FFF",
                                                      borderBottomWidth: selected == 2 ? 2.5 : 0
                                                    }] }>
              <Text
                    style={ [
                              styles.textOptionsInHeader,
                              {
                                color: selected == 2 ? "rgba(255, 210, 0, 1.0)" : "#FFF",
                                fontSize:  selected == 2 ? 20 : 14,
                              }
                            ] }
                    onPress={ () => this.setState({ selected: 2 }) }
                            >
                Retiro / Deposito
              </Text>
            </View>
          </View>

          <View style={ styles.mainContainer }>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'rgba(0, 68, 140, 1.0)' }}> Cajeros del banco: { this.props.route.params.banco }</Text>
            { render_lists_cards }
          </View>

        </View>
    );

  }
}


const styles = StyleSheet.create({

  container: {
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 1.0)',
  },

  bottomBanner: {
        position: 'absolute',
        bottom: 0,
  },

  headerOption: {
    width: '100%',
    height: 70,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 68, 140, 1.0)',
    flexDirection: 'row'
  },

  optionsInHeader: {
    width: (screenWidth/2) - 20,
    height: '85%',
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',

  },

  textOptionsInHeader: {
    fontWeight: 'bold',
    textAlign: 'center',

  },

  mainContainer: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 15,
    height: screenHeight - 130,
    justifyContent: 'center',
    alignItems: 'center',
  },

  containerCardView: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    height: 100,
  },

  logoContainer: {
    width: '25%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dataContainer: {
    width: '50%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonContainer: {
    width: '25%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cointainerWithBanner: {
    width: '100%',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',

  },

  goToMapButton: {
    width: '85%',
    height: '80%',
    backgroundColor: 'rgba(0, 68, 140, 1.0)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'

  },

  goToMapButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold'
  },

  distanceText: {
    color: '#FFF',
    fontSize: 10,
  }

});
