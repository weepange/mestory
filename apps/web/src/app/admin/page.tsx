"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Users,
  Film,
  Database,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Search,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Filter,
  Check,
  AlertCircle,
  ExternalLink,
  Lock,
  RefreshCw,
  Clock,
  MapPin,
  Star,
  Bookmark
} from "lucide-react";
import { PLACE_CATEGORIES, PlaceCategoryId } from "@mestory/shared";
import { Header } from "@/components/Header";
import { AuthModal } from "@/components/AuthModal";
import { CreatePlaceModal } from "@/components/CreatePlaceModal";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type AdminTab =
  | "overview"
  | "places"
  | "events"
  | "stories"
  | "collections"
  | "users"
  | "verifications"
  | "database";

export default function AdminPage() {
  const { user, demoLogin, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  // State данных
  const [stats, setStats] = useState<any>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);

  // Фильтры и поиск
  const [placeSearch, setPlaceSearch] = useState("");
  const [placeCategoryFilter, setPlaceCategoryFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isCreatePlaceOpen, setIsCreatePlaceOpen] = useState(false);

  // Загрузка статистики и данных в зависимости от вкладки
  const loadAdminData = async () => {
    if (!user || user.role !== "ADMIN") {
      setIsLoading(false);
      return;
    }

    try {
      setIsRefreshing(true);
      const [
        statsRes,
        placesRes,
        eventsRes,
        storiesRes,
        collectionsRes,
        usersRes,
        verifRes
      ] = await Promise.all([
        api.admin.getStats().catch(() => null),
        api.admin.getPlaces({ search: placeSearch || undefined, category: placeCategoryFilter !== "all" ? placeCategoryFilter : undefined }).catch(() => ({ items: [], total: 0 })),
        api.admin.getEvents().catch(() => ({ items: [], total: 0 })),
        api.admin.getStories().catch(() => ({ items: [], total: 0 })),
        api.admin.getCollections().catch(() => ({ items: [], total: 0 })),
        api.admin.getUsers({ search: userSearch || undefined, role: userRoleFilter !== "all" ? userRoleFilter : undefined }).catch(() => ({ items: [], total: 0 })),
        api.admin.getBusinessVerifications().catch(() => ({ items: [], total: 0 }))
      ]);

      setStats(statsRes);
      setPlaces(placesRes?.items || []);
      setEvents(eventsRes?.items || []);
      setStories(storiesRes?.items || []);
      setCollections(collectionsRes?.items || []);
      setUsersList(usersRes?.items || []);
      setVerifications(verifRes?.items || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [user?.role, placeSearch, placeCategoryFilter, userSearch, userRoleFilter]);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Действия с заведениями
  const handleTogglePlaceVerified = async (placeId: string, currentVal: boolean) => {
    try {
      await api.admin.updatePlace(placeId, { isVerifiedBusiness: !currentVal });
      showNotification(`Статус верификации заведения изменен`);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || "Ошибка обновления");
    }
  };

  const handleDeletePlace = async (placeId: string, name: string) => {
    if (!confirm(`Вы действительно хотите удалить заведение "${name}"?`)) return;
    try {
      await api.admin.deletePlace(placeId);
      showNotification(`Заведение "${name}" удалено`);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || "Ошибка удаления");
    }
  };

  // Действия с событиями
  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (!confirm(`Удалить событие "${title}"?`)) return;
    try {
      await api.admin.deleteEvent(eventId);
      showNotification(`Событие "${title}" удалено`);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || "Ошибка удаления");
    }
  };

  // Модерация историй
  const handleDeleteStory = async (storyId: string) => {
    if (!confirm("Удалить эту историю (модерация)?")) return;
    try {
      await api.admin.deleteStory(storyId);
      showNotification("История удалена модератором");
      loadAdminData();
    } catch (err: any) {
      alert(err.message || "Ошибка удаления");
    }
  };

  // Удаление подборок
  const handleDeleteCollection = async (colId: string, title: string) => {
    if (!confirm(`Удалить подборку "${title}"?`)) return;
    try {
      await api.admin.deleteCollection(colId);
      showNotification(`Подборка "${title}" удалена`);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || "Ошибка удаления");
    }
  };

  // Действия с пользователями
  const handleUserRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.admin.updateUser(userId, { role: newRole });
      showNotification("Роль пользователя успешно обновлена");
      loadAdminData();
    } catch (err: any) {
      alert(err.message || "Ошибка обновления роли");
    }
  };

  const handleToggleCreatorBadge = async (userId: string, currentVal: boolean) => {
    try {
      await api.admin.updateUser(userId, { isVerifiedCreator: !currentVal });
      showNotification("Статус верифицированного автора обновлен");
      loadAdminData();
    } catch (err: any) {
      alert(err.message || "Ошибка обновления");
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Удалить аккаунт пользователя "${name}"?`)) return;
    try {
      await api.admin.deleteUser(userId);
      showNotification(`Пользователь "${name}" удален`);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || "Ошибка удаления");
    }
  };

  // Верификация бизнеса
  const handleApproveVerification = async (id: string, company: string) => {
    try {
      await api.admin.approveVerification(id);
      showNotification(`Компания "${company}" успешно верифицирована!`);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || "Ошибка одобрения");
    }
  };

  const handleRejectVerification = async (id: string) => {
    try {
      await api.admin.rejectVerification(id);
      showNotification("Заявка на верификацию отклонена");
      loadAdminData();
    } catch (err: any) {
      alert(err.message || "Ошибка отклонения");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0E14] text-slate-100">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Верхняя панель заголовка */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Вернуться на главную</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-glowAmber">
                <ShieldCheck className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight flex items-center gap-2">
                  Панель Администратора
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                    SuperAdmin
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Управление базой данных, заведениями, афишей, модерацией и верификацией бизнеса
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadAdminData()}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
              <span>Обновить данные</span>
            </button>

            <button
              onClick={() => setIsCreatePlaceOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-glowAmber transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить место</span>
            </button>
          </div>
        </div>

        {/* Уведомление об успешном действии */}
        {actionSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Проверка роли Администратора (Role Guard & 1-Click Login) */}
        {(!user || user.role !== "ADMIN") ? (
          <div className="p-8 sm:p-12 rounded-3xl glass-card border border-amber-500/30 text-center max-w-xl mx-auto space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-glowAmber">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white font-display">
                Требуются права Администратора
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Вы вошли как <strong className="text-amber-400">@{user?.handle || "гость"}</strong> (роль: {user?.role || "не авторизован"}). Чтобы управлять базой данных и модерацией платформы, войдите под аккаунтом администратора.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => demoLogin("admin")}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-glowAmber transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Войти как Администратор (1 клик)</span>
              </button>

              <button
                onClick={openAuthModal}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-colors"
              >
                Логин по паролю
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Навигационные вкладки админ-панели */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-white/10 pb-3">
              {[
                { id: "overview", label: "Обзор", icon: TrendingUp },
                { id: "places", label: `Заведения (${stats?.places?.total ?? places.length})`, icon: Building2 },
                { id: "events", label: `События (${stats?.content?.events ?? events.length})`, icon: Calendar },
                { id: "stories", label: `Сторис (${stats?.content?.stories ?? stories.length})`, icon: Film },
                { id: "collections", label: `Подборки (${stats?.content?.collections ?? collections.length})`, icon: Layers },
                { id: "users", label: `Пользователи (${stats?.users?.total ?? usersList.length})`, icon: Users },
                {
                  id: "verifications",
                  label: `Верификация бизнеса ${
                    stats?.verifications?.pending ? `(${stats.verifications.pending})` : ""
                  }`,
                  icon: CheckCircle2,
                  badge: stats?.verifications?.pending > 0
                },
                { id: "database", label: "База данных", icon: Database }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                      isActive
                        ? "bg-amber-500 text-slate-950 shadow-glowAmber"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ВКЛАДКА 1: ОБЗОР (OVERVIEW) */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Сетка ключевых метрик KPI */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-3xl glass-card border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span>Всего мест</span>
                      <Building2 className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold font-display text-white">
                      {stats?.places?.total ?? places.length}
                    </p>
                    <p className="text-[11px] text-emerald-400 font-medium">
                      ✓ {stats?.places?.verified ?? 0} верифицировано бизнесом
                    </p>
                  </div>

                  <div className="p-5 rounded-3xl glass-card border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span>Пользователи</span>
                      <Users className="w-4 h-4 text-indigo-400" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold font-display text-white">
                      {stats?.users?.total ?? usersList.length}
                    </p>
                    <p className="text-[11px] text-amber-300 font-medium">
                      ⭐ {stats?.users?.creators ?? 0} авторов • 🏢 {stats?.users?.businesses ?? 0} бизнеса
                    </p>
                  </div>

                  <div className="p-5 rounded-3xl glass-card border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span>События и Афиша</span>
                      <Calendar className="w-4 h-4 text-rose-400" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold font-display text-white">
                      {stats?.content?.events ?? events.length}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Актуальные мероприятия в Ростове
                    </p>
                  </div>

                  <div className="p-5 rounded-3xl glass-card border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span>Истории (Stories)</span>
                      <Film className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold font-display text-white">
                      {stats?.content?.stories ?? stories.length}
                    </p>
                    <p className="text-[11px] text-cyan-300 font-medium">
                      Активные публикации за 24 часа
                    </p>
                  </div>
                </div>

                {/* Быстрые карточки действий */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div
                    onClick={() => setActiveTab("verifications")}
                    className="p-5 rounded-3xl glass-card border border-white/10 hover:border-amber-500/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                          Заявки на верификацию ({verifications.length})
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Модерация данных ИНН и привязки заведений
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab("stories")}
                    className="p-5 rounded-3xl glass-card border border-white/10 hover:border-amber-500/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform">
                        <Film className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                          Модерация Сторис
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Просмотр и удаление неприемлемого контента
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setActiveTab("database")}
                    className="p-5 rounded-3xl glass-card border border-white/10 hover:border-amber-500/40 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                        <Database className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                          Состояние Базы Данных
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Схема Prisma, PostgreSQL 16, сид данных
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ВКЛАДКА 2: МЕСТА И ЗАВЕДЕНИЯ (PLACES) */}
            {activeTab === "places" && (
              <div className="space-y-4">
                {/* Фильтры и поиск мест */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={placeSearch}
                      onChange={(e) => setPlaceSearch(e.target.value)}
                      placeholder="Поиск места по названию или адресу..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <select
                      value={placeCategoryFilter}
                      onChange={(e) => setPlaceCategoryFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                    >
                      <option value="all" className="bg-[#121722]">Все категории</option>
                      {PLACE_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#121722]">
                          {c.icon} {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Таблица заведений */}
                <div className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-slate-300 font-semibold border-b border-white/10">
                        <tr>
                          <th className="py-3.5 px-4">Заведение</th>
                          <th className="py-3.5 px-4">Категория</th>
                          <th className="py-3.5 px-4">Адрес</th>
                          <th className="py-3.5 px-4">Рейтинг / Сохранения</th>
                          <th className="py-3.5 px-4">Верификация</th>
                          <th className="py-3.5 px-4 text-right">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-200">
                        {places.map((place) => {
                          const cat = PLACE_CATEGORIES.find((c) => c.id === place.category);
                          return (
                            <tr key={place.id} className="hover:bg-white/[0.03] transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={place.coverPhoto}
                                    alt={place.name}
                                    className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0"
                                  />
                                  <div>
                                    <p className="font-bold text-white text-sm">{place.name}</p>
                                    <p className="text-[11px] text-slate-400 truncate max-w-xs">
                                      {place.summary}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px]">
                                  {cat?.icon} {cat?.label}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-300 max-w-[200px] truncate">
                                {place.address}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="space-y-0.5">
                                  <span className="text-amber-400 font-bold flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-400" />
                                    {place.rating} ({place.reviewsCount})
                                  </span>
                                  <p className="text-[10px] text-slate-400">
                                    {place.savesCount} сохранений
                                  </p>
                                </div>
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <button
                                  onClick={() => handleTogglePlaceVerified(place.id, place.isVerifiedBusiness)}
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                                    place.isVerifiedBusiness
                                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                                      : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                                  }`}
                                >
                                  {place.isVerifiedBusiness ? "✓ Верифицировано" : "Не верифицировано"}
                                </button>
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                                <button
                                  onClick={() => handleDeletePlace(place.id, place.name)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                                  title="Удалить место"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ВКЛАДКА 3: СОБЫТИЯ И АФИША (EVENTS) */}
            {activeTab === "events" && (
              <div className="space-y-4">
                <div className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-slate-300 font-semibold border-b border-white/10">
                        <tr>
                          <th className="py-3.5 px-4">Событие</th>
                          <th className="py-3.5 px-4">Дата и Время</th>
                          <th className="py-3.5 px-4">Организатор</th>
                          <th className="py-3.5 px-4">Стоимость</th>
                          <th className="py-3.5 px-4 text-right">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-200">
                        {events.map((event) => (
                          <tr key={event.id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={event.coverPhoto}
                                  alt={event.title}
                                  className="w-12 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0"
                                />
                                <div>
                                  <p className="font-bold text-white text-sm">{event.title}</p>
                                  <p className="text-[11px] text-indigo-400">{event.placeName || "Городская площадка"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                              {new Date(event.startDateTime).toLocaleString("ru-RU", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                              @{event.organizer?.handle || "organizer"}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-medium">
                                {event.priceText}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteEvent(event.id, event.title)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                                title="Удалить событие"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ВКЛАДКА 4: ИСТОРИИ И МОДЕРАЦИЯ (STORIES) */}
            {activeTab === "stories" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {stories.map((story) => (
                    <div
                      key={story.id}
                      className="glass-card rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between group"
                    >
                      <div className="relative aspect-[9/14] w-full overflow-hidden bg-slate-900">
                        <img
                          src={story.mediaUrl}
                          alt={story.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />

                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <img
                            src={story.author?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg"}
                            className="w-6 h-6 rounded-full border border-white/40"
                          />
                          <span className="text-xs font-semibold text-white drop-shadow">
                            @{story.author?.handle}
                          </span>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 space-y-1">
                          <p className="text-xs font-bold text-white line-clamp-2">
                            {story.title}
                          </p>
                          <p className="text-[10px] text-amber-400">
                            👁️ {story.viewsCount} просмотров
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-[#121722] border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {new Date(story.expiresAt) > new Date() ? "🟢 Активна" : "⚪ Завершена"}
                        </span>
                        <button
                          onClick={() => handleDeleteStory(story.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Удалить</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ВКЛАДКА 5: ПОДБОРКИ (COLLECTIONS) */}
            {activeTab === "collections" && (
              <div className="space-y-4">
                <div className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-slate-300 font-semibold border-b border-white/10">
                        <tr>
                          <th className="py-3.5 px-4">Подборка</th>
                          <th className="py-3.5 px-4">Автор</th>
                          <th className="py-3.5 px-4">Количество мест</th>
                          <th className="py-3.5 px-4">Сохранений</th>
                          <th className="py-3.5 px-4 text-right">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-200">
                        {collections.map((col) => (
                          <tr key={col.id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={col.coverPhoto}
                                  alt={col.title}
                                  className="w-12 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0"
                                />
                                <div>
                                  <p className="font-bold text-white text-sm">{col.title}</p>
                                  <p className="text-[11px] text-slate-400 truncate max-w-xs">{col.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                              @{col.author?.handle}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap text-amber-300 font-medium">
                              {col.placesCount} мест
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                              {col.savesCount}
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteCollection(col.id, col.title)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                                title="Удалить подборку"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ВКЛАДКА 6: ПОЛЬЗОВАТЕЛИ И РОЛИ (USERS) */}
            {activeTab === "users" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Поиск по имени, никнейму или email..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                  >
                    <option value="all" className="bg-[#121722]">Все роли</option>
                    <option value="USER" className="bg-[#121722]">Пользователь (USER)</option>
                    <option value="BUSINESS" className="bg-[#121722]">Бизнес (BUSINESS)</option>
                    <option value="ADMIN" className="bg-[#121722]">Администратор (ADMIN)</option>
                  </select>
                </div>

                <div className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-slate-300 font-semibold border-b border-white/10">
                        <tr>
                          <th className="py-3.5 px-4">Пользователь</th>
                          <th className="py-3.5 px-4">Email / Контакт</th>
                          <th className="py-3.5 px-4">Роль в системе</th>
                          <th className="py-3.5 px-4">Верифицированный автор</th>
                          <th className="py-3.5 px-4">Активность</th>
                          <th className="py-3.5 px-4 text-right">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-200">
                        {usersList.map((u) => (
                          <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.handle}`}
                                  alt={u.name}
                                  className="w-9 h-9 rounded-xl object-cover border border-white/10"
                                />
                                <div>
                                  <p className="font-bold text-white">{u.name}</p>
                                  <p className="text-[11px] text-amber-400">@{u.handle}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-300">
                              {u.email || u.phone || "—"}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={u.role}
                                onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                                className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                              >
                                <option value="USER" className="bg-[#121722]">Житель (USER)</option>
                                <option value="BUSINESS" className="bg-[#121722]">Бизнес (BUSINESS)</option>
                                <option value="ADMIN" className="bg-[#121722]">Админ 👑 (ADMIN)</option>
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleToggleCreatorBadge(u.id, u.isVerifiedCreator)}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                                  u.isVerifiedCreator
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                    : "bg-white/5 text-slate-400 border-white/10"
                                }`}
                              >
                                {u.isVerifiedCreator ? "⭐ Автор верифицирован" : "+ Сделать автором"}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                              {u._count?.places ?? 0} мест • {u._count?.stories ?? 0} сторис • {u._count?.collections ?? 0} подборок
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                                title="Удалить пользователя"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ВКЛАДКА 7: ВЕРИФИКАЦИЯ БИЗНЕСА (VERIFICATIONS) */}
            {activeTab === "verifications" && (
              <div className="space-y-4">
                <div className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-slate-300 font-semibold border-b border-white/10">
                        <tr>
                          <th className="py-3.5 px-4">Компания</th>
                          <th className="py-3.5 px-4">ИНН / ОГРН</th>
                          <th className="py-3.5 px-4">Пользователь</th>
                          <th className="py-3.5 px-4">Статус</th>
                          <th className="py-3.5 px-4 text-right">Решение</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-200">
                        {verifications.map((v) => (
                          <tr key={v.id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-bold text-white text-sm">{v.companyName}</p>
                              <p className="text-[11px] text-slate-400">
                                {new Date(v.createdAt).toLocaleDateString("ru-RU")}
                              </p>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <p className="font-mono text-slate-200">ИНН: {v.inn}</p>
                              {v.ogrn && <p className="font-mono text-[10px] text-slate-400">ОГРН: {v.ogrn}</p>}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <p className="font-semibold text-white">{v.user?.name}</p>
                              <p className="text-[11px] text-amber-400">@{v.user?.handle}</p>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  v.status === "VERIFIED"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : v.status === "REJECTED"
                                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                                }`}
                              >
                                {v.status === "VERIFIED" ? "✓ Одобрено" : v.status === "REJECTED" ? "✗ Отклонено" : "⏳ На рассмотрении"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                              {v.status !== "VERIFIED" && (
                                <button
                                  onClick={() => handleApproveVerification(v.id, v.companyName)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all"
                                >
                                  ✓ Одобрить
                                </button>
                              )}
                              {v.status !== "REJECTED" && (
                                <button
                                  onClick={() => handleRejectVerification(v.id)}
                                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all"
                                >
                                  ✗ Отклонить
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ВКЛАДКА 8: БАЗА ДАННЫХ (DATABASE) */}
            {activeTab === "database" && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white font-display">
                        Служба Базы Данных Mestory
                      </h2>
                      <p className="text-xs text-slate-400">
                        Prisma ORM 5 • PostgreSQL 16 (Том: mestory_postgres_data)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <p className="text-[11px] text-slate-400">Статус соединения</p>
                      <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Активно (Здорова)
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <p className="text-[11px] text-slate-400">Таблиц в схеме</p>
                      <p className="text-sm font-bold text-white">10 моделей Prisma</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <p className="text-[11px] text-slate-400">Всего записей</p>
                      <p className="text-sm font-bold text-amber-400">
                        {(stats?.places?.total || 0) + (stats?.users?.total || 0) + (stats?.content?.events || 0) + (stats?.content?.stories || 0)} объектов
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                      <p className="text-[11px] text-slate-400">Персистентность</p>
                      <p className="text-sm font-bold text-indigo-300">Docker Volume</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Модалка создания места */}
      <CreatePlaceModal
        isOpen={isCreatePlaceOpen}
        onClose={() => setIsCreatePlaceOpen(false)}
        onPlaceCreated={loadAdminData}
      />

      <AuthModal />
    </div>
  );
}
