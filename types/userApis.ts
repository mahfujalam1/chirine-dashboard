export interface Location {
  address: string | null;
  type: string;
  coordinates: number[];
  radiusInKm: number | null;
}

export interface User {
  location: Location;
  _id: string;
  fullName: string;
  email: string;
  profession: string;
  licenseNo: string;
  governingBody: string;
  phone: string;
  bio: string;
  country: string;
  city: string;
  role: string;
  profileImage: string;
  isPremium: boolean;
  isBlocked: boolean;
  verifyCode: number;
  isVerified: boolean;
  isResetVerified: boolean;
  codeExpireIn: string;
  isActive: boolean;
  isDeleted: boolean;
  playerIds: string[];
  createdAt: string;
  updatedAt: string;
}