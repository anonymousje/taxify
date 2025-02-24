import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Signup = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secure, setSecure] = useState(true);
    const [rememberMe, setRememberMe] = useState(false);

    return (
        <View className="flex-1 justify-center bg-white px-6">
            <Text className="text-black text-2xl font-bold mb-6">Create an account</Text>
            
            <Text className="text-purple-600 font-medium mb-1">Email Address</Text>
            <TextInput
                className="border border-gray-300 rounded-md px-4 py-3 w-90 mb-4 text-lg h-12"
                placeholder="Enter your email"
                onChangeText={setEmail}
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            
            <Text className="text-purple-600 font-medium mb-1">Password</Text>
            <View className="border border-gray-300 rounded-md flex-row items-center px-4 py-3 w-90 h-12 mb-4">
                <TextInput
                    className="flex-1 text-lg"
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

            <TouchableOpacity className="bg-purple-600 w-90 h-12 rounded-md flex items-center justify-center mb-4">
                <Text className="text-white text-lg font-bold">Sign Up</Text>
            </TouchableOpacity>


            <View className='flex-row justify-center items-center w-90 mt-6'>
                <Text className="text-gray-600">Already have an account?</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-purple-600 ml-2 font-bold">Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default Signup;