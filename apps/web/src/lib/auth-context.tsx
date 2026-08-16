"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CITIES, CityId, RegisterDto, LoginDto } from "@mestory/shared";
import { api } from "./api";

interface User {
  id: string;
  name: string;
  handle: string;
  email?: string;
  phone?: string;
  role: "USER" | "BUSINESS" | "ADMIN";
  isVerifiedCreator?: boolean;
  cityId: string;
  interests: string[];
  avatarUrl?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  collectionsCount?: number;
  reviewsCount?: number;
  bookmarksCount?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  selectedCity: (typeof CITIES)[number];
  setSelectedCityId: (cityId: CityId) => void;
  userLocation: { lat: number; lng: number } | null;
  requestUserLocation: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  demoLogin: (role?: "user" | "creator" | "business" | "admin") => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedCityId, setSelectedCityIdState] = useState<CityId>("rostov-on-don");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>({
    lat: 47.2225,
    lng: 39.7187 // Центр Ростова-на-Дону по умолчанию
  });

  const selectedCity =
    CITIES.find((c) => c.id === selectedCityId) || CITIES[0];

  const refreshUser = async () => {
    try {
      const storedToken = localStorage.getItem("mestory_token");
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }
      setToken(storedToken);
      const me = await api.getMe();
      setUser(me);
      if (me.cityId && CITIES.some((c) => c.id === me.cityId)) {
        setSelectedCityIdState(me.cityId as CityId);
      }
    } catch (e) {
      console.warn("Failed to fetch user session", e);
      localStorage.removeItem("mestory_token");
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (data: LoginDto) => {
    const res = await api.login(data);
    localStorage.setItem("mestory_token", res.token);
    setToken(res.token);
    setUser(res.user);
    setIsAuthModalOpen(false);
  };

  const register = async (data: RegisterDto) => {
    const res = await api.register(data);
    localStorage.setItem("mestory_token", res.token);
    setToken(res.token);
    setUser(res.user);
    setIsAuthModalOpen(false);
  };

  const demoLogin = async (role: "user" | "creator" | "business" | "admin" = "user") => {
    const res = await api.demoLogin(role);
    localStorage.setItem("mestory_token", res.token);
    setToken(res.token);
    setUser(res.user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("mestory_token");
    setToken(null);
    setUser(null);
  };

  const setSelectedCityId = (cityId: CityId) => {
    setSelectedCityIdState(cityId);
    const city = CITIES.find((c) => c.id === cityId);
    if (city) {
      setUserLocation({ lat: city.center.lat, lng: city.center.lng });
    }
  };

  const requestUserLocation = async () => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => {
        console.warn("Geolocation permission denied or error:", err);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        selectedCity,
        setSelectedCityId,
        userLocation,
        requestUserLocation,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        register,
        demoLogin,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
