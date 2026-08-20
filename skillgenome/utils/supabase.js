import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// =========================================================================
// SkillGenome OS — Production Supabase Connection Configuration
// =========================================================================
// INSTRUCTIONS:
// 1. Log in to your project at https://supabase.com
// 2. Go to Project Settings -> API
// 3. Copy your "Project URL" and paste it in `SUPABASE_URL` below.
// 4. Copy your "anon public" API key and paste it in `SUPABASE_ANON_KEY` below.
// =========================================================================

const SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';

// Safe, resilient in-memory storage fallback to prevent native linking failures from crashing Expo Go
const memoryStore = {};
const resilientStorage = {
  getItem: async (key) => {
    try {
      const val = await AsyncStorage.getItem(key);
      return val;
    } catch (e) {
      console.warn("AsyncStorage.getItem native module error. Falling back to memory storage.", e.message);
      return memoryStore[key] || null;
    }
  },
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn("AsyncStorage.setItem native module error. Falling back to memory storage.", e.message);
      memoryStore[key] = value;
    }
  },
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn("AsyncStorage.removeItem native module error. Falling back to memory storage.", e.message);
      delete memoryStore[key];
    }
  }
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: resilientStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
