import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { ChevronLeft, UserPlus, Eye, EyeOff } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useRegister } from "@/hooks/useRegister";
import Toast from "react-native-toast-message";

export default function RegisterScreen() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    instituteId: "",
    rollNo: "",
    password: "",
    confirmPassword: "",
  });

  const { mutate, isPending } = useRegister();

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const { password, confirmPassword, firstName, instituteId, rollNo } = formData;

    // Basic Validation
    if (!firstName || !instituteId || !rollNo || !password) {
      return Toast.show({ type: "error", text1: "Please fill all required fields" });
    }

    if (password !== confirmPassword) {
      return Toast.show({ type: "error", text1: "Passwords do not match" });
    }

    // Pass the combined data to your hook
    mutate(formData as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f6f6f8] dark:bg-[#101622]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {/* Top Bar */}
          <View className="flex-row items-center justify-between px-4 py-4">
            <TouchableOpacity className="p-2" onPress={() => router.back()}>
              <ChevronLeft color="#111318" size={28} />
            </TouchableOpacity>
            <Text className="text-[#111318] dark:text-white text-lg font-bold flex-1 text-center pr-10">
              Create Account
            </Text>
          </View>

          {/* Headline */}
          <View className="px-6 pt-4 pb-2">
            <Text className="text-[#111318] dark:text-white text-3xl font-extrabold text-center">
              Join Us
            </Text>
            <Text className="text-slate-500 dark:text-slate-300 text-base text-center mt-2">
              Set up your profile to start tracking attendance
            </Text>
          </View>

          {/* Form Section */}
          <View className="px-4 gap-y-4 pt-4">
            
            {/* Name Row */}
            <View className="flex-row gap-x-2">
              <View className="flex-1">
                <Text className="text-[#111318] dark:text-white text-sm font-medium mb-1">First Name</Text>
                <TextInput
                  placeholder="John"
                  className="h-12 bg-white dark:bg-slate-800 border border-[#dbdfe6] rounded-xl px-4"
                  onChangeText={(v) => handleInputChange("firstName", v)}
                />
              </View>
              <View className="flex-1">
                <Text className="text-[#111318] dark:text-white text-sm font-medium mb-1">Last Name</Text>
                <TextInput
                  placeholder="Doe"
                  className="h-12 bg-white dark:bg-slate-800 border border-[#dbdfe6] rounded-xl px-4"
                  onChangeText={(v) => handleInputChange("lastName", v)}
                />
              </View>
            </View>

            {/* Institute ID & Roll No Row */}
            <View className="flex-row gap-x-2">
              <View className="flex-1">
                <Text className="text-[#111318] dark:text-white text-sm font-medium mb-1">Institute ID</Text>
                <TextInput
                  placeholder="e.g. 23CS01"
                  autoCapitalize="characters"
                  className="h-12 bg-white dark:bg-slate-800 border border-[#dbdfe6] rounded-xl px-4"
                  onChangeText={(v) => handleInputChange("instituteId", v)}
                />
              </View>
              <View className="flex-1">
                <Text className="text-[#111318] dark:text-white text-sm font-medium mb-1">Roll No</Text>
                <TextInput
                  placeholder="23BT100XX"
                  className="h-12 bg-white dark:bg-slate-800 border border-[#dbdfe6] rounded-xl px-4"
                  onChangeText={(v) => handleInputChange("rollNo", v)}
                />
              </View>
            </View>

            {/* Password */}
            <View>
              <Text className="text-[#111318] dark:text-white text-sm font-medium mb-1">Password</Text>
              <View className="relative flex-row items-center">
                <TextInput
                  placeholder="Create a password"
                  secureTextEntry={!passwordVisible}
                  className="w-full h-12 bg-white dark:bg-slate-800 border border-[#dbdfe6] rounded-xl px-4 pr-12"
                  onChangeText={(v) => handleInputChange("password", v)}
                />
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} className="absolute right-4">
                  {passwordVisible ? <EyeOff size={20} color="#616f89" /> : <Eye size={20} color="#616f89" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View>
              <Text className="text-[#111318] dark:text-white text-sm font-medium mb-1">Confirm Password</Text>
              <TextInput
                placeholder="Repeat password"
                secureTextEntry={!passwordVisible}
                className="w-full h-12 bg-white dark:bg-slate-800 border border-[#dbdfe6] rounded-xl px-4"
                onChangeText={(v) => handleInputChange("confirmPassword", v)}
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isPending}
              className={`w-full ${isPending ? 'bg-slate-400' : 'bg-[#135bec]'} h-14 rounded-xl flex-row items-center justify-center shadow-lg mt-4`}
              onPress={handleSubmit}
            >
              <Text className="text-white font-bold text-lg mr-2">
                {isPending ? "Registering..." : "Sign Up"}
              </Text>
              <UserPlus size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View className="py-10 items-center">
            <View className="flex-row">
              <Text className="text-[#616f89] text-sm">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text className="text-[#135bec] text-sm font-bold">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}