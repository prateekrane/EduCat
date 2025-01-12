import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    Dimensions,
    Animated,
    ImageBackground,
    StatusBar,
} from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        checkAuthStatus();
        // Start text fade-in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');

            // Wait for 2 seconds
            setTimeout(() => {
                if (token) {
                    // If token exists, go to MainDetail screen
                    navigation.replace('MainDetail');
                } else {
                    // If no token, go to Login screen
                    navigation.replace('Login');
                }
            }, 2000);
        } catch (error) {
            console.error('Error checking auth status:', error);
            navigation.replace('Login');
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
                style={styles.background}
                resizeMode="cover"
            >
                <View style={styles.contentContainer}>
                    <LottieView
                        source={require('../assets/front.json')}
                        autoPlay
                        loop={false}
                        style={styles.animation}
                    />
                    <Animated.Text
                        style={[
                            styles.text,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    {
                                        translateY: fadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [20, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        EduCat
                    </Animated.Text>
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white overlay
        paddingHorizontal: width * 0.1, // 10% padding on each side
    },
    animation: {
        width: Math.min(width * 0.7, 300), // 70% of screen width, max 300
        height: Math.min(width * 0.7, 300), // Keep aspect ratio square
        marginBottom: height * 0.02, // 2% of screen height
    },
    text: {
        fontSize: Math.min(width * 0.1, 40), // Responsive font size, max 40
        fontWeight: 'bold',
        color: '#333', // Dark gray color
        textTransform: 'uppercase',
        letterSpacing: width * 0.01, // Responsive letter spacing
        marginTop: height * 0.02, // 2% of screen height
        textAlign: 'center',
    },
});

export default SplashScreen;
