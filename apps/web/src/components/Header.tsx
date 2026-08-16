"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Search,
  Plus,
  Compass,
  Bookmark,
  Building2,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  Map as MapIcon
} from "lucide-react";
import { CITIES, CityId } from "@mestory/shared";
import { useAuth } from "@/lib/auth-context";

interface HeaderProps {
  onSearchChange?: (val: string) => void;
  searchValue?: string;
  onOpenCreatePlace?: () => void;
  isMapActive?: boolean;
  onToggleMap?: () => void;
}

export function Header({
  onSearchChange,
  searchValue = "",
  onOpenCreatePlace,
  isMapActive = false,
  onToggleMap
}: HeaderProps) {
  const {
    user,
    logout,
    openAuthModal,
    selectedCity,
    setSelectedCityId
  } = useAuth();

  const pathname = usePathname();
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Логотип + Выбор города */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white animate-pulse-slow" />
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-1">
                Mestory
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                  Rostov
                </span>
              </span>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Городской опыт и рекомендации
              </p>
            </div>
          </Link>

          {/* Селектор города */}
          <div className="relative">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{selectedCity.shortName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isCityDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 rounded-xl glass-panel p-1 shadow-2xl z-50 border border-white/10">
                {CITIES.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      setSelectedCityId(city.id as CityId);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      selectedCity.id === city.id
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <span>{city.name}</span>
                    {selectedCity.id === city.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Поисковая строка */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Найти кофейню, выставку, бар или блюдо..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08] transition-all"
            />
          </div>
        </div>

        {/* Навигация и профиль */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Переключатель карты для мобилок/десктопа */}
          {onToggleMap && (
            <button
              onClick={onToggleMap}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isMapActive
                  ? "bg-amber-500 text-slate-950 shadow-glowAmber"
                  : "bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200"
              }`}
              title="Показать карту"
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isMapActive ? "Лента" : "Карта"}
              </span>
            </button>
          )}

          {/* Добавить место */}
          <button
            onClick={() => {
              if (!user) {
                openAuthModal();
              } else {
                onOpenCreatePlace?.();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs transition-all shadow-glowAmber active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Добавить</span>
          </button>

          {/* Сохраненное */}
          <Link
            href="/saved"
            className={`p-2 rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 transition-colors ${
              pathname === "/saved" ? "bg-white/15 text-amber-400" : "bg-white/5"
            }`}
            title="Сохраненные места"
          >
            <Bookmark className="w-4 h-4" />
          </Link>

          {/* Кабинет бизнеса */}
          <Link
            href="/business"
            className={`p-2 rounded-xl border border-white/10 hover:bg-white/10 text-slate-300 transition-colors hidden sm:block ${
              pathname === "/business" ? "bg-white/15 text-amber-400" : "bg-white/5"
            }`}
            title="Партнерам и бизнесу"
          >
            <Building2 className="w-4 h-4" />
          </Link>

          {/* Профиль / Вход */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <img
                  src={
                    user.avatarUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${user.handle}`
                  }
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <span className="text-xs font-semibold text-slate-200 hidden md:inline pr-2">
                  @{user.handle}
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl glass-panel p-2 shadow-2xl z-50 border border-white/10">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-semibold text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-amber-400">@{user.handle}</p>
                    {user.isVerifiedCreator && (
                      <span className="text-[10px] text-emerald-400 font-medium">
                        ✓ Верифицированный автор
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/authors/${user.handle}`}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Мой авторский профиль</span>
                  </Link>

                  <Link
                    href="/saved"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Мои коллекции и закладки</span>
                  </Link>

                  <Link
                    href="/business"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Кабинет заведения</span>
                  </Link>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Выйти</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-colors"
            >
              Войти
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
