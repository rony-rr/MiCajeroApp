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


export default class OtherScreen extends React.Component {

  constructor(){
    super();
    this.state={
      banco: '',
      readyButton: true,
    };
  }

  componenDidMount(){

    this._captureScreenAnalytic();

  }

  _captureScreenAnalytic = async () => {

    await Analytics.setCurrentScreen('Other');
    await Analytics.logEvent('Seleccionar otro banco', {
      name: 'Other',
      screen: 'Other',
      purpose: 'Seleccionar un banco',
    });
    //await Analytics.setSessionTimeoutDuration(900000); // 15 mins 	El tiempo personalizado de inactividad en milisegundos antes de que finalice la sesión actual.

  }

  _deleteDataAnalytics = async () => {

    await Analytics.resetAnalyticsData(); //  Borra todos los datos analíticos para esta instancia del dispositivo y restablece el ID de la instancia de la aplicación.

  }

  _setUserArguments = async () => {

    await Analytics.setUserProperty('selected_bank', this.state.banco);

  }

  changeBanco(value){

    this.setState({ banco: value }, () => { console.log(this.state.banco); });

  }

  nextScreen = () => {

    this._setUserArguments();
    this.props.navigation.navigate('Home',
                                           {
                                             screen: 'Resultados',
                                             params: { banco: this.state.banco },
                                           });
  }

  render(){

    return(

            <View style={ styles.container }>

              <StatusBar barStyle="light-content" backgroundColor="rgba(91, 91, 91, 1)" />

              <Text style={ styles.titleStyle }>Mi cajero</Text>
              <Text style={ styles.subTitleStyle }>Seleccione su banco</Text>
              <View style={{ width: '90%', marginVertical: 15 }}>
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
