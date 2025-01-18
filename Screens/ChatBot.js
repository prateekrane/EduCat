import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import React, { useState, useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from "@google/generative-ai";

const ChatBotScreen = () => {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef(null);

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(""); // Replace with your actual API key
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const handleSend = async () => {
        if (message.trim()) {
            // Add user message to chat
            const userMessage = { id: Date.now(), text: message, sender: 'user' };
            setChat(prev => [...prev, userMessage]);
            setMessage('');
            setIsLoading(true);

            try {
                // Generate response using Gemini
                const result = await model.generateContent(message);
                const response = result.response.text();

                // Add AI response to chat
                setChat(prev => [...prev, {
                    id: Date.now(),
                    text: response,
                    sender: 'bot'
                }]);
            } catch (error) {
                console.error('Chat error:', error);
                // Add error message to chat
                setChat(prev => [...prev, {
                    id: Date.now(),
                    text: "I'm sorry, I'm having trouble responding right now. Please try again.",
                    sender: 'bot',
                    isError: true
                }]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={chat}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={[
                        styles.messageBubble,
                        item.sender === 'user' ? styles.userMessage : styles.botMessage,
                        item.isError && styles.errorMessage
                    ]}>
                        {item.sender === 'bot' && (
                            <MaterialIcons
                                name="smart-toy"
                                size={20}
                                color="#666"
                                style={styles.botIcon}
                            />
                        )}
                        <Text style={[
                            styles.messageText,
                            item.sender === 'bot' && styles.botMessageText,
                            item.isError && styles.errorText
                        ]}>
                            {item.text}
                        </Text>
                    </View>
                )}
                style={styles.chatList}
                contentContainerStyle={styles.chatListContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#007AFF" />
                    <Text style={styles.loadingText}>AI is thinking...</Text>
                </View>
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Ask anything..."
                    placeholderTextColor="#999"
                    multiline
                    maxLength={500}
                    editable={!isLoading}
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!message.trim() || isLoading) && styles.sendButtonDisabled
                    ]}
                    onPress={handleSend}
                    disabled={!message.trim() || isLoading}
                >
                    <MaterialIcons
                        name="send"
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    chatList: {
        flex: 1,
    },
    chatListContent: {
        padding: 15,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 12,
        borderRadius: 20,
        marginVertical: 5,
        flexDirection: 'row',
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
    },
    userMessage: {
        backgroundColor: '#5d5555',
        alignSelf: 'flex-end',
        borderTopRightRadius: 4,
    },
    botMessage: {
        backgroundColor: '#FFFFFF',
        alignSelf: 'flex-start',
        borderTopLeftRadius: 4,
    },
    errorMessage: {
        backgroundColor: '#FFE5E5',
    },
    botIcon: {
        marginRight: 8,
    },
    messageText: {
        color: '#FFFFFF',
        fontSize: 16,
        lineHeight: 22,
        flex: 1,
        flexWrap: 'wrap',
    },
    botMessageText: {
        color: '#333333',
    },
    errorText: {
        color: '#DC3545',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    loadingText: {
        marginLeft: 10,
        color: '#666',
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E9ECEF',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 10,
        maxHeight: 100,
        fontSize: 16,
        color: '#333',
    },
    sendButton: {
        backgroundColor: '#007AFF',
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sendButtonDisabled: {
        backgroundColor: '#B0B0B0',
        shadowOpacity: 0,
        elevation: 0,
    },
});

export default ChatBotScreen;
