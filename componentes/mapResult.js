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
const LOCATION_SETTINGS = {
  accuracy: Location.Accuracy.Balanced,
  timeInterval: 200,
  distanceInterval: 0,
};

export default class MapScreen extends React.Component {

  constructor(){
    super();
    this.state = {

      latitude: 0.0,
      longitude: 0.0,

    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  componentDidMount(){

    // console.log( Constants.deviceName );
    this.setState({
      latitude: Number(this.props.route.params.lat),
      longitude: Number(this.props.route.params.lon),
      latitudeAct: Number(this.props.route.params.latA),
      longitudeAct: Number(this.props.route.params.lonA)
    }, () => { this._mapViewOn(); });

    this.showInterstitial();

    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

  }

  handleBackButtonClick() {
	    BackHandler.exitApp()
	    return true;
	}

  showInterstitial = async () => {
    await AdMobInterstitial.setAdUnitID('ca-app-pub-8287263841467710/8670105663'); // Test ID, Replace with your-admob-unit-id
    await AdMobInterstitial.requestAdAsync({ servePersonalizedAds: true});
    await AdMobInterstitial.showAdAsync();

    // FacebookAds.InterstitialAdManager.showAd(placementId)
    // .then(didClick => {})
    // .catch(error => {});
  }

  _mapViewOn = async () => {
      var url = 'https://www.google.com/maps/search/?api=1&query=' + `${this.state.latitude},${this.state.longitude}`;
      this.setState({ uriTempMap: url });

      var startLoc = this.state.latitudeAct + ", " + this.state.longitudeAct;
      var endLoc = this.state.latitude + ", " + this.state.longitude;

      try{

        var resp = await fetch('https://maps.googleapis.com/maps/api/directions/json?origin='+ startLoc +'&destination='+ endLoc +'&key=' + GOOGLE_API_KEY);
        var respJson = await resp.json();
        let points = polyline.decode( respJson.routes[0].overview_polyline.points );
        let coordss = [];
        points.map((point, index) =>{

          coordss.push({
            latitude: Number(point[0]),
            longitude: Number(point[1])
          });

        });
        this.setState({ coordss: coordss }, () => { /*console.log( this.state.coordss )*/ });

      }catch(error){

        console.log(error);

      }

  }

  goToMap = async () => {

    const supported = await Linking.canOpenURL(this.state.uriTempMap);
    if (supported) {
      await Linking.openURL(this.state.uriTempMap);
    } else {
      Alert.alert('Error', 'No se pudo redireccionar');
    }

  }

  render(){

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
            Punto de llegada
          </Text>
        </View>

        <View style={ styles.mainContainer }>
          <View style={{ width: '100%', height: screenHeight/1.7,
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: 22 }}>
            <View style={{
              width: '100%',
              height: '100%',
              paddingVertical: 25,
              paddingHorizontal: 15,
              backgroundColor: "white",
              borderRadius: 2,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5
            }}>
              <Text style={{ fontSize: 17, fontWeight: 'bold', }}>Ruta según Google</Text>
              <View style={{ height: 1, width: '90%', backgroundColor: '#ddd', marginBottom: 12 }}></View>

              <MapView
                    style={styles.mapStyle}
                    // showsUserLocation={true}
                    // followUserLocation={true}
                    // zoomEnabled={true}
                    // pitchEnabled={true}
                    // showsCompass={true}
                    // showsBuildings={true}
                    // showsTraffic={true}
                    // showsIndoors={true}
                    initialRegion={{
                      latitude: Number( this.state.latitude ),
                      longitude: Number( this.state.longitude ),
                      latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421,
                    }}
              >
                <Marker
                    draggable
                    coordinate={{ latitude: Number(this.state.latitude), longitude: Number(this.state.longitude) }}
                    title='Proximidad de cajero'
                    description='Cajero localizado'
                    onDragEnd={ (e) => { /*console.log(JSON.stringify(e.nativeEvent.coordinate));*/ Alert.alert('Se ha desviado de su punto de interés.') } }
                 ></Marker >
                 <Marker
                     draggable
                     coordinate={{ latitude: Number(this.state.latitudeAct), longitude: Number(this.state.longitudeAct) }}
                     title='Su ubicación'
                     description='Estado actual'
                     onDragEnd={ (e) => { /*console.log(JSON.stringify(e.nativeEvent.coordinate));*/ Alert.alert('Ha cambiado su punto de inicio.') } }
                  ></Marker >
                  {
                    this.state.coordss && this.state.coordss.length > 0
                    ?
                    <Polyline
                     coordinates={this.state.coordss}
                     strokeColor="#FF5733" // fallback for when `strokeColors` is not supported by the map-provider
                     strokeWidth={6}
                     />
                    :
                    null
                  }
                  {
                    this.state.coordss && this.state.coordss.length > 0
                    ?
                    <Polyline
                     coordinates={ [{latitude: this.state.latitudeAct, longitude: this.state.longitudeAct}, {latitude: this.state.latitude, longitude: this.state.longitude}] }
                     strokeColor="#117864" // fallback for when `strokeColors` is not supported by the map-provider
                     strokeWidth={6}
                     />
                    :
                    null
                  }

              </MapView>

            </View>
          </View>
        </View>


        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center', alignContent: 'center' }}>
          <TouchableOpacity
            style={{ backgroundColor: "#2196F3", width: '40%', height: 40, borderTopLeftRadius: 5, borderBottomLeftRadius: 5,
                    justifyContent: 'center', alignItems: 'center', alignContent: 'center'}}
            onPress={() => {
              this.goToMap();
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFF' }}>Ir al mapa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: "#2196F3", width: '40%', height: 40, borderTopRightRadius: 5, borderBottomRightRadius: 5,
                    justifyContent: 'center', alignItems: 'center', alignContent: 'center', borderLeftWidth: 1, borderLeftColor: '#ddd' }}
            onPress={() => {
              this.props.navigation.navigate('Resultados', { banco: 'Todos' });
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFF' }}>Regresar</Text>
          </TouchableOpacity>
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
    height: screenHeight/2,
    marginVertical: 20
  },

});
