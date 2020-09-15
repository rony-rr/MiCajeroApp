import * as React from 'react';
import { Text, View, AsyncStorage, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import InitialScreen from './componentes/Inicio';
import ResultScreen from './componentes/Resultados';
import MapScreen from './componentes/mapResult';
// import OtherScreen from './componentes/Other';
/*
const Tab = createBottomTabNavigator();

function HomeTabs() {

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Otro banco') {
            iconName = focused
              ? 'ios-search'
              : 'ios-search';
          } else if (route.name === 'Resultados') {
            iconName = focused ? 'ios-pin' : 'ios-pin';
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="Resultados" component={ResultScreen} />
    </Tab.Navigator>
  );
}
*/


const Stack = createStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator
          screenOptions={{
            headerShown: false
          }}
            >
          <Stack.Screen name="Inicio" component={InitialScreen}/>
          <Stack.Screen name="Resultados"
                        component={ResultScreen}
                        options={{
                          title: 'MiCajero',
                          headerLeft: '', }} />
          <Stack.Screen name="Mapa"
                        component={MapScreen}
                        options={{
                          title: 'Mapa',
                          headerLeft: '', }} />
      </Stack.Navigator>
    </NavigationContainer>
  );

}
