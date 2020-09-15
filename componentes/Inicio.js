import * as React from 'react';

import { StyleSheet, Text, View, ScrollView, Dimensions, Button,
            TouchableOpacity, ActivityIndicator, Alert,
            FlatList, Image, Picker, RefreshControl, AsyncStorage, StatusBar } from 'react-native';

import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Ionicons, FontAwesome, Entypo } from '@expo/vector-icons';
import * as Analytics from 'expo-firebase-analytics';


export default class InitialScreen extends React.Component {

  constructor(){
    super();
    this.state={
      banco: '',
      device_IMEI: Constants.deviceId,
      readyButton: false,
      loading: true,
    };
  }

  componentDidMount(){

    this._captureScreenAnalytic();

    setTimeout( () => {
      this.nextScreen();
    }, 2000);

  }

  _captureScreenAnalytic = async () => {

    await Analytics.setCurrentScreen('Inicio');
    await Analytics.logEvent('Ingresó_al_app', {
      name: 'Inicio',
      screen: 'Inicio',
      purpose: 'Seleccionar un banco',
    });
    //await Analytics.setSessionTimeoutDuration(900000); // 15 mins 	El tiempo personalizado de inactividad en milisegundos antes de que finalice la sesión actual.

  }

  _deleteDataAnalytics = async () => {

    await Analytics.resetAnalyticsData(); //  Borra todos los datos analíticos para esta instancia del dispositivo y restablece el ID de la instancia de la aplicación.

  }

  _setUserArguments = async () => {

    await Analytics.setUserProperty('selected_bank', 'Todos');

  }

  changeBanco(value){

    this.setState({ banco: value }, () => { console.log(this.state.banco); });

  }

  nextScreen = () => {

    this._setUserArguments();
    /*
    this.props.navigation.navigate('Home',
                                           {
                                             screen: 'Resultados',
                                             params: { banco: 'Todos' },
                                           });*/
    this.props.navigation.navigate('Resultados', { banco: 'Todos' });

  }

  render(){

    return(

            <View style={ styles.container }>

              <StatusBar barStyle="light-content" backgroundColor="rgba(91, 91, 91, 1)" />

              <Text style={ styles.titleStyle }>Mi cajero</Text>
              <Text style={ styles.subTitleStyle }>Bienvenido!</Text>
              <View style={{ width: '90%', marginVertical: 15, justifyContent: 'center', alignItems: 'center' }}>
                  {
                    this.state.loading

                    ?

                    <Text style={ styles.subTitleStyle }>Cargando lista...</Text>

                    :

                    <Picker
                              selectedValue={this.state.banco}
                              style={{ height: 50, width: '100%', alignSelf: 'center',
                                        backgroundColor: "rgba(91, 91, 91, 0.75)", color: '#FFF',
                                          fontWeight: "bold", borderRadius: 8, fontSize: 18 }}
                              itemStyle={{ height: 44, color: '#000', fontWeight: 'bold' }}
                              onValueChange={ (itemValue, itemIndex) => { this.changeBanco(itemValue); } }
                              mode={'dialog'}
                              prompt="Seleccione País"
                            >

                            <Picker.Item label="Elija banco" color="#000" value="no" />
                            <Picker.Item label="Banco agrícola" color="#000" value="1" />
                            <Picker.Item label="BAC Credomatic" color="#000" value="2" />
                            <Picker.Item label="Banco cuscatlan" color="#000" value="3" />

                    </Picker>
                  }

                </View>

                {
                  this.state.readyButton

                  ?

                  <TouchableOpacity style={styles.nextButton} onPress={ this.nextScreen } >
                              <Text style={styles.nextText}>Guardar</Text>
                              <FontAwesome
                                            style={{padding: 3, marginLeft: 20}}
                                            name="arrow-right"
                                            size={25}
                                            color='rgba(0, 68, 140, 1)'/>
                  </TouchableOpacity>

                  :

                  <ActivityIndicator size="large" color="#FFF" style={{marginVertical: 0}} />

                }

                <Text style={{ fontSize: 8, textAlign: 'center', marginTop: 20, color: '#FFF' }}>Creditos: www.flaticon.com</Text>
            </View>

    );

  }

}


const styles = StyleSheet.create({

  container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 68, 140, 1.0)',
    },

    titleStyle: {
      color: 'rgba(255, 210, 0, 1.0)',
      fontSize: 40,
      fontWeight: "700",
    },

    subTitleStyle: {
      color: '#FFF',
      width: '70%',
      fontSize: 14,
      textAlign: 'center'
    },

    nextText: {
      color: 'rgba(0, 68, 140, 1.0)',
      textAlign: 'center',
      fontWeight: 'bold',
      fontSize:  22,
      paddingBottom: 5,
      paddingTop: 5
    },

    nextButton: {
      width: '70%',
      borderRadius: 25,
      backgroundColor: 'rgba(255, 210, 0, 1.0)',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 12,
      marginHorizontal: 10,
      flexDirection: 'row'
    },

});
