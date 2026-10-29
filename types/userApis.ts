export interface Location {
  address: string | null;
  type: string;
  coordinates: number[];
  radiusInKm: number | null;
}

/** A populated reference. The API sends an id string when it is not populated. */
export interface NamedRef {
  _id: string;
  name: string;
}

export type MaybeRef = NamedRef | string | null;

export interface User {
  location: Location | null;
  locationScope: string | null;
  _id: string;
  fullName: string;
  email: string;
  profession: MaybeRef;
  licenseNo: string | null;
  governingBody: MaybeRef;
  expertise: MaybeRef[];
  phone: string | null;
  bio: string | null;
  country: string | null;
  province: string | null;
  city: string | null;
  workAt: string | null;
  role: string;
  profileImage: string | null;
  isPremium: boolean;
  isBlocked: boolean;
  verifyCode: number;
  isVerified: boolean;
  isResetVerified: boolean;
  codeExpireIn: string;
  isActive: boolean;
  isDeleted: boolean;
  playerIds: string[];
  totalPost?: number;
  createdAt: string;
  updatedAt: string;
  joined?: string;
}
