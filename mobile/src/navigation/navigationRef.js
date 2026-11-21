import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

const TAB_SCREENS = ['Home', 'Courses', 'Chat', 'Profile'];

/**
 * Navigate to any screen safely using the root NavigationContainer
 */
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    try {
      if (TAB_SCREENS.includes(name)) {
        navigationRef.navigate('MainTabs', {
          screen: name,
          params,
        });
      } else {
        navigationRef.navigate(name, params);
      }
    } catch (e) {
      console.warn('rootNavigate error:', e?.message);
    }
  }
}

/**
 * Go back safely using the root NavigationContainer
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

/**
 * Reset navigation stack to a specific screen/tabs
 */
export function resetRoot(state) {
  if (navigationRef.isReady()) {
    navigationRef.reset(state);
  }
}
