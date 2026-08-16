import { Platform } from "react-native";
import Constants from "expo-constants";
import { Place, FeedResponse, EventItem, CollectionItem } from "@mestory/shared";

// Динамическое определение IP хоста для работы как на реальном телефоне, так и в эмуляторах
function getApiBaseUrl(): string {
  // На физическом смартфоне через Expo Go берем реальный IP хоста Metro
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:4000/api`;
  }

  // Для Android эмулятора (Android Studio)
  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000/api";
  }

  // По умолчанию для iOS симулятора и Web
  return "http://localhost:4000/api";
}

const BASE_URL = getApiBaseUrl();

let authToken: string | null = null;

export const setMobileAuthToken = (token: string | null) => {
  authToken = token;
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as any)
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    return res.json();
  } catch (error: any) {
    console.warn(`[Mobile API Error] ${endpoint}:`, error?.message || error);
    throw error;
  }
}

export const mobileApi = {
  getFeed: (cityId = "rostov-on-don", category?: string, lat?: number, lng?: number) => {
    let url = `/feed?cityId=${cityId}`;
    if (category && category !== "all") url += `&category=${category}`;
    if (lat !== undefined && lng !== undefined) url += `&lat=${lat}&lng=${lng}`;
    return request<FeedResponse>(url);
  },

  getPlaces: (cityId = "rostov-on-don", category?: string) => {
    let url = `/places?cityId=${cityId}`;
    if (category && category !== "all") url += `&category=${category}`;
    return request<{ items: Place[]; total: number }>(url);
  },

  getPlace: (idOrSlug: string) => {
    return request<any>(`/places/${idOrSlug}`);
  },

  getStories: (cityId = "rostov-on-don") => {
    return request<{ groups: any[]; allStories: any[] }>(`/stories?cityId=${cityId}`);
  },

  viewStory: (id: string) => {
    return request(`/stories/${id}/view`, { method: "POST" });
  },

  getCollections: (cityId = "rostov-on-don") => {
    return request<{ items: CollectionItem[] }>(`/collections?cityId=${cityId}`);
  },

  toggleBookmark: (targetType: "PLACE" | "EVENT" | "COLLECTION", targetId: string) => {
    return request<{ saved: boolean }>("/collections/bookmark", {
      method: "POST",
      body: JSON.stringify({ targetType, targetId })
    });
  },

  getMyBookmarks: () => {
    return request<{ places: Place[] }>("/collections/bookmarks/my");
  },

  demoLogin: (role: "user" | "creator" | "business" = "user") => {
    return request<{ token: string; user: any }>("/auth/demo-login", {
      method: "POST",
      body: JSON.stringify({ role })
    });
  },

  getMe: () => {
    return request<any>("/auth/me");
  }
};
