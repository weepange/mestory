import { CityId, PlaceCategoryId } from "../constants";

export type UserRole = "USER" | "BUSINESS" | "ADMIN";

export interface UserSummary {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string | null;
  isVerifiedCreator?: boolean;
  role: UserRole | string;
  cityId: string;
}

export interface UserProfile extends UserSummary {
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  interests: string[];
  followersCount: number;
  followingCount: number;
  collectionsCount: number;
  reviewsCount: number;
  createdAt: string;
}

export interface PlaceWorkingHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  text?: string;
}

export interface Place {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  category: PlaceCategoryId;
  cityId: CityId;
  address: string;
  lat: number;
  lng: number;
  workingHoursText: string;
  phone?: string;
  website?: string;
  telegram?: string;
  vk?: string;
  priceRange: "FREE" | "BUDGET" | "MODERATE" | "EXPENSIVE" | "LUXURY";
  averageCheck?: string;
  photos: string[];
  coverPhoto: string;
  tags: string[];
  rating: number;
  reviewsCount: number;
  savesCount: number;
  distanceMeters?: number;
  isOpenNow?: boolean;
  isVerifiedBusiness?: boolean;
  businessOwnerId?: string;
  authorNote?: {
    author: UserSummary;
    text: string;
  };
  createdAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: PlaceCategoryId;
  cityId: CityId;
  placeId?: string;
  placeName?: string;
  placeAddress?: string;
  lat: number;
  lng: number;
  startDateTime: string;
  endDateTime?: string;
  isFree: boolean;
  priceText: string;
  ticketUrl?: string;
  coverPhoto: string;
  tags: string[];
  savesCount: number;
  isSaved?: boolean;
  organizer: UserSummary;
  createdAt: string;
}

export interface StoryItem {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  placeId?: string;
  placeName?: string;
  placeCategory?: PlaceCategoryId;
  eventId?: string;
  eventTitle?: string;
  author: UserSummary;
  cityId: CityId;
  expiresAt: string;
  viewsCount: number;
  isViewed?: boolean;
  createdAt: string;
}

export interface PostItem {
  id: string;
  author: UserSummary;
  place?: {
    id: string;
    name: string;
    category: PlaceCategoryId;
    address: string;
    coverPhoto: string;
  };
  rating?: number;
  content: string;
  photos: string[];
  tags: string[];
  likesCount: number;
  savesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
}

export interface CollectionItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverPhoto: string;
  author: UserSummary;
  cityId: CityId;
  isPublic: boolean;
  placesCount: number;
  places?: Place[];
  savesCount: number;
  isSaved?: boolean;
  createdAt: string;
}

export interface FeedRecommendationCard {
  type: "PLACE" | "EVENT" | "COLLECTION" | "STORY_SET";
  id: string;
  score: number;
  matchReasons: string[]; // e.g. ["Рядом с вами", "Любимый тег: Спешелти кофе", "Выбор локальных авторов"]
  place?: Place;
  event?: EventItem;
  collection?: CollectionItem;
  stories?: StoryItem[];
}

export interface FeedResponse {
  items: FeedRecommendationCard[];
  hasMore: boolean;
  nextCursor?: string;
  total: number;
}

export interface GeoFilterQuery {
  cityId?: CityId;
  category?: PlaceCategoryId;
  tags?: string[];
  search?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  isOpenNow?: boolean;
  cursor?: string;
  limit?: number;
}
