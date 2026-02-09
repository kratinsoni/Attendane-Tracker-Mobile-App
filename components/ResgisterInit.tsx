import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { ChevronLeft, ArrowRight, ShieldCheck, Edit2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useRegisterInit } from "@/hooks/useRegisterInit";
import { useVerifyOtp } from "@/hooks/useVerifyOtp";

const RESEND_TIMER_SECONDS = 30;

export default function RegisterInit() {
  const [instituteId, setInstituteId] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"ID_ENTRY" | "OTP_ENTRY">("ID_ENTRY");
  const [secondsLeft, setSecondsLeft] = useState(0);
  
  // Track the ID that actually triggered the successful API call
  const [lastSentId, setLastSentId] = useState("");

  const { mutate: initReg, isPending: isInitPending } = useRegisterInit();
  const { mutate: verifyOtp, isPending: isVerifyPending } = useVerifyOtp();

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const handleContinue = () => {
    const trimmedId = instituteId.trim();

    if (step === "ID_ENTRY") {
      // --- BYPASS PREVENTION LOGIC ---
      // If the ID is the same as the last successful send AND timer is still ticking
      if (trimmedId === lastSentId && secondsLeft > 0) {
        setStep("OTP_ENTRY"); // Just switch the UI
        return; // STOP execution here so initReg is NOT called
      }

      // If ID is different or timer is 0, proceed with API call
      initReg(trimmedId, {
        onSuccess: () => {
          setStep("OTP_ENTRY");
          setLastSentId(trimmedId); 
          setSecondsLeft(RESEND_TIMER_SECONDS);
        },
      });
    } else {
      // OTP Verification Step
      if (otp.length < 6) return; 
      verifyOtp({ instituteId: trimmedId, otp });
    }
  };

  const handleResend = () => {
    if (secondsLeft > 0 || isInitPending) return;
    
    setOtp(""); 
    initReg(instituteId.trim(), {
      onSuccess: () => {
        setLastSentId(instituteId.trim());
        setSecondsLeft(RESEND_TIMER_SECONDS);
      },
    });
  };

  const isButtonLoading = isInitPending || isVerifyPending;
  const isBypassing = step === "ID_ENTRY" && instituteId.trim() === lastSentId && secondsLeft > 0;

  return (
    <SafeAreaView className="flex-1 bg-[#f6f6f8] dark:bg-[#101622]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header */}
          <View className="flex-row items-center px-4 py-4">
            <TouchableOpacity 
              onPress={() => step === "OTP_ENTRY" ? setStep("ID_ENTRY") : router.back()} 
              className="p-2 w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm"
            >
              <ChevronLeft color="#111318" size={24} />
            </TouchableOpacity>
            <Text className="text-[#111318] dark:text-white text-lg font-bold flex-1 text-center pr-10">
              {step === "ID_ENTRY" ? "Registration" : "Verification"}
            </Text>
          </View>

          {/* Icon Area */}
          <View className="items-center pt-10">
            <View className="w-24 h-24 rounded-3xl bg-blue-50 dark:bg-blue-900/20 items-center justify-center">
              <ShieldCheck size={48} color="#135bec" />
            </View>
          </View>

          {/* Headline */}
          <View className="px-6 pt-8 pb-4">
            <Text className="text-[#111318] dark:text-white text-3xl font-extrabold text-center">
              {step === "ID_ENTRY" ? "Identify Yourself" : "Check Your Email"}
            </Text>
            <Text className="text-slate-500 dark:text-slate-400 text-base text-center mt-3 px-4">
              {step === "ID_ENTRY" 
                ? "Enter your Institute Mail ID to receive a verification code."
                : `We've sent a 6-digit code to the email associated with ${instituteId}`}
            </Text>
          </View>

          <View className="px-4 pt-6">
            {/* Institute ID Box */}
            <View className="mb-4">
              <View className="flex-row justify-between items-end mb-2">
                <Text className="text-[#111318] dark:text-white text-base font-medium">Institute Mail ID</Text>
                {step === "OTP_ENTRY" && (
                  <TouchableOpacity 
                    onPress={() => setStep("ID_ENTRY")} 
                    className="flex-row items-center"
                  >
                    <Edit2 size={14} color="#135bec" />
                    <Text className="text-[#135bec] text-sm font-bold ml-1">Change</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                placeholder="e.g. example@kgpian.iitkgp.ac.in"
                placeholderTextColor="#616f89"
                autoCapitalize="none"
                editable={step === "ID_ENTRY" && !isButtonLoading}
                className={`w-full h-14 border rounded-xl px-4 text-[#111318] dark:text-white ${
                  step === "OTP_ENTRY" 
                    ? "bg-slate-100 dark:bg-slate-900 border-transparent opacity-70" 
                    : "bg-white dark:bg-slate-800 border-[#dbdfe6] dark:border-slate-700"
                }`}
                value={instituteId}
                onChangeText={setInstituteId}
              />
            </View>

            {/* OTP Input Section */}
            {step === "OTP_ENTRY" && (
              <View className="mt-2">
                <Text className="text-[#111318] dark:text-white text-base font-medium mb-2">
                  Verification Code
                </Text>
                <TextInput
                  placeholder="000000"
                  placeholderTextColor="#616f89"
                  keyboardType="number-pad"
                  maxLength={6}
                  className="w-full h-14 bg-white dark:bg-slate-800 border border-[#135bec] rounded-xl px-4 text-[#111318] dark:text-white text-center text-2xl tracking-[12px] font-bold"
                  value={otp}
                  onChangeText={setOtp}
                  autoFocus={true}
                />
                
                <TouchableOpacity 
                  onPress={handleResend}
                  disabled={secondsLeft > 0 || isInitPending}
                  className="mt-4 self-center"
                >
                  <Text className={`text-sm ${secondsLeft > 0 ? 'text-slate-400' : 'text-slate-500'}`}>
                    {`Didn't receive code? `}
                    {secondsLeft > 0 ? (
                      <Text className="text-slate-400 font-medium">Resend in {secondsLeft}s</Text>
                    ) : (
                      <Text className="text-[#135bec] font-bold">Resend</Text>
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Action Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isButtonLoading || !instituteId.trim() || (step === "OTP_ENTRY" && otp.length < 6)}
              onPress={handleContinue}
              className={`w-full h-14 rounded-xl flex-row items-center justify-center shadow-lg mt-8 ${
                isButtonLoading || !instituteId.trim() || (step === "OTP_ENTRY" && otp.length < 6) 
                  ? "bg-slate-300 dark:bg-slate-700" 
                  : "bg-[#135bec]"
              }`}
            >
              {isButtonLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white font-bold text-lg mr-2">
                    {step === "ID_ENTRY" 
                      ? (isBypassing ? "Continue to OTP" : "Send Code") 
                      : "Verify & Proceed"}
                  </Text>
                  <ArrowRight size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}