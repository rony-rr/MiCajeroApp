import React, { PureComponent } from 'react';

import { StyleSheet, Text, View, ScrollView, Button, Platform, Linking,
            TouchableOpacity, ActivityIndicator, Alert, TouchableNativeFeedback,
            FlatList, Image, Picker, RefreshControl, AsyncStorage, StatusBar, TextInput } from 'react-native';

import Constants from 'expo-constants';
import * as Location from 'expo-location';
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

import JSONDATA from './customData.json';
import jsonVars from './jsonVars';

const LOCATION_SETTINGS = {
  accuracy: Location.Accuracy.Balanced,
  timeInterval: 200,
  distanceInterval: 0,
};

const responseData = JSONDATA.data.map((item, key) => {
    return {
      label: item.title,
      latitude: item.latitude,
      longitude: item.longitude,
      urlMap: item.placeUrl
    };
});

export default class ResultScreen extends React.Component {

  constructor(){
    super();
    this.state = {

      selected: 1,

      latitude: 0.0,
      longitude: 0.0,
      location: null,
      location2: null,
      errorMessage: null,

      arrayBancos: [1, 2, 3, 4, 5, 6],
      arrayBanks: responseData,
      filterArrayCajeros: responseData,

      dataCounter: 30,
    };
  }

  componentDidMount(){

    this._captureScreenAnalytic();
    this._function_set_vals_location();

    setInterval( () => { this.activeAutoLocation(); }, 5000);

  }

  _function_set_vals_location(){
        // console.log('_function_set_vals_location');
        if (Platform.OS === 'android' && !Constants.isDevice) {
          this.setState({
            errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
          }, () => { console.log( this.state.errorMessage ); });
        } else {

          this._getLocationAsync();

        }
  }

