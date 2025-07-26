import { useEffect } from 'react';
import { Platform } from 'react-native';

export function useFrameworkReady() {
  useEffect(() => {
    // Only call window.frameworkReady on web platform
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.frameworkReady?.();
    }
  });
}
