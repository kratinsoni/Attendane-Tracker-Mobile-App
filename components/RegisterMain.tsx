import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
// Added Eye and EyeOff icons
import { ChevronLeft, CheckCircle, Eye, EyeOff } from "lucide-react-native"; 
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useRegister } from "@/hooks/useRegister";

export default function RegisterMain() {
  const { instituteId } = useLocalSearchParams();
  
  // 1. Add states to track visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    rollNo: "",
    password: "",
    confirmPassword: "",
  });

  const { mutate, isPending } = useRegister();

  const handleRegister = () => {
    mutate({ ...form, instituteId: instituteId as string });
  };

  // 2. Updated InputField to support visibility toggle
  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    isPassword = false, 
    isVisible = false, 
    onToggleVisibility 
  }: any) => (
    <View className="mb-4">
      <Text className="text-[#111318] dark:text-white text-sm font-semibold mb-2">{label}</Text>
      <View className="relative flex-row items-center">
        <TextInput
          className="w-full h-14 bg-white dark:bg-slate-800 border border-[#dbdfe6] dark:border-slate-700 rounded-xl px-4 pr-12 text-[#111318] dark:text-white"
          value={value}
          onChangeText={onChangeText}
          // If it's a password field, use visibility state, otherwise false
          secureTextEntry={isPassword ? !isVisible : false}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#616f89"
        />
        
        {/* 3. The Toggle Icon Button */}
        {isPassword && (
          <TouchableOpacity 
            onPress={onToggleVisibility}
            className="absolute right-4 h-full justify-center"
          >
            {isVisible ? (
              <EyeOff size={20} color="#616f89" />
            ) : (
              <Eye size={20} color="#616f89" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f6f6f8] dark:bg-[#101622]">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ChevronLeft color="#111318" size={28} />
          </TouchableOpacity>
          <Text className="text-[#111318] dark:text-white text-lg font-bold flex-1 text-center pr-10">Complete Profile</Text>
        </View>

        <View className="mx-4 mb-6 p-4 bg-blue-50 dark:bg-slate-800 rounded-2xl flex-row items-center justify-between border border-blue-100 dark:border-slate-700">
          <View>
            <Text className="text-slate-500 text-xs uppercase font-bold tracking-wider">Registering for ID</Text>
            <Text className="text-[#135bec] text-xl font-bold">{instituteId}</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-[#135bec] font-semibold">Change</Text>
          </TouchableOpacity>
        </View>

        <View className="px-4">
          <View className="flex-row gap-x-4">
            <View className="flex-1">
              <InputField label="First Name" value={form.firstName} onChangeText={(t: string) => setForm({...form, firstName: t})} />
            </View>
            <View className="flex-1">
              <InputField label="Last Name" value={form.lastName} onChangeText={(t: string) => setForm({...form, lastName: t})} />
            </View>
          </View>
          
          <InputField label="Roll Number" value={form.rollNo} onChangeText={(t: string) => setForm({...form, rollNo: t})} />

          {/* 4. Pass the new props for Password Fields */}
          <InputField 
            label="Password" 
            value={form.password} 
            onChangeText={(t: string) => setForm({...form, password: t})} 
            isPassword={true}
            isVisible={showPassword}
            onToggleVisibility={() => setShowPassword(!showPassword)}
          />

          <InputField 
            label="Confirm Password" 
            value={form.confirmPassword} 
            onChangeText={(t: string) => setForm({...form, confirmPassword: t})} 
            isPassword={true}
            isVisible={showConfirmPassword}
            onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isPending}
            activeOpacity={0.8}
            className={`w-full ${isPending ? 'bg-slate-400' : 'bg-[#135bec]'} h-14 rounded-xl flex-row items-center justify-center shadow-lg mt-6 mb-10`}
          >
            <Text className="text-white font-bold text-lg mr-2">
                {isPending ? "Creating Account..." : "Create Account"}
            </Text>
            <CheckCircle size={20} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}