  activeAutoLocation = () => {

    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      }, () => { console.log( this.state.errorMessage ); });
    } else {

        if( this.state.latitude == 0.0 || this.state.longitude == 0.0 ){
          this._getLocationAsync();
        }

    }

  }

  _getLocationAsync = async () => {

        // console.log('_getLocationAsync');
        let { status } = await Location.requestPermissionsAsync();
        if (status !== 'granted') {
          this.setState({
            errorMessage: 'Permission to access location was denied',
          }, () => { console.log( this.state.errorMessage ); });
        }
        else{
          let location = await Location.getCurrentPositionAsync({});
          this.setState({ location });
          this.setState({
                                      latitude: location.coords.latitude,
                                      longitude: location.coords.longitude

                        }, () => { /*console.log(this.state.latitude, this.state.longitude);*/ });

        }
  }

  _captureScreenAnalytic = async () => {

    await Analytics.setCurrentScreen('Home');
    await Analytics.logEvent('Resultados de un banco al app', {
      name: 'Home',
      screen: 'Home',
      purpose: 'Resultados de un banco',
      banco: 'Todos'
    });
    await Analytics.setSessionTimeoutDuration(1800000 ); // 30 mins 	El tiempo personalizado de inactividad en milisegundos antes de que finalice la sesión actual.

  }

  _deleteDataAnalytics = async () => {

    await Analytics.resetAnalyticsData(); //  Borra todos los datos analíticos para esta instancia del dispositivo y restablece el ID de la instancia de la aplicación.

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

  ListEmptyView = () => {
     return (
       <View style={{
                      justifyContent: 'center',
                      flex:1,
                      margin: 10}}>

         <Text style={{textAlign: 'center'}}> Sin datos... Intente otra vez.</Text>

       </View>

     );
  }

  listCardsItems = () => {

    var counter = 0;
    var data = [];

    for (var counterI=0; counterI < this.state.dataCounter; counterI++){

       data.push(this.state.filterArrayCajeros[counterI]);
    }


    return(
      <FlatList
               data = {data}
               ItemSeparatorComponent = {this.FlatListItemSeparator}
               ListEmptyComponent={this.ListEmptyView}
               removeClippedSubviews={true}
               horizontal={false}
               initialNumToRender={12}
               maxToRenderPerBatch={12}
               windowSize={15}

               renderItem = { ({item, index}) => {

                 if( counter == 2){

                   counter = counter + 1;

                   return( <ElementList counter={2} item={item} /> );

                 }else if( counter == 5 ){

                   counter = 0;

                   return( <ElementList counter={5} item={item} /> );

                 }else{

                   counter = counter + 1;

                   return( <ElementList counter={counter - 1} item={item} /> );

                 }

               }  }
               keyExtractor={(item, index) => index.toString()}
      />
    );

  }

  renderAdBannerList = () => {

    return(
      <AdMobBanner
                style={ [styles.bottomBanner, { alignSelf: 'center' }] }
                bannerSize="banner"
                adUnitID="ca-app-pub-8287263841467710/6518019422"
                didFailToReceiveAdWithError={this.bannerError}/>
    );

  }

  SearchFilterCajeros(textSearch){

         const newData = this.state.arrayBanks.filter( function(item){
             const itemData = item.label.toUpperCase();
             const textData = textSearch.toUpperCase();
             return itemData.indexOf(textData) > -1;
         });

         this.setState({
             filterArrayCajeros: newData,
             textSearch: textSearch
         }, () => { /*console.log( this.state.dataSourceClientes )*/ });

  }

  render(){

    // console.log( "---------------------------", 1 );
    // console.log( this.state.filterArrayCajeros );
    // console.log(responseData);

    // console.log(this.state.latitude, this.state.longitude);

    var data = [];

    // for (var counterI=0; counterI < this.state.dataCounter; counterI++){
    //     var distance = this._getPreciseDistance(this.state.filterArrayCajeros[counterI].latitude, this.state.filterArrayCajeros[counterI].longitude);
    //     console.log(distance);
    //     if( distance !== 'ND' && distance < 25.00 ){
    //         data.push(this.state.filterArrayCajeros[counterI]);
    //     }
    // }

    var { selected } = this.state;

    var render_lists_cards = null;

    if( this.state.filterArrayCajeros.length > 0 ){

      var counter = 0;
      render_lists_cards = (<FlatList
                                     data = {this.state.filterArrayCajeros}
                                     // ItemSeparatorComponent = {this.FlatListItemSeparator}
                                     // ListEmptyComponent={this.ListEmptyView}
                                     // removeClippedSubviews={true}
                                     // horizontal={false}
                                     // initialNumToRender={12}
                                     // maxToRenderPerBatch={12}
                                     // windowSize={15}

                                     renderItem = { ({item, index}) => {

                                       if( counter == 2){

                                         counter = 0;

                                         return( <ElementList key={index} counter={2} item={item} varLatitude={this.state.latitude} varLongitude={this.state.longitude} /> );

                                       }else{

                                         counter = counter + 1;

                                         return( <ElementList key={index} counter={counter - 1} item={item} varLatitude={this.state.latitude} varLongitude={this.state.longitude} /> );

                                       }

                                     }  }
                                     keyExtractor={(item, index) => index.toString()}
                            />
      );
      // render_lists_cards = null;

    }else{
      render_lists_cards = <Text style={ styles.titleInput }>Sin resultados...</Text>;
    }

    return(
        <View style={ styles.container }>

          <StatusBar barStyle="light-content" backgroundColor="rgba(91, 91, 91, 1)" />

          <View style={ styles.headerOption }>
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
              Lista de cajeros
            </Text>
          </View>

          <View style={ styles.ContainerFilter }>

                <Text style={ styles.titleInput }>Filtrar por banco</Text>
                <View style={styles.styleViewSearchBox} >


                    <FontAwesome
                                      style={{paddingRight:10}}
                                      name="search"
                                      size={30}
                                      color='#000'
                                />

                            <TextInput
                                style={styles.TextInputSearch}
                                onChangeText={(textSearch) => this.SearchFilterCajeros(textSearch)}
                                value={this.state.textSearch}
                                underlineColorAndroid='transparent'
                                placeholder="Indicio de banco"
                            />

                </View>

    	    </View>

          <View style={ styles.mainContainer }>
            { render_lists_cards }
          </View>

          { this.renderAdBannerList() }

        </View>
    );

  }

}

class ElementList extends PureComponent {

