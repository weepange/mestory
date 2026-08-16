"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  TrendingUp,
  Eye,
  Bookmark,
  Navigation,
  CheckCircle2,
  ShieldCheck,
  Plus,
  ArrowLeft,
  Sparkles,
  BarChart3,
  Users
} from "lucide-react";
import { Header } from "@/components/Header";
import { AuthModal } from "@/components/AuthModal";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function BusinessPage() {
  const { user, openAuthModal } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Форма верификации
  const [companyName, setCompanyName] = useState("");
  const [inn, setInn] = useState("");
  const [ogrn, setOgrn] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      const [dashRes, placesRes] = await Promise.all([
        api.getBusinessDashboard().catch(() => null),
        api.getPlaces({ cityId: "rostov-on-don" })
      ]);
      setDashboard(dashRes);
      setPlaces(placesRes.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      await api.verifyBusiness({
        companyName,
        inn,
        ogrn: ogrn || undefined,
        placeId: selectedPlaceId || undefined
      });
      setSuccessMsg("Заведение успешно привязано и верифицировано!");
      loadData();
    } catch (err: any) {
      alert(err.message || "Ошибка верификации");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0E14]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Заголовок */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Вернуться в ленту</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Mestory для локального бизнеса
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Управление заведением, глубокая аналитика интереса аудитории и привлечение гостей
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Партнерская программа</span>
            </span>
          </div>
        </div>

        {!user ? (
          <div className="p-12 text-center glass-panel rounded-3xl space-y-4 max-w-lg mx-auto">
            <Building2 className="w-12 h-12 text-amber-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">
              Вход для представителей бизнеса
            </h2>
            <p className="text-xs text-slate-400">
              Войдите или выберите демо-аккаунт бизнеса, чтобы просматривать статистику карточки.
            </p>
            <button
              onClick={openAuthModal}
              className="px-6 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs shadow-glowAmber"
            >
              Войти в профиль
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Метрики эффективности */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card rounded-3xl p-5 space-y-2 border-l-4 border-l-amber-500">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Просмотры в ленте</span>
                  <Eye className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {dashboard?.summary?.totalViews || 2480}
                </p>
                <span className="text-[11px] text-emerald-400 font-medium">
                  +18% за эту неделю
                </span>
              </div>

              <div className="glass-card rounded-3xl p-5 space-y-2 border-l-4 border-l-indigo-500">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Сохранения в закладки</span>
                  <Bookmark className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {dashboard?.summary?.totalSaves || 142}
                </p>
                <span className="text-[11px] text-amber-400 font-medium">
                  Высокая конверсия в визиты
                </span>
              </div>

              <div className="glass-card rounded-3xl p-5 space-y-2 border-l-4 border-l-emerald-500">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Маршруты в Яндекс</span>
                  <Navigation className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {dashboard?.summary?.totalRouteClicks || 420}
                </p>
                <span className="text-[11px] text-emerald-400 font-medium">
                  Целевые переходы
                </span>
              </div>

              <div className="glass-card rounded-3xl p-5 space-y-2 border-l-4 border-l-rose-500">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Авторские обзоры</span>
                  <Sparkles className="w-4 h-4 text-rose-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {dashboard?.summary?.totalReviews || 38}
                </p>
                <span className="text-[11px] text-slate-400 font-medium">
                  Средний балл 4.95 ⭐
                </span>
              </div>
            </div>

            {/* Карточки управляемых заведений */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>Ваши заведения на карте Mestory</span>
              </h2>

              {dashboard?.places && dashboard.places.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboard.places.map((place: any) => (
                    <div
                      key={place.id}
                      className="glass-card rounded-3xl p-5 flex gap-4 items-center"
                    >
                      <img
                        src={place.coverPhoto}
                        alt={place.name}
                        className="w-24 h-24 rounded-2xl object-cover"
                      />
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">
                            {place.name}
                          </h3>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          {place.address}
                        </p>
                        <div className="flex items-center gap-3 text-xs pt-1">
                          <span className="text-amber-400 font-bold">
                            ⭐ {place.rating}
                          </span>
                          <span className="text-slate-300">
                            {place.savesCount} сохранений
                          </span>
                          <span className="text-emerald-400">
                            {place.routeClicks} маршрутов
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 glass-card rounded-3xl text-center space-y-2 text-slate-400 text-xs">
                  Вы пока не привязали заведение к аккаунту. Заполните форму ниже для верификации!
                </div>
              )}
            </div>

            {/* Форма верификации и привязки заведения */}
            <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 max-w-2xl">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Верифицировать заведение или компанию
                </h3>
              </div>

              {successMsg && (
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                  ✓ {successMsg}
                </div>
              )}

              <form onSubmit={handleVerifySubmit} className="space-y-3.5 text-xs text-slate-200">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">
                    Выберите ваше заведение из каталога Ростова-на-Дону
                  </label>
                  <select
                    value={selectedPlaceId}
                    onChange={(e) => setSelectedPlaceId(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-amber-400"
                    required
                  >
                    <option value="">-- Выберите заведение --</option>
                    {places.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.address})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">
                      Юридическое наименование (ООО / ИП)
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="ООО 'Лео Вайн'"
                      className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">ИНН</label>
                    <input
                      type="text"
                      value={inn}
                      onChange={(e) => setInn(e.target.value)}
                      placeholder="6164000000"
                      className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-glowAmber disabled:opacity-50"
                >
                  {isVerifying ? "Проверка..." : "Подтвердить права и получить бейдж верификации"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <AuthModal />
    </div>
  );
}
