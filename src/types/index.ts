// Authentication Types
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'driver' | 'rider';
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
  phone: string;
  role: 'driver' | 'rider';
}

export interface AuthResponse {
  user: AuthUser;
  token: {
    accessToken: string;
    expiresIn: number;
  };
  refreshToken?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

// Driver Types
export interface Driver extends AuthUser {
  role: 'driver';
  licenseNumber: string;
  licenseExpiry: string;
  carType: string;
  licensePlate: string;
  carColor: string;
  isActive: boolean;
  rating: number;
  totalRides: number;
}

// Rider Types
export interface Rider extends AuthUser {
  role: 'rider';
  paymentMethod?: string;
  favoriteLocations?: Location[];
  rating: number;
  totalRides: number;
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface LocationAddress {
  address: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

// Ride Types
export enum RideStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DRIVER_ARRIVING = 'driver_arriving',
  DRIVER_ARRIVED = 'driver_arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Ride {
  id: string;
  riderId: string;
  driverId?: string;
  pickupLocation: LocationAddress;
  dropoffLocation: LocationAddress;
  estimatedDistance: number; // in km
  estimatedDuration: number; // in minutes
  estimatedFare: number; // in currency units
  actualDistance?: number;
  actualDuration?: number;
  actualFare?: number;
  status: RideStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  riderRating?: number;
  driverRating?: number;
  riderReview?: string;
  driverReview?: string;
}

export interface RideRequest {
  pickupLocation: LocationAddress;
  dropoffLocation: LocationAddress;
  scheduleTime?: Date;
  rideType?: 'regular' | 'premium';
}

// Map Types
export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface RouteInfo {
  distance: number; // in km
  duration: number; // in minutes
  points: MapCoordinate[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  DriverHome: undefined;
  RiderHome: undefined;
  RideDetail: { rideId: string };
  DriverProfile: undefined;
  RiderProfile: undefined;
  Settings: undefined;
};

export type DriverStackParamList = {
  DriverHome: undefined;
  RideDetail: { rideId: string };
  DriverProfile: undefined;
  Settings: undefined;
};

export type RiderStackParamList = {
  RiderHome: undefined;
  RideDetail: { rideId: string };
  RideHistory: undefined;
  RiderProfile: undefined;
  Settings: undefined;
};
