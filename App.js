
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from "./Screens/login"
import Register from "./Screens/register"
import Home from "./Screens/home"
import PharmacyMap from "./Screens/PharmacyMap"
import ClientMedicineOrderScreen from "./client/ClientMedicineOrderScreen"

const Stack = createNativeStackNavigator();



export default function App() {
  return (
   <NavigationContainer>
     <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
       <Stack.Screen name="Login" component={Login} options={{ title: 'Connexion' }} />
       <Stack.Screen name="Register" component={Register} options={{ title: 'inscreption' }} />
       <Stack.Screen name="Home" component={Home} options={{ title: 'home' }} />

       <Stack.Screen name="PharmacyMap" component={PharmacyMap} options={{ title: 'PharmacyMap' }} />
       <Stack.Screen name="ClientMedicineOrder" component={ClientMedicineOrderScreen} options={{ title: 'Commande' }} />
     </Stack.Navigator>
   </NavigationContainer>
  

  );
}
