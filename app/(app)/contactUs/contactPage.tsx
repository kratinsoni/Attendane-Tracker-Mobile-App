import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  StatusBar, 
  Vibration, 
  Linking, 
  FlatList, 
  Dimensions,
  ImageSourcePropType,
  ViewToken
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Mail, AtSign, ChevronRight, ChevronLeft, Linkedin } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { router } from 'expo-router';

// Get screen width for carousel calculations
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.8; // Cards take up 80% of screen width
const SPACING = 16; // Gap between cards

// Define the interface for a team member
interface TeamMemberData {
  id: string;
  name: string;
  role: string;
  handle: string;
  linkedin: string;
  email: string;
  imageUri: ImageSourcePropType;
}

// Interface for the infinite looped items to ensure unique keys
interface LoopedTeamMember extends TeamMemberData {
  uniqueId: string;
}

// 1. Extract data to easily map, shuffle, and manage it
const INITIAL_TEAM_DATA: TeamMemberData[] = [
  {
    id: '1',
    name: "Harshit Soni",
    role: "Lead Developer",
    handle: "harshit_soni_1010",
    linkedin: "https://www.linkedin.com/in/harshit-soni-70336229a",
    email: "sonikratin@kgpian.iitkgp.ac.in",
    imageUri: require("../../../assets/images/Harshit-Photo.png")
  },
  {
    id: '2',
    name: "Tarun Mundhra",
    role: "Lead Developer",
    handle: "mundhra.tarun",
    linkedin: "https://www.linkedin.com/in/tarun-mundhra-0a0a5629a",
    email: "tarun.mundhara@kgpian.iitkgp.ac.in",
    imageUri: require("../../../assets/images/Tarun-Photo.png")
  },
  {
    id: '3',
    name: "Adarsh Kumar Singh",
    role: "Lead Developer",
    handle: "_",
    linkedin: "https://www.linkedin.com/in/adarsh-kumar-singh-21954331a",
    email: "kumaradarshsingh131@kgpian.iitkgp.ac.in",
    imageUri: require("../../../assets/images/user.png")
  }
];

