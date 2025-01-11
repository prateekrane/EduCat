import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ScrollView, Platform, ActivityIndicator, Dimensions, Modal, ImageBackground, Animated } from 'react-native';
import React, { useState, useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import ChatBotScreen from './ChatBot';
const NLPCloudClient = require('nlpcloud');

const { width, height } = Dimensions.get('window');

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
};

const ChemistryScreen = () => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isChatVisible, setIsChatVisible] = useState(false);
    const animationRef = useRef(null);
    const slideAnim = useRef(new Animated.Value(height)).current;

    const handleSend = async () => {
        if (question.trim()) {
            setIsLoading(true);
            let retryCount = 0;
            const maxRetries = 3;

            while (retryCount < maxRetries) {
                try {
                    const client = new NLPCloudClient({
                        model: 'finetuned-llama-3-70b',
                        token: 'bb9f5ba695aba792cc57d12e4a8da38a205e54bd',
                        gpu: true
                    });

                    const response = await client.question({
                        question: question,
                        context: `This is a chemistry related question: ${question}`
                    });

                    const answerText = response.data.answer ||
                        response.data.text ||
                        response.data.toString();

                    const cleanAnswer = answerText.replace(/^Answer:\s*/i, '').trim();
                    setAnswer(cleanAnswer);
                    setQuestion('');
                    break; // Success, exit the retry loop

                } catch (error) {
                    console.error(`Attempt ${retryCount + 1} failed:`, error);

                    if (error?.response?.status === 429) {
                        // Rate limit hit, wait longer before next retry
                        retryCount++;
                        if (retryCount < maxRetries) {
                            await wait(2000 * retryCount); // Progressive waiting: 2s, 4s, 6s
                            continue;
                        }
                        setAnswer("The service is currently busy. Please try again in a few moments.");
                    } else {
                        setAnswer("I'm sorry, I encountered an error. Please try again.");
                        break;
                    }
                }
            }
            setIsLoading(false);
        }
    };

    const handleTakePhoto = async () => {
        try {
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            if (cameraStatus !== 'granted') {
                alert('Sorry, we need camera permissions to make this work!');
                return;
            }

            const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (mediaStatus !== 'granted') {
                alert('Sorry, we need media library permissions to make this work!');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Camera Error:', error);
            alert('Error accessing camera. Please try again.');
        }
    };

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need gallery permissions to make this work!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Gallery Error:', error);
            alert('Error accessing gallery. Please try again.');
        }
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
            source={require('../assets/chembackground.jpg')}
            style={styles.container}
            imageStyle={{ opacity: 0.4 }}
        >
            <View style={styles.overlay}>
                <LinearGradient
                    colors={['#3e3636', '#5d5555', '#726666']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.header}
                >
                    <Animatable.Text
                        animation="fadeInDown"
                        style={styles.headerText}
                    >
                        Chemistry
                    </Animatable.Text>
                    <Text style={styles.subHeaderText}>Ask anything about chemistry</Text>
                </LinearGradient>

                <ScrollView
                    style={styles.content}
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                >
                    <Animatable.View
                        animation="fadeInUp"
                        duration={1000}
                        style={styles.answerBox}
                    >
                        <LinearGradient
                            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                            style={styles.answerGradient}
                        >
                            <View style={styles.answerHeader}>
                                <MaterialIcons name="psychology" size={24} color="#4158D0" />
                                <Text style={styles.answerHeaderText}>AI Response</Text>
                            </View>
                            <ScrollView
                                style={styles.answerScrollView}
                                nestedScrollEnabled={true}
                                showsVerticalScrollIndicator={true}
                                contentContainerStyle={styles.answerScrollViewContent}
                            >
                                {isLoading ? (
                                    <View style={styles.loadingContainer}>
                                        <LottieView
                                            source={require('../assets/loading.json')}
                                            autoPlay
                                            loop
                                            style={styles.loadingAnimation}
                                        />
                                        <Text style={styles.loadingText}>Processing your question...</Text>
                                    </View>
                                ) : answer ? (
                                    <Text style={styles.answerText}>{answer}</Text>
                                ) : (
                                    <View style={styles.placeholderContainer}>
                                        <LottieView
                                            source={require('../assets/empty-state.json')}
                                            autoPlay
                                            loop
                                            style={styles.emptyAnimation}
                                        />
                                        <Text style={styles.placeholderText}>
                                            Your answer will appear here
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        </LinearGradient>
                    </Animatable.View>

                    {selectedImage && (
                        <Animatable.View
                            animation="zoomIn"
                            style={styles.imagePreviewContainer}
                        >
                            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={() => setSelectedImage(null)}
                            >
                                <MaterialIcons name="close" size={20} color="white" />
                            </TouchableOpacity>
                        </Animatable.View>
                    )}

                    <View style={styles.inputSection}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={question}
                                onChangeText={setQuestion}
                                placeholder="Type your chemistry question..."
                                placeholderTextColor="#999"
                                multiline
                                maxLength={1000}
                            />
                            <View style={styles.inputButtons}>
                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={handleTakePhoto}
                                >
                                    <MaterialIcons name="camera-alt" size={24} color="#4158D0" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.iconButton, { marginHorizontal: 10 }]}
                                    onPress={handlePickImage}
                                >
                                    <MaterialIcons name="image" size={24} color="#4158D0" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.sendButton, !question.trim() && styles.sendButtonDisabled]}
                                    onPress={handleSend}
                                    disabled={!question.trim()}
                                >
                                    <LinearGradient
                                        colors={['#3e3636', '#5d5555']}
                                        style={styles.sendButtonGradient}
                                    >
                                        <MaterialIcons name="send" size={24} color="white" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.bottomPadding} />
                </ScrollView>

                <Animatable.View
                    animation="bounceIn"
                    delay={500}
                    style={styles.chatbotButton}
                >
                    <TouchableOpacity onPress={handleAnimationPress}>
                        <LinearGradient
                            colors={['#ded4d4', '#efe5e5']}
                            style={styles.chatbotGradient}
                        >
                            <View style={styles.chatbotContent}>
                                <LottieView
                                    ref={animationRef}
                                    source={require('../assets/chatbot.json')}
                                    autoPlay
                                    loop
                                    style={styles.chatbotAnimation}
                                />
                                <Text style={styles.chatbotText}>AI</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animatable.View>

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
                                <ChatBotScreen />
                            </View>
                        </Animated.View>
                    </View>
                )}
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(93, 85, 85, 0.75)',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    headerText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 5,
    },
    subHeaderText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    answerBox: {
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    answerGradient: {
        padding: 20,
        minHeight: 200,
    },
    answerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        paddingBottom: 10,
    },
    answerHeaderText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#3e3636',
        marginLeft: 10,
    },
    answerText: {
        fontSize: 16,
        color: '#3e3636',
        lineHeight: 24,
    },
    placeholderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    placeholderText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 10,
    },
    imagePreviewContainer: {
        marginVertical: 10,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputSection: {
        marginBottom: 20,
    },
    inputContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    input: {
        minHeight: 40,
        maxHeight: 120,
        fontSize: 16,
        color: '#3e3636',
        paddingHorizontal: 10,
    },
    inputButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        marginTop: 10,
    },
    iconButton: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    sendButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        overflow: 'hidden',
    },
    sendButtonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(93, 85, 85, 0.9)',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    chatbotButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    chatbotGradient: {
        width: 120,
        height: 45,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    chatbotContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    chatbotAnimation: {
        width: 30,
        height: 30,
        marginRight: 5,
    },
    chatbotText: {
        color: '#3e3636',
        fontSize: 16,
        fontWeight: '600',
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
    loadingText: {
        marginTop: 10,
        color: '#3e3636',
        fontSize: 14,
    },
    emptyAnimation: {
        width: 120,
        height: 120,
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
        height: height * 0.7,
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

export default ChemistryScreen;