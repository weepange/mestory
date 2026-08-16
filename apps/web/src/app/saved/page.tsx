"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, Sparkles, ArrowLeft, Trash2, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { PlaceCard } from "@/components/PlaceCard";
import { PlaceDetailDrawer } from "@/components/PlaceDetailDrawer";
import { AuthModal } from "@/components/AuthModal";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function SavedPage() {
  const { user, openAuthModal } = useAuth();
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    api
      .getMyBookmarks()
      .then((res) => {
        setSavedPlaces(res.places || []);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0E14]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Вернуться в ленту</span>
            </Link>
            <h1 className="text-2xl font-bold font-display text-white">
              Сохраненные места и коллекции
            </h1>
            <p className="text-xs text-slate-400">
              Ваши персональные закладки, чтобы не потерять идеи для досуга
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 fill-amber-400" />
            <span>{savedPlaces.length} мест сохранено</span>
          </div>
        </div>

        {!user ? (
          <div className="p-12 text-center glass-panel rounded-3xl space-y-4 max-w-md mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <Bookmark className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white">
              Войдите, чтобы сохранять места
            </h2>
            <p className="text-xs text-slate-400">
              Сохраняйте любимые кофейни, рестораны и выставки в один клик.
            </p>
            <button
              onClick={openAuthModal}
              className="px-6 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs shadow-glowAmber hover:bg-amber-400 transition-all"
            >
              Войти в профиль
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center p-16">
            <div className="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full" />
          </div>
        ) : savedPlaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onSelect={(p) => setSelectedPlaceId(p.id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center glass-card rounded-3xl space-y-3">
            <Bookmark className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">
              У вас пока нет сохраненных мест
            </h3>
            <p className="text-xs text-slate-400">
              Нажмите на значок закладки на любой карточке в ленте или на карте!
            </p>
            <Link
              href="/"
              className="inline-block px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-glowAmber"
            >
              Исследовать город
            </Link>
          </div>
        )}
      </main>

      <PlaceDetailDrawer
        placeId={selectedPlaceId}
        onClose={() => setSelectedPlaceId(null)}
      />

      <AuthModal />
    </div>
  );
}
