"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Map as MapIcon,
  Grid,
  Filter,
  Navigation,
  Compass,
  Layers,
  ChevronRight,
  TrendingUp,
  Clock,
  Search
} from "lucide-react";
import {
  PLACE_CATEGORIES,
  PlaceCategoryId,
  Place,
  EventItem,
  CollectionItem,
  FeedRecommendationCard
} from "@mestory/shared";
import { Header } from "@/components/Header";
import { StoriesBar } from "@/components/StoriesBar";
import { PlaceCard } from "@/components/PlaceCard";
import { EventCard } from "@/components/EventCard";
import { CollectionCard } from "@/components/CollectionCard";
import { YandexMap } from "@/components/YandexMap";
import { PlaceDetailDrawer } from "@/components/PlaceDetailDrawer";
import { AuthModal } from "@/components/AuthModal";
import { CreatePlaceModal } from "@/components/CreatePlaceModal";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
  const { selectedCity, userLocation, requestUserLocation } = useAuth();

  const [feedItems, setFeedItems] = useState<FeedRecommendationCard[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [storiesGroups, setStoriesGroups] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"feed" | "split" | "map">("split");

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка ленты и мест при смене города/фильтра/поиска
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [feedRes, placesRes, storiesRes] = await Promise.all([
        api.getFeed({
          cityId: selectedCity.id,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          tags: activeTagFilter || undefined,
          search: searchQuery || undefined,
          lat: userLocation?.lat,
          lng: userLocation?.lng
        }),
        api.getPlaces({
          cityId: selectedCity.id,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          search: searchQuery || undefined,
          lat: userLocation?.lat,
          lng: userLocation?.lng
        }),
        api.getStories(selectedCity.id)
      ]);

      setFeedItems(feedRes.items || []);
      setPlaces(placesRes.items || []);
      setStoriesGroups(storiesRes.groups || []);
    } catch (err) {
      console.error("Error loading feed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCity.id, selectedCategory, activeTagFilter, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0E14]">
      {/* Шапка */}
      <Header
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreatePlace={() => setIsCreateModalOpen(true)}
        isMapActive={viewMode === "map"}
        onToggleMap={() =>
          setViewMode((prev) => (prev === "map" ? "split" : "map"))
        }
      />

      {/* Stories Bar */}
      <StoriesBar
        groups={storiesGroups}
        onOpenCreateStory={() => setIsCreateModalOpen(true)}
        onPlaceSelect={(placeId) => setSelectedPlaceId(placeId)}
      />

      {/* Панель фильтров категорий и режимов отображения */}
      <div className="border-b border-white/5 bg-[#0D1117]/80 backdrop-blur-md sticky top-16 z-30 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Скролл категорий */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-amber-500 text-slate-950 shadow-glowAmber"
                  : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
              }`}
            >
              ✨ Все открытия
            </button>

            {PLACE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 shadow-glowAmber"
                      : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Быстрые переключатели видов (Лента / Split / Карта) */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Рядом со мной */}
            <button
              onClick={() => {
                requestUserLocation();
                setActiveTagFilter(activeTagFilter === "near" ? null : "near");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                activeTagFilter === "near"
                  ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-glowEmerald"
                  : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Рядом со мной</span>
            </button>

            {/* Режимы экрана (для десктопа) */}
            <div className="hidden lg:flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => setViewMode("feed")}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "feed"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Только лента"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "split"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Лента + Карта"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "map"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Только карта"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Баннер города и приветствия */}
        <div className="mb-6 p-6 rounded-3xl glass-panel relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Умная городская экосистема • {selectedCity.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
              Откройте для себя лучшее в городе
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Рекомендации спешелти-кофеен, авторской донской кухни, тайных баров
              и выставок от локальных экспертов. Сохраняйте находки и делитесь своими.
            </p>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 via-indigo-500/5 to-transparent pointer-events-none" />
        </div>

        {/* Сетка: Лента и Интерактивная Карта */}
        <div
          className={`grid gap-6 ${
            viewMode === "split"
              ? "lg:grid-cols-12 items-start"
              : viewMode === "map"
              ? "grid-cols-1"
              : "grid-cols-1"
          }`}
        >
          {/* Колонка Ленты */}
          {viewMode !== "map" && (
            <div
              className={`${
                viewMode === "split" ? "lg:col-span-7" : "col-span-1"
              } space-y-6`}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-16 space-y-3">
                  <div className="animate-spin w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full" />
                  <p className="text-xs text-slate-400 font-medium">
                    Подбираем лучшие рекомендации...
                  </p>
                </div>
              ) : feedItems.length > 0 ? (
                <div
                  className={`grid gap-5 items-stretch ${
                    viewMode === "feed"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1 sm:grid-cols-2"
                  }`}
                >
                  {feedItems.map((item) => {
                    if (item.type === "PLACE" && item.place) {
                      return (
                        <PlaceCard
                          key={item.id}
                          place={item.place}
                          matchReasons={item.matchReasons}
                          onSelect={(p) => setSelectedPlaceId(p.id)}
                        />
                      );
                    }
                    if (item.type === "EVENT" && item.event) {
                      return (
                        <EventCard
                          key={item.id}
                          event={item.event}
                          onSelect={(ev) => {
                            if (ev.placeId) setSelectedPlaceId(ev.placeId);
                          }}
                        />
                      );
                    }
                    if (item.type === "COLLECTION" && item.collection) {
                      return (
                        <CollectionCard
                          key={item.id}
                          collection={item.collection}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              ) : (
                <div className="p-12 text-center glass-card rounded-3xl space-y-3">
                  <Compass className="w-12 h-12 text-amber-400 mx-auto opacity-50" />
                  <h3 className="text-base font-bold text-white">
                    Ничего не найдено по вашему запросу
                  </h3>
                  <p className="text-xs text-slate-400">
                    Попробуйте сбросить фильтры категорий или выбрать другой город.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setSearchQuery("");
                      setActiveTagFilter(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-glowAmber"
                  >
                    Показать все открытия
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Колонка Интерактивной Яндекс.Карты */}
          {viewMode !== "feed" && (
            <div
              className={`${
                viewMode === "split"
                  ? "lg:col-span-5 sticky top-36 h-[calc(100vh-170px)]"
                  : "col-span-1 h-[75vh]"
              }`}
            >
              <YandexMap
                places={places}
                selectedPlaceId={selectedPlaceId || undefined}
                onSelectPlace={(p) => setSelectedPlaceId(p.id)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Всплывающая карточка заведения (Drawer) */}
      <PlaceDetailDrawer
        placeId={selectedPlaceId}
        onClose={() => setSelectedPlaceId(null)}
      />

      {/* Модалка добавления места */}
      <CreatePlaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPlaceCreated={fetchData}
      />

      {/* Модалка входа / регистрации */}
      <AuthModal />
    </div>
  );
}
