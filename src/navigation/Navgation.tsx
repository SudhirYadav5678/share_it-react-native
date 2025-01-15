import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { navigationRef } from '../utils/NavigationUtil'
import SplashScreen from '../screens/SplashScreen'
import HomeScreen from '../screens/HomeScreen'

const Stack = createNativeStackNavigator()
const Navgation = () => {
    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator initialRouteName='SplachScreen' screenOptions={{ headerShown: false }}>
                <Stack.Screen name='SplachScreen' component={SplashScreen} />
                <Stack.Screen name='HomeScreen' component={HomeScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default Navgation