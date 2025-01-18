import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Alert,
    ImageBackground,
    StatusBar
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [shakeAnimation] = useState(new Animated.Value(0));
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        API_KEY = "";
        // Basic validation
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                        returnSecureToken: true
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Authentication failed');
            }

            // Store the tokens in AsyncStorage
            await AsyncStorage.setItem('userToken', data.idToken);
            await AsyncStorage.setItem('refreshToken', data.refreshToken);
            await AsyncStorage.setItem('userId', data.localId);
            await AsyncStorage.setItem('userEmail', data.email);

            navigation.replace('MainDetail');
        } catch (error) {
            console.error('Login error:', error);

            // Trigger shake animation
            Animated.sequence([
                Animated.timing(shakeAnimation, {
                    toValue: 10,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnimation, {
                    toValue: -10,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnimation, {
                    toValue: 10,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnimation, {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();

            Alert.alert(
                'Error',
                error.message === 'EMAIL_NOT_FOUND' ? 'Email not found' :
                    error.message === 'INVALID_PASSWORD' ? 'Invalid password' :
                        'Login failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent={true}
            />
            <ImageBackground
                source={require('../assets/backgroundimage.jpg')}
                style={styles.backgroundImage}
                imageStyle={{ opacity: 0.5 }}
                resizeMode="cover"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidingView}
                    contentContainerStyle={styles.keyboardAvoidingContent}
                >
                    <View style={styles.contentContainer}>
                        <Animatable.View
                            animation="fadeInDown"
                            duration={1000}
                            style={styles.headerContainer}
                        >
                            <Text style={styles.headerText}>Welcome Back!</Text>
                            <Text style={styles.subHeaderText}>Sign in to continue</Text>
                        </Animatable.View>

                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <LottieView
                                    source={require('../assets/LoadingMain.json')}
                                    autoPlay
                                    loop
                                    style={styles.loadingAnimation}
                                />
                            </View>
                        ) : (
                            <Animated.View
                                style={[
                                    styles.formContainer,
                                    {
                                        transform: [{
                                            translateX: shakeAnimation
                                        }]
                                    }
                                ]}
                            >
                                <View style={styles.inputContainer}>
                                    <MaterialIcons name="email" size={24} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <MaterialIcons name="lock" size={24} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <MaterialIcons
                                            name={showPassword ? "visibility" : "visibility-off"}
                                            size={24}
                                            color="#666"
                                        />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                                    <Text style={styles.loginButtonText}>Login</Text>
                                </TouchableOpacity>

                                <View style={styles.signupContainer}>
                                    <Text style={styles.signupText}>Don't have an account? </Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                                        <Text style={styles.signupLink}>Sign Up</Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    },
    keyboardAvoidingView: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    keyboardAvoidingContent: {
        flexGrow: 1,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: width * 0.08,
        justifyContent: 'center',
    },
    headerContainer: {
        marginBottom: height * 0.05,
    },
    headerText: {
        fontSize: Math.min(width * 0.08, 32),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: height * 0.01,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    subHeaderText: {
        fontSize: Math.min(width * 0.04, 16),
        color: '#666',
    },
    formContainer: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        marginBottom: height * 0.02,
        paddingHorizontal: width * 0.04,
        height: Math.min(height * 0.07, 50),
        backgroundColor: 'rgba(248, 248, 248, 0.9)',
    },
    inputIcon: {
        marginRight: width * 0.02,
    },
    input: {
        flex: 1,
        fontSize: Math.min(width * 0.04, 16),
    },
    loginButton: {
        backgroundColor: '#716868',
        padding: height * 0.02,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: height * 0.02,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: Math.min(width * 0.045, 18),
        fontWeight: 'bold',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: height * 0.03,
    },
    signupText: {
        color: '#666',
        fontSize: Math.min(width * 0.04, 16),
    },
    signupLink: {
        color: '#3e3636',
        fontSize: Math.min(width * 0.04, 16),
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingAnimation: {
        width: 100,
        height: 100,
    },
});

export default LoginScreen;