  constructor(props){
    super(props);
  }

  _getPreciseDistance = (latitude1, longitude1) => {

    console.log(latitude1, longitude1);
    console.log(this.props.varLatitude, this.props.varLongitude);
    console.log('--------------------');

    if( latitude1 == undefined || longitude1 == undefined ){
      return 'ND';
    }else if( this.props.varLatitude == 0 || this.props.varLongitude == 0 ){
      return '...';
    }else{
      var pdis = getPreciseDistance(
        { latitude: this.props.varLatitude, longitude: this.props.varLongitude },
        { latitude: latitude1, longitude: longitude1 }
      );
      // console.log(`Precise Distance\n${pdis} Meter\nor\n${pdis / 1000} KM`);
      return pdis/1000;
    }

  }

  goToMap = async (url) => {

    // console.log(url);
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'No se pudo redireccionar');
    }

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

  render(){

      let counter = this.props.counter;
      let item = this.props.item;

      // console.log(counter);
      // console.log('ElementList', item);

      if( counter == 2){

        return(
          <View style={ [ styles.cointainerWithBanner, { borderBottomColor: '#000',
                                                         borderBottomWidth: 1 }] }>
            <View style={ styles.containerCardView }>
              <View style={ styles.logoContainer }>
                <FontAwesome name="credit-card-alt" size={25} style={{ color: 'rgba(0, 68, 140, 1.0)' }} />
              </View>
              <View style={ styles.dataContainer }>
                <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'left', marginHorizontal: 15 }}>{ item.label }</Text>
              </View>
              <View style={ styles.buttonContainer }>
                <TouchableOpacity
                    style={{ width: '100%' }}
                    onPress={ () => this.goToMap(item.urlMap) }
                  >
                  <View style={ styles.goToMapButton }>
                     <Text style={styles.goToMapButtonText }>Mapa</Text>
                     <Text style={styles.distanceText }>a { this._getPreciseDistance(item.latitude, item.longitude) } KM</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <View style={ { width: '100%', height: 60, justifyContent: 'center', alignItems: 'center' } }>
              { this.renderAdBanner() }
            </View>
          </View>
        );

      }else{

        return(
          <View style={ [ styles.containerCardView, { borderBottomColor: '#000',
                                                      borderBottomWidth: 1 }] }>
            <View style={ styles.logoContainer }>
              <FontAwesome name="credit-card-alt" size={25} style={{ color: 'rgba(0, 68, 140, 1.0)' }} />
            </View>
            <View style={ styles.dataContainer }>
              <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'left', marginHorizontal: 15 }}>{ item.label }</Text>
            </View>
            <View style={ styles.buttonContainer }>
              <TouchableOpacity
                  style={{ width: '100%' }}
                  onPress={ () => this.goToMap(item.urlMap) }
                >
                <View style={ styles.goToMapButton }>
                   <Text style={styles.goToMapButtonText }>Mapa</Text>
                   <Text style={styles.distanceText }>a { this._getPreciseDistance(item.latitude, item.longitude) } KM</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );

      }

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
    height: screenHeight - 180,
    justifyContent: 'center',
    alignItems: 'center',
  },

  ScrollContainer: {
    width: '100%',
		flex: 2,
    paddingTop: 5,
		paddingBottom: 20,
		//marginTop: Platform.OS === 'ios' ? 20 : 5,

  },

  ContainerFilter: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '100%',
    height: 100
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
  },

  titleInput: {
    fontSize: 18,
    fontFamily: Platform.OS == 'ios' ? 'Optima' :'sans-serif-condensed',
    fontWeight: 'bold',
    //fontStyle: 'italic',
    marginBottom: 5
  },

  styleViewSearchBox: {
    height: 55,
    width: '100%',
    paddingVertical: 2,
    paddingHorizontal: '1%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 1,
  },

  TextInputSearch:{
      textAlign: 'center',
      height: 40,
      width: '80%',
      borderWidth: 3,
      borderColor: 'rgba(0, 68, 140, 1.0)',
      borderRadius: 20 ,
      backgroundColor : "#FFF",
      fontWeight: 'bold',
      fontSize: 18
  },

});
