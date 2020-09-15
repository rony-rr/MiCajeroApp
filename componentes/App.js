import React, { useState,useEffect } from 'react';

import {
  StyleSheet, Text, View, ScrollView, Button, Platform, Linking,
  TouchableOpacity, ActivityIndicator, Alert, TouchableNativeFeedback,
  FlatList, Image, Picker, RefreshControl, AsyncStorage, StatusBar, TextInput
} from 'react-native';
import { getDistance, getPreciseDistance } from 'geolib';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons, FontAwesome, Entypo } from '@expo/vector-icons';
import { Dimensions } from "react-native";
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
import JSONDATA from './customData.json';

export default function App() {
  const [loading, setLoading] = useState(true)
  const [longitude, setLongitude] = useState(-88.89653)
  const [latitude, setLatitude] = useState(13.794185)
  const [counter, setCounter] = useState(0)
  const buscarLocation = async ()=>{
    const {status} = await Location.requestPermissionsAsync({});
    if(status !== 'granted'){
      return Alert.alert('Activa los permiso de GPS')
    }
    const location  = await Location.getCurrentPositionAsync({});
    setLatitude(location.coords.latitude);
    setLongitude(location.coords.longitude);
   }

  const _getPreciseDistance = (latitude1, longitude1) => {
    console.log(latitude1, longitude1);
    console.log(latitude, longitude);
    console.log('--------------------');
    if (latitude1 == undefined || longitude1 == undefined) {
      return 'ND';
    } else if (latitude == 0 || longitude == 0) {
      return 'Cargando..';
    } else {
      var pdis = getPreciseDistance(
        { latitude: latitude, longitude: longitude },
        { latitude: latitude1, longitude: longitude1 }
      );

      return pdis / 1000;
    }

  }

  useEffect(() => {
    buscarLocation()

  },[])


  return (

    <View>
      {/* bar superior del mismo color de header para dispositivos con notch */}
      <StatusBar barStyle="light-content" backgroundColor="#283E6C" />
      {/* header superior */}
      <Text style={styles.header}>Listado de Bancos</Text>
      {/* input busqueda con icon */}
      <View style={styles.styleViewSearchBox}>
        <FontAwesome
          style={{ paddingRight: 10 }}
          name="search"
          size={30}
          color='#283E6C'
        />
        <TextInput
          style={styles.TextInputSearch}
          onChangeText={(textSearch) =>SearchFilterCajeros(textSearch)}
          underlineColorAndroid='transparent'
          placeholder="Buscar.."
        />
      </View>
      {/*  Scrollview listado de cajeros */}
      <ScrollView contentContainerStyle={{marginBottom:20,marginLeft:10,marginRight:10}}>
        {
          /* iterando data */

          JSONDATA.data.map((item,index)=>
                    {
                      setCounter(counter+1);
                      if(counter === 3){
                        setCounter(0)
                        return(
                          <View key={index.toString()} style={styles.containerCardView}>

                            <View style={styles.logoContainer}>
                              <FontAwesome name="credit-card-alt" size={25} style={{ color: '#283E6C', marginHorizontal: 10 }} />
                            </View>

                            <View style={{ width: '50%', fontWeight: 'bold' }}>
                              <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
                            </View>

                            <TouchableOpacity style={styles.goToMapButton}
                              onPress={() => { Linking.openURL(item.placeUrl) }}
                            >
                              <FontAwesome name="map" size={25} style={{ color: 'white', marginHorizontal: 10 }} />
                              {/* componenten para calcular la distancia entre dos puntos pasando props de coordenadas */}
                              <Text style={styles.distanceText}>a {_getPreciseDistance(item.latitude, item.longitude)} KM</Text>
                            </TouchableOpacity>
                            <View style={{backgroundColor:'red'}}>
                              <Text>sada</Text>
                            </View>
                          </View>
                        )

                      }else{
                        return(
                          <View key={index.toString()} style={styles.containerCardView}>

                            <View style={styles.logoContainer}>
                              <FontAwesome name="credit-card-alt" size={25} style={{ color: '#283E6C', marginHorizontal: 10 }} />
                            </View>

                            <View style={{ width: '50%', fontWeight: 'bold' }}>
                              <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
                            </View>

                            <TouchableOpacity style={styles.goToMapButton}
                              onPress={() => { Linking.openURL(item.placeUrl) }}
                            >
                              <FontAwesome name="map" size={25} style={{ color: 'white', marginHorizontal: 10 }} />
                              {/* componenten para calcular la distancia entre dos puntos pasando props de coordenadas */}
                              <Text style={styles.distanceText}>a {_getPreciseDistance(item.latitude, item.longitude)} KM</Text>
                            </TouchableOpacity>

                          </View>
                        )
                      }
                    }





          )

        }

      </ScrollView>
    </View>


  )
}



const styles = StyleSheet.create({
  header: {
    backgroundColor: '#283E6C',
    textAlign: 'center',
    color: '#E3C636',
    fontSize: 20,
    padding: 10,
    fontWeight: 'bold'
  },
  containerCardView: {
    width: '100%',
    flexDirection: 'row',
    height: 85,
    borderBottomColor: '#000',
    borderBottomWidth: 1
  },
  logoContainer: {
    width: '25%',
    height: '100%',
    flexDirection:'row',
  },
  goToMapButton: {
    width: '20%',
    height: '70%',
    marginLeft:10,
    backgroundColor: '#283E6C',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceText: {
    color: 'white',
    fontSize: 10,
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
  TextInputSearch: {
    textAlign: 'center',
    height: 40,
    width: '80%',
    borderWidth: 3,
    borderColor: 'rgba(0, 68, 140, 1.0)',
    borderRadius: 20,
    backgroundColor: "#FFF",
    fontWeight: 'bold',
    fontSize: 18
  },
});
