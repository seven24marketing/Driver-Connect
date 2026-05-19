import { Platform, PermissionsAndroid } from 'react-native';
import { check, PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import NetInfo from '@react-native-community/netinfo';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface LocationError {
  code: string;
  message: string;
}

export type LocationCallback = (location: Location) => void;
export type LocationErrorCallback = (error: LocationError) => void;

/**
 * Unified Location Service
 * Handles GPS tracking, permissions, and geolocation for both Android & iOS
 * Extracted best practices from Driverconnect-draft
 */
class LocationService {
  private watchId: number | null = null;
  private isWatching = false;
  private updateInterval = 5000; // 5 seconds

  /**
   * Request location permissions based on platform
   */
  async requestLocationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        return await this.requestAndroidPermission();
      } else if (Platform.OS === 'ios') {
        return await this.requestiOSPermission();
      }
      return false;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  /**
   * Android-specific permission handling
   */
  private async requestAndroidPermission(): Promise<boolean> {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'DriverConnect Location Permission',
          message:
            'DriverConnect needs access to your location to provide ride services.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Android location permission granted');
        return true;
      } else {
        console.log('Android location permission denied');
        return false;
      }
    } catch (err) {
      console.error('Android permission request failed:', err);
      return false;
    }
  }

  /**
   * iOS-specific permission handling
   */
  private async requestiOSPermission(): Promise<boolean> {
    try {
      const result = await Geolocation.requestAuthorization();
      const granted = result === 'granted';
      console.log(`iOS location permission: ${result}`);
      return granted;
    } catch (err) {
      console.error('iOS permission request failed:', err);
      return false;
    }
  }

  /**
   * Check current location permission status
   */
  async checkLocationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        return result === RESULTS.GRANTED;
      } else if (Platform.OS === 'ios') {
        const result = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        return result === RESULTS.GRANTED;
      }
      return false;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  /**
   * Get current location once
   */
  async getCurrentLocation(): Promise<Location | null> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          resolve({
            latitude,
            longitude,
            accuracy,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          console.error('getCurrentLocation error:', error);
          reject({
            code: error.code,
            message: error.message,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  /**
   * Start real-time location tracking
   */
  startWatching(
    onLocationUpdate: LocationCallback,
    onError?: LocationErrorCallback
  ): void {
    if (this.isWatching) {
      console.warn('Location watching already active');
      return;
    }

    this.watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        onLocationUpdate({
          latitude,
          longitude,
          accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        console.error('Watch position error:', error);
        if (onError) {
          onError({
            code: error.code,
            message: error.message,
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: this.updateInterval,
        distanceFilter: 10, // Update when moved 10 meters
      }
    );

    this.isWatching = true;
    console.log('Location watching started');
  }

  /**
   * Stop real-time location tracking
   */
  stopWatching(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isWatching = false;
      console.log('Location watching stopped');
    }
  }

  /**
   * Check network connectivity
   */
  async isNetworkConnected(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? false;
    } catch (error) {
      console.error('Network check error:', error);
      return false;
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get current watching status
   */
  isLocationWatching(): boolean {
    return this.isWatching;
  }

  /**
   * Set update interval for location tracking
   */
  setUpdateInterval(intervalMs: number): void {
    this.updateInterval = intervalMs;
  }
}

export default new LocationService();
