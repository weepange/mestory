import {
  FeedResponse,
  Place,
  EventItem,
  CollectionItem,
  PostItem,
  PlaceCategoryId,
  RegisterDto,
  LoginDto
} from "@mestory/shared";

const API_BASE =
  typeof window !== "undefined"
    ? "http://localhost:4000/api"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("mestory_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Feed
  getFeed: (params?: {
    cityId?: string;
    category?: string;
    tags?: string;
    lat?: number;
    lng?: number;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.cityId) searchParams.set("cityId", params.cityId);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.tags) searchParams.set("tags", params.tags);
    if (params?.lat !== undefined) searchParams.set("lat", params.lat.toString());
    if (params?.lng !== undefined) searchParams.set("lng", params.lng.toString());
    if (params?.search) searchParams.set("search", params.search);

    const queryStr = searchParams.toString();
    return request<FeedResponse>(`/feed${queryStr ? `?${queryStr}` : ""}`);
  },

  // Places
  getPlaces: (params?: {
    cityId?: string;
    category?: string;
    search?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.cityId) searchParams.set("cityId", params.cityId);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.lat !== undefined) searchParams.set("lat", params.lat.toString());
    if (params?.lng !== undefined) searchParams.set("lng", params.lng.toString());
    if (params?.radiusKm !== undefined) searchParams.set("radiusKm", params.radiusKm.toString());

    return request<{ items: Place[]; total: number }>(`/places?${searchParams.toString()}`);
  },

  getPlace: (idOrSlug: string) => {
    return request<Place & { events: any[]; reviews: any[] }>(`/places/${idOrSlug}`);
  },

  createPlace: (data: any) => {
    return request<Place>("/places", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  // Events
  getEvents: (params?: { cityId?: string; category?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.cityId) searchParams.set("cityId", params.cityId);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.search) searchParams.set("search", params.search);

    return request<{ items: EventItem[]; total: number }>(`/events?${searchParams.toString()}`);
  },

  getEvent: (idOrSlug: string) => {
    return request<EventItem & { place?: Place }>(`/events/${idOrSlug}`);
  },

  // Stories
  getStories: (cityId = "rostov-on-don") => {
    return request<{ groups: any[]; allStories: any[] }>(`/stories?cityId=${cityId}`);
  },

  createStory: (data: { title: string; mediaUrl: string; placeId?: string; eventId?: string; cityId?: string }) => {
    return request("/stories", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  viewStory: (id: string) => {
    return request(`/stories/${id}/view`, { method: "POST" });
  },

  // Collections
  getCollections: (cityId = "rostov-on-don") => {
    return request<{ items: CollectionItem[] }>(`/collections?cityId=${cityId}`);
  },

  getCollection: (idOrSlug: string) => {
    return request<CollectionItem & { places: Place[] }>(`/collections/${idOrSlug}`);
  },

  createCollection: (data: any) => {
    return request<CollectionItem>("/collections", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  // Bookmarks
  toggleBookmark: (targetType: "PLACE" | "EVENT" | "COLLECTION", targetId: string) => {
    return request<{ saved: boolean }>("/collections/bookmark", {
      method: "POST",
      body: JSON.stringify({ targetType, targetId })
    });
  },

  getMyBookmarks: () => {
    return request<{ places: Place[] }>("/collections/bookmarks/my");
  },

  // Posts & Reviews
  getPosts: (params?: { placeId?: string; authorId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.placeId) searchParams.set("placeId", params.placeId);
    if (params?.authorId) searchParams.set("authorId", params.authorId);

    return request<{ items: PostItem[] }>(`/posts?${searchParams.toString()}`);
  },

  createPost: (data: { placeId?: string; rating?: number; content: string; photos?: string[]; tags?: string[] }) => {
    return request<PostItem>("/posts", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  toggleLike: (id: string) => {
    return request<{ liked: boolean }>(`/posts/${id}/like`, { method: "POST" });
  },

  // Users & Authors
  getAuthors: (cityId = "rostov-on-don") => {
    return request<{ items: any[] }>(`/users/authors?cityId=${cityId}`);
  },

  getUserProfile: (handleOrId: string) => {
    return request<any>(`/users/${handleOrId}`);
  },

  toggleFollow: (id: string) => {
    return request<{ following: boolean }>(`/users/${id}/follow`, { method: "POST" });
  },

  // Business
  getBusinessDashboard: () => {
    return request<any>("/business/dashboard");
  },

  verifyBusiness: (data: { companyName: string; inn: string; ogrn?: string; placeId?: string }) => {
    return request<any>("/business/verify", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  // Auth
  register: (data: RegisterDto) => {
    return request<{ token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data)
    });
  },

  login: (data: LoginDto) => {
    return request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data)
    });
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
