import { View, Text, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Login = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secure, setSecure] = useState(true);
    const [rememberMe, setRememberMe] = useState(false);


    const handleLogin = async () => {
        try {
            const response = await fetch('http://192.168.1.102:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                await AsyncStorage.setItem('accessToken', data.access_token);
                // Optionally, update global auth state here
                console.log('Logged In');
                navigation.navigate('UserDashboard');
            } else {
                console.log('Login failed:', data.detail);
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    return (
        <View className="flex-1 justify-center items-left bg-white px-6">
            <Text className="text-black text-2xl font-bold mb-1">Hi, Welcome Back! 👋</Text>
            <Text className="text-gray-500 mb-6">Hello again, you’ve been missed!</Text>
            
            <Text className="text-purple-600 font-medium mb-1">Email</Text>
            <TextInput
                className="border border-gray-300 rounded-md px-4 py-3 w-90 mb-4 text-lg h-12 leading-normal"
                placeholder="Please Enter Your Email"
                onChangeText={setEmail}
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            
            <Text className="text-purple-600 font-medium mb-1">Password</Text>
            <View className="border border-gray-300 rounded-md flex-row items-center px-4 py-3 w-90 h-12 mb-2">
                <TextInput
                    className="flex-1 text-lg leading-normal"
                    placeholder="Please Enter Your Password"
                    secureTextEntry={secure}
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setSecure(!secure)}>
                    <Ionicons name={secure ? "eye-off" : "eye"} size={20} color="gray" />
                </TouchableOpacity>
            </View>

            <View className="flex-row justify-between w-90 mb-4">
                <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} className="flex-row items-center">
                    <Ionicons name={rememberMe ? "checkbox" : "square-outline"} size={20} color="black" />
                    <Text className="ml-2 text-gray-700">Remember Me</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text className="text-red-500">Forgot Password</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity className="bg-purple-600 w-90 h-12 rounded-md flex items-center justify-center mb-4"
            onPress={handleLogin}>
                <Text className="text-white text-lg font-bold">Login</Text>
            </TouchableOpacity>

            <View className='flex-row justify-center items-center w-90 mt-6 mb-6'>
                <Text className="text-gray-600">Don’t have an account?</Text>
                <TouchableOpacity onPress={()=>navigation.navigate('Signup')}>
                    <Text className="text-purple-600 ml-2 font-bold"> Sign Up </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default Login;