const TeamMember: React.FC<TeamMemberData> = ({ name, role, handle, linkedin, email, imageUri }) => {
  const openUrl = async (url: string): Promise<void> => {
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
    <View style={{ width: CARD_WIDTH }} className="bg-white dark:bg-slate-900/50 p-4 rounded-xl shadow-sm border border-primary/20 flex-row items-center">
      <View className="w-20 h-20 rounded-lg overflow-hidden bg-primary/20">
        <Image
          source={imageUri}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
      <View className="flex-1 ml-4">
        <Text className="text-primary text-[10px] font-bold uppercase tracking-wider">{role}</Text>
        <Text className="text-lg font-bold text-slate-900 dark:text-white" numberOfLines={1}>{name}</Text>
        <View className="mt-1">
          {/* Instagram Handle */}
          <TouchableOpacity
            className="flex-row items-center gap-1 mb-1"
            onPress={() => openUrl(`https://instagram.com/${handle.replace('@', '')}`)}
          >
            <AtSign size={14} color="#64748b" />
            <Text className="text-sm text-slate-500" numberOfLines={1}>{handle}</Text>
          </TouchableOpacity>

          {/* LinkedIn Handle */}
          <TouchableOpacity
            className="flex-row items-center gap-1 mb-1"
            onPress={() => openUrl(`${linkedin}`)}
          >
            <Linkedin size={14} color="#64748b" />
            <Text className="text-sm text-slate-500" numberOfLines={1}>{linkedin.split('/').at(-1)}</Text>
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

// 2. Carousel Component with Infinite Looping
const MULTIPLIER = 200; // Multiplies array to create an "infinite" scroll illusion
const ITEM_COUNT = INITIAL_TEAM_DATA.length;
const INITIAL_INDEX = Math.floor(MULTIPLIER / 2) * ITEM_COUNT; // Start exactly in the middle

const TeamCarousel: React.FC = () => {
  const [teamData, setTeamData] = useState<LoopedTeamMember[]>([]);
  const flatListRef = useRef<FlatList<LoopedTeamMember>>(null);
  const currentIndexRef = useRef<number>(INITIAL_INDEX);
  
  // Using ReturnType ensures it works across Node and Browser environments seamlessly
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Helper function to start or restart the auto-swipe timer
  const startAutoSwipe = (): void => {
    // Clear any existing timer first to avoid overlapping intervals
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      if (teamData.length === 0) return;

      currentIndexRef.current += 1;
      
      // Safety net: silently jump back to the center if we get dangerously close to the end
      if (currentIndexRef.current >= teamData.length - ITEM_COUNT) {
        currentIndexRef.current = INITIAL_INDEX;
        flatListRef.current?.scrollToIndex({ index: currentIndexRef.current, animated: false });
        return;
      }
      
      flatListRef.current?.scrollToIndex({
        index: currentIndexRef.current,
        animated: true,
      });
    }, 2000);
  };

  // Generate randomized, looped data on mount
  useEffect(() => {
    const shuffled = [...INITIAL_TEAM_DATA].sort(() => Math.random() - 0.5);
    const loopedData: LoopedTeamMember[] = [];
    
    for (let i = 0; i < MULTIPLIER; i++) {
      shuffled.forEach((item) => {
        loopedData.push({ ...item, uniqueId: `${item.id}-${i}` });
      });
    }
    
    setTeamData(loopedData);
  }, []);

  // Initialize auto-swipe when data is ready
  useEffect(() => {
    if (teamData.length > 0) {
      startAutoSwipe();
    }

    // Cleanup interval on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [teamData]);

  // Track manual swipes
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      currentIndexRef.current = viewableItems[0].index;
    }
  }).current;

  // Replaced `any` with `ArrayLike<LoopedTeamMember> | null | undefined` for strict typing
  const getItemLayout = (
    data: ArrayLike<LoopedTeamMember> | null | undefined, 
    index: number
  ) => ({
    length: CARD_WIDTH + SPACING,
    offset: (CARD_WIDTH + SPACING) * index,
    index,
  });

  if (teamData.length === 0) return null;

  return (
    <FlatList
      ref={flatListRef}
      data={teamData}
      horizontal
      showsHorizontalScrollIndicator={false}
      initialScrollIndex={INITIAL_INDEX}
      getItemLayout={getItemLayout}
      snapToInterval={CARD_WIDTH + SPACING}
      disableIntervalMomentum={true} 
      decelerationRate="fast"
      contentContainerStyle={{
        paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
        paddingBottom: 20
      }}
      ItemSeparatorComponent={() => <View style={{ width: SPACING }} />}
      keyExtractor={(item) => item.uniqueId}
      renderItem={({ item }) => <TeamMember {...item} />}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      
      // Stop timer when user touches and starts dragging
      onScrollBeginDrag={() => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }}
      
      // Restart timer when the manual swipe momentum finishes
      onMomentumScrollEnd={() => {
        startAutoSwipe();
      }}
    />
  );
};

export default function KGPPresence(): React.JSX.Element {
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* About Section */}
        <View className="px-4 pt-8 pb-6">
          <View className="self-start px-3 py-1 rounded-full bg-primary/10 mb-2">
            <Text className="text-primary text-[10px] font-semibold uppercase tracking-widest">Our Mission</Text>
          </View>
          <Text className="text-3xl font-extrabold mb-4 text-slate-900 dark:text-white">About KGP Presence</Text>
          <Text className="text-slate-600 dark:text-slate-400 leading-6 text-lg">
            The Attendance-Tracker is built exclusively for IIT Kharagpur students to Keep Track of Their Classes in Our academic curriculum. We make it easy to stay above mandatory ERP attendance thresholds by helping you log daily classes, calculate safe margins, and monitor your standing in real-time so you can focus on what matters.
          </Text>
        </View>

        {/* Team Section */}
        <View className="py-6">
          <View className="px-4 flex-row items-center gap-2 mb-6">
            <Users size={20} color="#0fbd2c" />
            <Text className="text-xl font-bold text-slate-900 dark:text-white">Meet the Team</Text>
          </View>

          {/* Render the new Carousel here */}
          <TeamCarousel />
        </View>

        {/* Contact Section */}
        <View className="px-4">
          <View className="bg-primary/5 rounded-2xl p-6 border border-primary/10 mb-8">
            <Text className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Get in touch</Text>
            <Text className="text-slate-600 dark:text-slate-400 mb-6">Have questions or feedback? We{`'`}d love to hear from you.</Text>

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
          </View>
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