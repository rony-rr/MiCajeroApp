import React, { PureComponent } from 'react';

import { StyleSheet, Text, View, ScrollView, Button, Platform, Linking,
            TouchableOpacity, ActivityIndicator, Alert, TouchableNativeFeedback, Modal,
            FlatList, Image, Picker, RefreshControl, AsyncStorage, StatusBar, TextInput, BackHandler } from 'react-native';

import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Ionicons, FontAwesome, Entypo } from '@expo/vector-icons';

import { getDistance, getPreciseDistance } from 'geolib';
import { openMap, createMapLink } from 'react-native-open-maps';
import MapView, {Marker, Polyline} from 'react-native-maps';
var polyline = require('@mapbox/polyline');
import * as Analytics from 'expo-firebase-analytics';

import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded
} from 'expo-ads-admob';
import * as FacebookAds from 'expo-ads-facebook';

// FacebookAds.AdSettings.addTestDevice(FacebookAds.AdSettings.currentDeviceHash);

import { Dimensions } from "react-native";
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const GOOGLE_API_KEY = 'AIzaSyAgJ9LBzOM2wAO_crHhRTJmoAtz0g2cZ2o';

import JSONDATA from './customData.json';
// import jsonVars from './jsonVars';

const LOCATION_SETTINGS = {
  accuracy: Location.Accuracy.Balanced,
  timeInterval: 200,
  distanceInterval: 0,
};

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

      isLoading: true,
      arrayBanks: [],
      filterArrayCajeros: [],

      dataCounter: 30,

      filtrosOn: false,
      distanciaFind: 8,

      modalOpen: false,

      chargingPoints: false,
    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  componentDidMount(){

    // console.log( Constants.deviceName );

    this.caption_array_data();
    this._captureScreenAnalytic();
    this._function_set_vals_location();

    setInterval( () => { this.activeAutoLocation(); }, 5000);
    this.showInterstitial();
    // setTimeout( () => { this.setState({ chargingPoints: false }) }, 12000);

    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

  }

  componentWillUnmount() {
     BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  handleBackButtonClick() {
	    BackHandler.exitApp()
	    return true;
	}

  caption_array_data = () => {
    let responseData = [];
    responseData = JSONDATA.data.map((item, key) => {
        return {
          label: item.title,
          latitude: item.latitude,
          longitude: item.longitude,
          urlMap: (item.placeUrl === undefined) ? null : item.placeUrl
        };
    });

    if( responseData.length > 0 ){
      this.setState({ arrayBanks: responseData, filterArrayCajeros: responseData, isLoading: false });
    }else{
      this.setState({ errorMessage: 'Sin datos', isLoading: false });
    }

  }

  _function_set_vals_location(){
        // console.log('_function_set_vals_location');
        if (Platform.OS === 'android' && !Constants.isDevice) {
          this.setState({
            errorMessage: 'Error',
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
            errorMessage: 'Error',
          }, () => { console.log( this.state.errorMessage ); });
        }
        else{
          let location = await Location.getCurrentPositionAsync({});
          this.setState({ location }, () => { /*console.log( this.state.location )*/ });
          this.setState({
                                      latitude: location.coords.latitude,
                                      longitude: location.coords.longitude,
                                      errorMessage: 'Listo',

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

  bannerError() {
        console.log('An error');
        return 0;
  }

  renderAdBanner = () => {

    return(
      <AdMobBanner
                style={{ }}
                bannerSize="fullBanner"
                adUnitID="ca-app-pub-8287263841467710/2042770521"
                didFailToReceiveAdWithError={this.bannerError}/>
    );

  }

  showInterstitial = async () => {
    await AdMobInterstitial.setAdUnitID('ca-app-pub-8287263841467710/8670105663'); // Test ID, Replace with your-admob-unit-id
    await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true});
    await AdMobInterstitial.showAdAsync();

    // FacebookAds.InterstitialAdManager.showAd(placementId)
    // .then(didClick => {})
    // .catch(error => {});
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

  goToAmazon = async () => {

    var url = 'https://www.amazon.com/b?_encoding=UTF8&tag=2392259-20&linkCode=ur2&linkId=0079a1fa993011bc2c9afd8228f0ae6d&camp=1789&creative=9325&node=2335752011';
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'No se pudo redireccionar');
    }

  }

  render(){

    // console.log( "---------------------------", 1 );
    // console.log( this.state.filterArrayCajeros );
    // console.log(responseData);
    // console.log( this.state.distanciaFind );

    // console.log(this.state.latitude, this.state.longitude);

    var data = [];

    // for (var counterI=0; counterI < this.state.dataCounter; counterI++){
    //     var distance = this._getPreciseDistance(this.state.filterArrayCajeros[counterI].latitude, this.state.filterArrayCajeros[counterI].longitude);
    //     console.log(distance);
    //     if( distance !== 'ND' && distance < 25.00 ){
    //         data.push(this.state.filterArrayCajeros[counterI]);
    //     }
    // }

    if( this.state.isLoading ){

      return(
        <View style={ styles.container }>

          <StatusBar barStyle="light-content" backgroundColor="rgba(91, 91, 91, 1)" />

          <View style={ styles.headerOption }>
            <Text
                  style={ [
                            styles.textOptionsInHeader,
                            {
                              color: "rgba(255, 210, 0, 1.0)",
                              fontSize: 20,
                            }
                          ] }
                          >
              Obteniendo lista de cajeros
            </Text>
          </View>

          <View style={ styles.mainContainer }>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>

        </View>
      );
    }

    if( this.state.errorMessage !== 'Listo' ){

      return(
        <View style={ styles.container }>

          <StatusBar barStyle="light-content" backgroundColor="rgba(91, 91, 91, 1)" />

          <View style={ styles.headerOption }>
            <Text
                  style={ [
                            styles.textOptionsInHeader,
                            {
                              color: "rgba(255, 210, 0, 1.0)",
                              fontSize:  20,
                            }
                          ] }
                          >
              Obteniendo ubicación
            </Text>
          </View>

          <View style={ styles.mainContainer }>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={{ color: 'rgba(0, 68, 140, 1.0)', fontSize: 18, fontWeight: 'bold' }}>Cargando GPS...</Text>
          </View>

        </View>
      );
    }

    var { selected } = this.state;

    var render_lists_cards = null;

    if( this.state.filterArrayCajeros.length > 0 ){

      var counter = 0;
      render_lists_cards = (<FlatList
                                     data = {this.state.filterArrayCajeros}
                                     style={{ paddingBottom: 100 }}
                                     // ItemSeparatorComponent = {this.FlatListItemSeparator}
                                     // ListEmptyComponent={this.ListEmptyView}
                                     // removeClippedSubviews={true}
                                     // horizontal={false}
                                     // initialNumToRender={5}
                                     // maxToRenderPerBatch={10}
                                     //
                                     // windowSize={10}

                                     renderItem = { ({item, index}) => {

                                       var limit = this.state.filterArrayCajeros.length - 1;

                                       if( counter == 5){

                                         counter = 0;

                                         return( <ElementList key={index} counter={5} item={item} varLatitude={this.state.latitude} varLongitude={this.state.longitude} distanciaFinding={this.state.distanciaFind} indexV={index} limit={limit} style={{ marginBottom: index == limit ? 100 : 0 }} onPress={ () => { /*this.props.navigation.navigate('Mapa', { lat: item.latitude, lon: item.longitude, latA: this.state.latitude, lonA: this.state.longitude });*/ } } />);

                                       }else{

                                         counter = counter + 1;

                                         return( <ElementList key={index} counter={counter - 1} item={item} varLatitude={this.state.latitude} varLongitude={this.state.longitude} distanciaFinding={this.state.distanciaFind} indexV={index} limit={limit} style={{ marginBottom: index == limit ? 100 : 0 }} onPress={ () => { /*this.props.navigation.navigate('Mapa', { lat: item.latitude, lon: item.longitude, latA: this.state.latitude, lonA: this.state.longitude });*/ } } /> );

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
            <Text style={{ fontSize: 9, fontWeight: 'bold', color: "rgba(255, 210, 0, 1.0)" }}>Cajeros a: { this.state.distanciaFind } Km</Text>
          </View>

          <View style={{ width: '100%', paddingHorizontal: 15 }}>
            <TouchableOpacity
              style={{ backgroundColor: '#ddd', borderLeftColor: '#34495E', borderLeftWidth: 5,
                        justifyContent: 'center', alignItems: 'center', alignContent: 'center',
                        borderRadius: 7, marginVertical: 10, width: '100%', height: 40,
                         }}
              onPress={ () => { this.setState({ filtrosOn: !this.state.filtrosOn }); } }
              >
                <Text style={{ color: '#000', fontSize: 17, fontWeight: 'bold' }}>Filtrar</Text>
                <FontAwesome
                                  style={{ position: 'absolute', right: 10 }}
                                  name={ this.state.filtrosOn ? 'minus' : 'plus' }
                                  size={15}
                                  color='#000'
                            />
            </TouchableOpacity>
          </View>

          <View style={ [styles.ContainerFilter, { display: this.state.filtrosOn ? 'flex' : 'none' }] }>

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
                                placeholder="Filtrar por banco"
                            />

                </View>

                <View style={ [styles.styleViewSearchBox, { backgroundColor: '#ddd', borderRadius: 8, height: 40, marginTop: 15 }] }>
                  <Picker
                        prompt="Distancia máxima"
                        selectedValue={this.state.distanciaFind}
                        style={{ height: 50, width: '100%',
                                  borderRadius: 8,}}
                        onValueChange={ (itemValue, itemIndex) => this.setState({ distanciaFind: itemValue}) }
                      >
                    <Picker.Item label="Seleccione distancia max." value="25" />
                    <Picker.Item label="5Km" value="5" />
                    <Picker.Item label="8Km" value="8" />
                    <Picker.Item label="10Km" value="10" />
                    <Picker.Item label="12Km" value="12" />
                    <Picker.Item label="15Km" value="15" />
                    <Picker.Item label="18Km" value="18" />
                    <Picker.Item label="20Km" value="20" />
                  </Picker>
                </View>

    	    </View>

          <View style={{ width: '100%', height: 50, justifyContent: 'center', alignItems: 'center', alignContent: 'center', }}>
            { this.renderAdBanner() }
          </View>

          <View style={{display: 'none'}}>
            {
              this.state.chargingPoints
              ?
              <ActivityIndicator size="large" color="#0000ff" />
              :
              null
            }
          </View>

          <View style={ styles.mainContainer }>
            { render_lists_cards }
          </View>

          <TouchableOpacity style={{ height: 42, width: '100%', paddingVertical: 6, paddingHorizontal: 20,
                                      justifyContent: 'center', alignItems: 'center', alignContent: 'center', alignSelf: 'center',
                                      backgroundColor: 'rgba(241, 196, 15, 1.0)', borderRadius: 2, marginTop: 8, position: 'absolute',
                                      bottom: 0
                                    }}
                            onPress={ () => { this.goToAmazon() } }
                    >
                    <Image
                          style={{ width: 100, height: 26, justifyContent: 'center', alignItems: 'center', alignContent: 'center' }}
                          source={require('./assets/amazon-icon.png')}
                        />
          </TouchableOpacity>

        </View>
    );

  }

}

class ElementList extends PureComponent {

  constructor(props){
    super(props);
  }

  _getPreciseDistanceUrl = (urlM) => {

      var regex = new RegExp('@(.*),(.*),');
      var lon_lat_match = urlM.match(regex);
      var lat = lon_lat_match[1];
      var lon = lon_lat_match[2];
      const logmsg = console.log;
      // logmsg(lon_lat_match);
      // logmsg(lat, lon);
      // logmsg(this.props.varLatitude, this.props.varLongitude);
      // logmsg('--------------------');

      if( lat == undefined || lon == undefined ){
        return 'ND';
      }else if( this.props.varLatitude == 0 || this.props.varLongitude == 0 ){
        return '...';
      }else{
        var pdis = getPreciseDistance(
          { latitude: this.props.varLatitude, longitude: this.props.varLongitude },
          { latitude: lat, longitude: lon }
        );
        // console.log(`Precise Distance\n${pdis} Meter\nor\n${pdis / 1000} KM`);
        return pdis/1000;
      }

  }

  _getPreciseDistanceCoords = (lati, longi) => {

    const logmsg = console.log;
    // logmsg(this.props.varLatitude, this.props.varLongitude);
    // logmsg('--------------------');
    var lat = lati;
    var lon = longi;
    // logmsg(lat, lon);
    // logmsg('--------------------');

    if( lat == undefined || lon == undefined ){
      return 'ND';
    }else if( this.props.varLatitude == 0 || this.props.varLongitude == 0 ){
      return '...';
    }else{
      var pdis = getPreciseDistance(
        { latitude: this.props.varLatitude, longitude: this.props.varLongitude },
        { latitude: lat, longitude: lon }
      );
      // console.log(`Precise Distance\n${pdis} Meter\nor\n${pdis / 1000} KM`);
      return pdis/1000;
    }

  }

  goToMap = async (url, lat, lon) => {

    // console.log(url, lat, lon);
    if( url === null ){

      // openMap({ latitude: Number(lat), longitude: Number(lon) });
      // var scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
      var url = 'https://www.google.com/maps/search/?api=1&query=' + `${lat},${lon}`;

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se pudo redireccionar');
      }

    }else{

      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se pudo redireccionar');
      }

    }

  }

  render(){

      let counter = this.props.counter;
      let item = this.props.item;

      // console.log(counter);
      // console.log('ElementList', item);
      // console.log(item);
      // console.log( this.props.indexV, this.props.limit );

      let lati = item.latitude;
      let longi = item.longitude;

      let distancia_relacionada = (item.urlMap === null) ? this._getPreciseDistanceCoords(lati, longi) : this._getPreciseDistanceUrl(item.urlMap);

      if( distancia_relacionada <= this.props.distanciaFinding ){

        /*
        if( counter == 5){
          */
          return(
            <TouchableOpacity onPress={ this.props.onPress } style={{ width: '100%', justifyContent: 'center', alignItems: 'center', alignContent: 'center', marginBottom: this.props.indexV == this.props.limit ? 100 : 0 }}>
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
                      onPress={ () => this.goToMap(item.urlMap, lati, longi) }
                    >
                    <View style={ styles.goToMapButton }>
                       <Text style={styles.goToMapButtonText }>Mapa</Text>
                       <Text style={styles.distanceText }>a { distancia_relacionada } KM</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        /*
        }else{

          return(
            <TouchableOpacity onPress={ this.props.onPress } style={ [ styles.containerCardView, { borderBottomColor: '#000',
                                                        borderBottomWidth: 1, marginBottom: this.props.indexV == this.props.limit ? 100 : 0 }] }>
              <View style={ styles.logoContainer }>
                <FontAwesome name="credit-card-alt" size={25} style={{ color: 'rgba(0, 68, 140, 1.0)' }} />
              </View>
              <View style={ styles.dataContainer }>
                <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'left', marginHorizontal: 15 }}>{ item.label }</Text>
              </View>
              <View style={ styles.buttonContainer }>
                <TouchableOpacity
                    style={{ width: '100%' }}
                    onPress={ () => this.goToMap(item.urlMap, lati, longi) }
                  >
                  <View style={ styles.goToMapButton }>
                     <Text style={styles.goToMapButtonText }>Mapa</Text>
                     <Text style={styles.distanceText }>a { distancia_relacionada } KM</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );

        }*/

      }else{
        return(
          <View style={{ height: 0, marginBottom: this.props.indexV == this.props.limit ? 100 : 0 }}></View>
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
    flexDirection: 'column'
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
    paddingVertical: 1,
    paddingHorizontal: 15,
    width: '100%'
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

  mapStyle: {
    width: '100%',
    height: screenHeight/1.7,
    marginVertical: 20
  },

});
