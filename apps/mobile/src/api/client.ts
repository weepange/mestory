import { Platform } from "react-native";
import Constants from "expo-constants";
import { Place, FeedResponse, EventItem, CollectionItem } from "@mestory/shared";
import { MOCK_PLACES, MOCK_STORIES_GROUPS, MOCK_COLLECTIONS } from "./mockData";

// Динамическое определение IP хоста для работы как на реальном телефоне, так и в эмуляторах
function getApiBaseUrl(): string {
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    // Если это локальный IP (например 192.168.x.x), обращаемся к бэкенду на порту 4000
    if (host.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return `http://${host}:4000/api`;
    }
  }

  // Для Android эмулятора
  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000/api";
  }

  // Если запущен туннель или симулятор, используем локальный адрес сети
  return "http://192.168.0.164:4000/api";
}

const BASE_URL = getApiBaseUrl();

let authToken: string | null = null;

export const setMobileAuthToken = (token: string | null) => {
  authToken = token;
};

// Быстрый запрос с таймаутом 2.5 сек для мгновенного отклика без зависаний
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as any)
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    return res.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn(`[Mobile API Fallback] ${endpoint}:`, error?.message || error);
    throw error;
  }
}

export const mobileApi = {
  getFeed: async (cityId = "rostov-on-don", category?: string, lat?: number, lng?: number): Promise<FeedResponse> => {
    try {
      let url = `/feed?cityId=${cityId}`;
      if (category && category !== "all") url += `&category=${category}`;
      if (lat !== undefined && lng !== undefined) url += `&lat=${lat}&lng=${lng}`;
      return await request<FeedResponse>(url);
    } catch {
      let filtered = MOCK_PLACES;
      if (category && category !== "all") {
        filtered = MOCK_PLACES.filter((p) => p.category === category);
      }
      return {
        places: filtered,
        stories: MOCK_STORIES_GROUPS.flatMap((g) => g.stories),
        events: [],
        curatedCollections: MOCK_COLLECTIONS,
        total: filtered.length
      };
    }
  },

  getPlaces: async (cityId = "rostov-on-don", category?: string): Promise<{ items: Place[]; total: number }> => {
    try {
      let url = `/places?cityId=${cityId}`;
      if (category && category !== "all") url += `&category=${category}`;
      return await request<{ items: Place[]; total: number }>(url);
    } catch {
      let filtered = MOCK_PLACES;
      if (category && category !== "all") {
        filtered = MOCK_PLACES.filter((p) => p.category === category);
      }
      return {
        items: filtered,
        total: filtered.length
      };
    }
  },

  getPlace: async (idOrSlug: string): Promise<any> => {
    try {
      return await request<any>(`/places/${idOrSlug}`);
    } catch {
      const found = MOCK_PLACES.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
      return { place: found || MOCK_PLACES[0] };
    }
  },

  getStories: async (cityId = "rostov-on-don"): Promise<{ groups: any[]; allStories: any[] }> => {
    try {
      return await request<{ groups: any[]; allStories: any[] }>(`/stories?cityId=${cityId}`);
    } catch {
      return {
        groups: MOCK_STORIES_GROUPS,
        allStories: MOCK_STORIES_GROUPS.flatMap((g) => g.stories)
      };
    }
  },

  viewStory: (id: string) => {
    return request(`/stories/${id}/view`, { method: "POST" }).catch(() => {});
  },

  getCollections: async (cityId = "rostov-on-don"): Promise<{ items: CollectionItem[] }> => {
    try {
      return await request<{ items: CollectionItem[] }>(`/collections?cityId=${cityId}`);
    } catch {
      return { items: MOCK_COLLECTIONS };
    }
  },

  toggleBookmark: (targetType: "PLACE" | "EVENT" | "COLLECTION", targetId: string) => {
    return request<{ saved: boolean }>("/collections/bookmark", {
      method: "POST",
      body: JSON.stringify({ targetType, targetId })
    }).catch(() => ({ saved: true }));
  },

  getMyBookmarks: async (): Promise<{ places: Place[] }> => {
    try {
      return await request<{ places: Place[] }>("/collections/bookmarks/my");
    } catch {
      return { places: [MOCK_PLACES[0], MOCK_PLACES[1]] };
    }
  },

  demoLogin: (role: "user" | "creator" | "business" = "user") => {
    return request<{ token: string; user: any }>("/auth/demo-login", {
      method: "POST",
      body: JSON.stringify({ role })
    }).catch(() => ({
      token: "demo-token",
      user: {
        id: "demo-u-1",
        name: "Алексей Смирнов",
        handle: "don_foodie",
        role: "USER",
        isVerifiedCreator: true
      }
    }));
  },

  getMe: () => {
    return request<any>("/auth/me").catch(() => null);
  }
};
