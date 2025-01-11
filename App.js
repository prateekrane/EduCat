import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './Screens/SplashScreen';
import LoginScreen from './Screens/loginScreen';
import SignUpScreen from './Screens/signUpScreen';
import MainDetail from './Screens/MainDetails';
import PhysicsScreen from './Screens/Physics';
import ChemistryScreen from './Screens/Chemistry';
import MathematicsScreen from './Screens/Maths';




const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="MainDetail" component={MainDetail} />
        <Stack.Screen name="PhysicsScreen" component={PhysicsScreen} />
        <Stack.Screen name="ChemistryScreen" component={ChemistryScreen} />
        <Stack.Screen name="MathematicsScreen" component={MathematicsScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
