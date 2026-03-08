import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StatusBar, Vibration, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MoreVertical, Users, Mail, AtSign, Globe, Camera, Share2, ChevronRight, ChevronLeft, Linkedin } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { router } from 'expo-router';

const TeamMember = ({ name, role, handle, linkedin, email, imageUri }: { name: string, role: string, handle: string, linkedin: string, email: string, imageUri: any }) => {

  const openUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Couldn't open URL:", error);
    }
  };

  return (
    <View className="bg-white dark:bg-slate-900/50 p-4 rounded-xl shadow-sm border border-primary/5 flex-row items-center mb-4">
      <View className="w-20 h-20 rounded-lg overflow-hidden bg-primary/20">
        <Image
          source={imageUri}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
      <View className="flex-1 ml-4">
        <Text className="text-primary text-[10px] font-bold uppercase tracking-wider">{role}</Text>
        <Text className="text-lg font-bold text-slate-900 dark:text-white">{name}</Text>
        <View className="mt-1">

          {/* Instagram Handle */}
          <TouchableOpacity
            className="flex-row items-center gap-1 mb-1"
            onPress={() => openUrl(`https://instagram.com/${handle.replace('@', '')}`)}
          >
            <AtSign size={14} color="#64748b" />
            <Text className="text-sm text-slate-500">{handle}</Text>
          </TouchableOpacity>

          {/* LinkedIn Handle */}
          <TouchableOpacity
            className="flex-row items-center gap-1 mb-1"
            onPress={() => openUrl(`${linkedin}`)}
          >
            <Linkedin size={14} color="#64748b" />
            <Text className="text-sm text-slate-500">{linkedin}</Text>
          </TouchableOpacity>

          {/* Email */}
          <TouchableOpacity
            className="flex-row items-center gap-1"
            onPress={() => openUrl(`mailto:${email}`)}
          >
            <Mail size={14} color="#64748b" />
            <Text className="text-sm text-slate-500" numberOfLines={1}>{email}</Text>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
};

export default function KGPPresence() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View className="px-4 py-4 flex-row items-center justify-between border-b border-primary/10 bg-background-light/80 dark:bg-background-dark/80">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="bg-primary/10 p-2 rounded-lg" onPress={() => {
            Vibration.vibrate(20)
            router.back();
          }}>
            <ChevronLeft size={20} color="#0fbd2c" />
          </TouchableOpacity>
          <Text className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">KGP Presence</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        {/* About Section */}
        <View className="pt-8 pb-6">
          <View className="self-start px-3 py-1 rounded-full bg-primary/10 mb-2">
            <Text className="text-primary text-[10px] font-semibold uppercase tracking-widest">Our Mission</Text>
          </View>
          <Text className="text-3xl font-extrabold mb-4 text-slate-900 dark:text-white">About KGP Presence</Text>
          <Text className="text-slate-600 dark:text-slate-400 leading-6 text-lg">
            The Attendance-Tracker is built exclusively for IIT Kharagpur students to Keep Track of Thier Classes in Our academic curriculum. We make it easy to stay above mandatory ERP attendance thresholds by helping you log daily classes, calculate safe margins, and monitor your standing in real-time so you can focus on what matters.
          </Text>
        </View>

        {/* Team Section */}
        <View className="py-6">
          <View className="flex-row items-center gap-2 mb-6">
            <Users size={20} color="#0fbd2c" />
            <Text className="text-xl font-bold text-slate-900 dark:text-white">Meet the Team</Text>
          </View>

          <TeamMember
            name="Harshit Soni"
            role="Lead Developer"
            handle="harshit_soni_1010"
            linkedin="https://www.linkedin.com/in/harshit-soni-70336229a"
            email="sonikratin@kgpian.iitkgp.ac.in"
            imageUri={require("../../../assets/images/Harshit-Photo.png")}
          />
          <TeamMember
            name="Tarun Mundhra"
            role="Developer"
            handle="mundhra.tarun"
            linkedin="https://www.linkedin.com/in/tarun-mundhra-0a0a5629a"
            email="tarun.mundhara@kgpian.iitkgp.ac.in"
            imageUri={require("../../../assets/images/Tarun-Photo.png")}
          />
          <TeamMember
            name="Adarsh Kumar Singh"
            role="Developer"
            handle="_"
            linkedin="https://www.linkedin.com/in/adarsh-kumar-singh-21954331a"
            email="kumaradarshsingh131@gmail.com"
            imageUri={require("../../../assets/images/user.png")}
          />
        </View>

        {/* Contact Section */}
        <View className="bg-primary/5 rounded-2xl p-6 border border-primary/10 mb-8">
          <Text className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Get in touch</Text>
          <Text className="text-slate-600 dark:text-slate-400 mb-6">Have questions or feedback? We&apos;d love to hear from you.</Text>

          <TouchableOpacity
            className="flex-row items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm"
            onPress={() => Linking.openURL('mailto:kgppresence@gmail.com')}
          >
            <View className="w-12 h-12 bg-primary items-center justify-center rounded-full">
              <Mail size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-semibold text-slate-500 uppercase">Primary Email</Text>
              <Text className="text-lg font-bold text-primary">kgppresence@gmail.com</Text>
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>

          {/* <View className="mt-8">
            <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Follow Us</Text>
            <View className="flex-row gap-4">
              {[Globe, Camera, Share2].map((Icon, index) => (
                <TouchableOpacity key={index} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 items-center justify-center">
                  <Icon size={20} color={isDark ? '#cbd5e1' : '#475569'} />
                </TouchableOpacity>
              ))}
            </View>
          </View> */}
        </View>

        {/* Footer */}
        <View className="pb-12 items-center">
          <Text className="text-slate-400 text-sm">© 2024 KGP Presence Attendance Tracker</Text>
          <Text className="text-slate-400 text-xs mt-1">Made for the academic excellence of the campus</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}