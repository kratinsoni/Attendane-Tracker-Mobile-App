import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef } from 'react';
import { SOUND_DICTIONARY } from "@/constants/sound_dict"; 

export const useAttendanceSounds = () => {
  // Store the preloaded sound objects in memory
  const soundsRef = useRef<Record<string, Audio.Sound>>({});
  const isEnabledRef = useRef<boolean>(true);

  const loadSounds = useCallback(async () => {
    // 1. Check master switch
    const enabledState = await AsyncStorage.getItem('sounds_enabled');
    isEnabledRef.current = enabledState !== 'false';

    if (!isEnabledRef.current) return;

    // 2. Unload existing sounds to prevent memory leaks
    for (const key in soundsRef.current) {
      await soundsRef.current[key].unloadAsync();
    }
    soundsRef.current = {};

    // 3. Preload the user's preferred sounds
    const statuses = ['PRESENT', 'ABSENT', 'MEDICAL', 'CANCELLED'];
    
    for (const status of statuses) {
      const savedSoundId = await AsyncStorage.getItem(`sound_pref_${status}`);
      const options = SOUND_DICTIONARY[status];
      
      if (options && options.length > 0) {
        let fileToLoad = options[0].file; 
        
        if (savedSoundId) {
          const selected = options.find(o => o.id === savedSoundId);
          if (selected) fileToLoad = selected.file;
        }

        try {
          // Load it into memory NOW, not when the user clicks
          const { sound } = await Audio.Sound.createAsync(fileToLoad);
          soundsRef.current[status] = sound;
        } catch (error) {
          console.error(`Failed to preload ${status} sound`, error);
        }
      }
    }
  }, []);

  // Run the loader when the hook is first used
  useEffect(() => {
    loadSounds();

    // Cleanup audio memory when leaving the screen
    return () => {
      for (const key in soundsRef.current) {
        soundsRef.current[key].unloadAsync();
      }
    };
  }, [loadSounds]);

  const playSound = useCallback(async (status: string) => {
    if (!isEnabledRef.current) return;
    
    const sound = soundsRef.current[status.toUpperCase()];
    if (sound) {
      try {
        // replayAsync is practically instantaneous as the file is already in memory
        await sound.replayAsync(); 
      } catch (error) {
        console.error(`Error playing preloaded sound for ${status}:`, error);
      }
    }
  }, []);

  return { playSound, reloadSounds: loadSounds };
};