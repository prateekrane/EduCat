import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Platform, ImageBackground, Animated, Modal, BlurView } from 'react-native';
import React, { useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import ChatBotScreen from './ChatBot';
const { width, height } = Dimensions.get('window');

const MainDetails = ({ navigation }) => {
    const [isChatVisible, setIsChatVisible] = useState(false);
    const animationRef = useRef(null);
    const slideAnim = useRef(new Animated.Value(height)).current;

    const handleLogout = async () => {
        try {
            await AsyncStorage.multiRemove([
                'userToken',
                'refreshToken',
                'userId',
                'userEmail'
            ]);
            navigation.replace('Login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleSubjectPress = (subject) => {
        navigation.navigate(`${subject}Screen`);
    };

    const handleAnimationPress = () => {
        if (animationRef.current) {
            animationRef.current.play();
        }
        setIsChatVisible(true);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7
        }).start();
    };

    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            useNativeDriver: true
        }).start(() => setIsChatVisible(false));
    };

    return (
        <ImageBackground
            source={require('../assets/backgroundimage.jpg')}
            style={styles.container}
            imageStyle={{ opacity: 0.4 }}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <MaterialIcons name="logout" size={24} color="white" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <Animatable.View
                    animation="fadeInDown"
                    duration={1000}
                    style={styles.headerContainer}
                >
                    <Text style={styles.headerText}>Expert Learning Hub</Text>
                    <Text style={styles.subHeaderText}>Choose Subject</Text>
                </Animatable.View>

                <View style={styles.subjectsContainer}>
                    {[
                        { name: 'Physics', color: '#3e3636', icon: 'science' },
                        { name: 'Chemistry', color: '#3e3636', icon: 'biotech' },
                        { name: 'Mathematics', color: '#3e3636', icon: 'functions' }
                    ].map((subject, index) => (
                        <Animatable.View
                            key={subject.name}
                            animation="zoomIn"
                            duration={800}
                            delay={300 * index}
                        >
                            <TouchableOpacity
                                style={[styles.subjectCard, { backgroundColor: subject.color }]}
                                onPress={() => handleSubjectPress(subject.name)}
                                activeOpacity={0.9}
                            >
                                <MaterialIcons name={subject.icon} size={36} color="white" />
                                <Text style={styles.subjectText}>{subject.name}</Text>
                            </TouchableOpacity>
                        </Animatable.View>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.animationButton}
                    onPress={handleAnimationPress}
                    activeOpacity={0.7}
                >
                    <LottieView
                        ref={animationRef}
                        source={require('../assets/chatbot.json')}
                        autoPlay
                        loop={true}
                        style={styles.lottieAnimation}
                    />
                </TouchableOpacity>

                {isChatVisible && (
                    <View style={styles.modalContainer}>
                        <TouchableOpacity
                            style={styles.blurOverlay}
                            activeOpacity={1}
                            onPress={handleClose}
                        />
                        <Animated.View
                            style={[
                                styles.chatContainer,
                                {
                                    transform: [{ translateY: slideAnim }]
                                }
                            ]}
                        >
                            <View style={styles.chatHeader}>
                                <Text style={styles.chatTitle}>Virtual Consultant</Text>
                                <TouchableOpacity onPress={handleClose}>
                                    <MaterialIcons name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.chatContent}>
                                {/* Add your ChatBotScreen content here */}
                                <ChatBotScreen />
                            </View>
                        </Animated.View>
                    </View>
                )}
            </View>
        </ImageBackground>
    );
};

export default MainDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'black',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 25,
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        right: 20,
        zIndex: 1,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    logoutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    headerContainer: {
        alignItems: 'center',
        marginTop: height * 0.1,
        marginBottom: height * 0.05,
    },
    headerText: {
        fontSize: Math.min(width * 0.08, 32),
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    subHeaderText: {
        fontSize: Math.min(width * 0.05, 20),
        color: 'black',
        marginBottom: height * 0.02,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    subjectsContainer: {
        paddingHorizontal: width * 0.05,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subjectCard: {
        width: width * 0.85,
        height: height * 0.15,
        marginVertical: 10,
        borderRadius: 15,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        transform: [{ perspective: 1000 }],
        backdropFilter: 'blur(10px)',
    },
    subjectText: {
        color: 'white',
        fontSize: Math.min(width * 0.06, 24),
        fontWeight: 'bold',
        marginLeft: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    animationButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 80,  // Adjust size as needed
        height: 80,  // Adjust size as needed
        borderRadius: 40,  // Make it circular
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        backgroundColor: '#e0e0e0',  // Optional: slight background
        overflow: 'hidden',  // Keep animation within bounds
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    lottieAnimation: {
        width: '100%',
        height: '100%',
    },
    modalContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
    },
    blurOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    chatContainer: {
        height: height * 0.7, // Takes up 70% of screen height
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    chatTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    chatContent: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
});