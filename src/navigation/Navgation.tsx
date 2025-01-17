import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { navigationRef } from '../utils/NavigationUtil'
import SplashScreen from '../screens/SplashScreen'
import HomeScreen from '../screens/HomeScreen'
import { TCPProvider } from '../services/TCPProvider'
import ConnectionScreen from '../screens/ConnectionScreen'
import SendScreen from '../screens/SendScreen'
import ReceivedFileScreen from '../screens/ReceivedFileScreen'
import ReceivedScreen from '../screens/ReceivedScreen'

const Stack = createNativeStackNavigator()
const Navgation = () => {
    return (
        <TCPProvider>
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName='SplachScreen' screenOptions={{ headerShown: false }}>
                    <Stack.Screen name='SplachScreen' component={SplashScreen} />
                    <Stack.Screen name='HomeScreen' component={HomeScreen} />
                    <Stack.Screen name='ConnectionScreen' component={ConnectionScreen} />
                    <Stack.Screen
                        name='SendScreen' component={SendScreen} />
                    <Stack.Screen name='ReceivedFileScreen' component={ReceivedFileScreen} />
                    <Stack.Screen name='ReceivedScreen' component={ReceivedScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </TCPProvider>

    )
}

export default Navgation