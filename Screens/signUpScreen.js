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
    ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

const SignUpScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [shakeAnimation] = useState(new Animated.Value(0));

    const handleSignUp = async () => {
        API_KEY = "AIzaSyBLUHWBolUBywqJJYLuEkv48zhLOklh-TQ";
        // Basic validation
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
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
            return;
        }

        try {
            const response = await fetch(
                `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
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
                throw new Error(data.error?.message || 'Something went wrong!');
            }

            // Store the tokens in AsyncStorage
            await AsyncStorage.setItem('userToken', data.idToken);
            await AsyncStorage.setItem('refreshToken', data.refreshToken);
            await AsyncStorage.setItem('userId', data.localId);
            await AsyncStorage.setItem('userEmail', data.email);

            navigation.replace('MainDetail');
        } catch (error) {
            console.error('Signup error:', error);
            Alert.alert(
                'Error',
                error.message || 'Failed to create account. Please try again.'
            );
        }
    };

    return (
        <View style={styles.container}>
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
                    <ScrollView
                        contentContainerStyle={styles.scrollViewContent}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.contentContainer}>
                            <Animatable.View
                                animation="fadeInDown"
                                duration={1000}
                                style={styles.headerContainer}
                            >
                                <Text style={styles.headerText}>Create Account</Text>
                                <Text style={styles.subHeaderText}>Sign up to get started</Text>
                            </Animatable.View>

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
                                    <MaterialIcons name="person" size={24} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Full Name"
                                        value={name}
                                        onChangeText={setName}
                                        autoCapitalize="words"
                                    />
                                </View>

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

                                <View style={styles.inputContainer}>
                                    <MaterialIcons name="lock" size={24} color="#666" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                </View>

                                <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                                    <Text style={styles.signUpButtonText}>Sign Up</Text>
                                </TouchableOpacity>

                                <View style={styles.loginContainer}>
                                    <Text style={styles.loginText}>Already have an account? </Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                        <Text style={styles.loginLink}>Login</Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        </View>
                    </ScrollView>
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
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: height * 0.05,
    },
    contentContainer: {
        paddingHorizontal: width * 0.08,
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
    signUpButton: {
        backgroundColor: '#007AFF',
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
    signUpButtonText: {
        color: '#fff',
        fontSize: Math.min(width * 0.045, 18),
        fontWeight: 'bold',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: height * 0.03,
    },
    loginText: {
        color: '#666',
        fontSize: Math.min(width * 0.04, 16),
    },
    loginLink: {
        color: '#007AFF',
        fontSize: Math.min(width * 0.04, 16),
        fontWeight: 'bold',
    },
});

export default SignUpScreen;