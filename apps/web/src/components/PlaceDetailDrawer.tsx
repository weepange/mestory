"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  Send,
  Navigation,
  Bookmark,
  Share2,
  CheckCircle2,
  MessageSquare,
  Plus,
  Sparkles,
  Car
} from "lucide-react";
import { Place, PLACE_CATEGORIES } from "@mestory/shared";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface PlaceDetailDrawerProps {
  placeId: string | null;
  onClose: () => void;
}

export function PlaceDetailDrawer({ placeId, onClose }: PlaceDetailDrawerProps) {
  const { user, openAuthModal } = useAuth();
  const [place, setPlace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  // Форма отзыва
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewPhoto, setReviewPhoto] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!placeId) return;
    setIsLoading(true);
    api
      .getPlace(placeId)
      .then((data) => {
        setPlace(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [placeId]);

  if (!placeId) return null;

  const category = place ? PLACE_CATEGORIES.find((c) => c.id === place.category) : null;
  const photos = place?.photos?.length > 0 ? place.photos : place?.coverPhoto ? [place.coverPhoto] : [];

  const handleBookmarkToggle = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      const res = await api.toggleBookmark("PLACE", place.id);
      setIsSaved(res.saved);
      if (place) {
        setPlace({
          ...place,
          savesCount: res.saved ? place.savesCount + 1 : Math.max(0, place.savesCount - 1)
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!reviewText.trim()) return;

    setIsSubmittingReview(true);
    try {
      const post = await api.createPost({
        placeId: place.id,
        rating: reviewRating,
        content: reviewText,
        photos: reviewPhoto ? [reviewPhoto] : []
      });

      setPlace((prev: any) => ({
        ...prev,
        reviewsCount: prev.reviewsCount + 1,
        reviews: [
          {
            id: post.id,
            author: user,
            rating: reviewRating,
            content: reviewText,
            photos: reviewPhoto ? [reviewPhoto] : [],
            likesCount: 0,
            createdAt: new Date().toISOString()
          },
          ...(prev.reviews || [])
        ]
      }));

      setReviewText("");
      setReviewPhoto("");
      setIsAddingReview(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const yandexRouteUrl = place
    ? `https://yandex.ru/maps/?rtext=~${place.lat},${place.lng}&rtt=auto`
    : "#";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-md flex justify-end">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl h-full bg-[#10141C] border-l border-white/10 shadow-2xl flex flex-col overflow-y-auto"
      >
        {/* Кнопка закрытия */}
        <div className="sticky top-0 z-30 p-4 flex items-center justify-between glass-panel border-b border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{category?.icon}</span>
              <span>{place?.name || "Загрузка..."}</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-12 text-slate-400">
            <div className="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full mb-3" />
          </div>
        ) : place ? (
          <div className="p-6 space-y-6">
            {/* Главная галерея */}
            <div className="space-y-3">
              <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden bg-slate-900 shadow-xl">
                <img
                  src={photos[activePhoto]}
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-amber-400 font-bold text-sm border border-white/10">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{place.rating.toFixed(1)}</span>
                    <span className="text-white/60 text-xs font-normal">
                      ({place.reviewsCount} отзывов)
                    </span>
                  </div>

                  {place.isVerifiedBusiness && (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold backdrop-blur-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Верифицировано
                    </span>
                  )}
                </div>
              </div>

              {/* Миниатюры фото */}
              {photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {photos.map((ph: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhoto(idx)}
                      className={`w-20 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activePhoto === idx
                          ? "border-amber-400 scale-105"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={ph} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Название и быстрое действие */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white font-display">
                  {place.name}
                </h1>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                  {place.summary}
                </p>
              </div>

              <button
                onClick={handleBookmarkToggle}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                  isSaved
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-glowAmber"
                    : "bg-white/10 hover:bg-white/15 text-white border-white/10"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-slate-950" : ""}`} />
                <span>{isSaved ? "В закладках" : "Сохранить"}</span>
              </button>
            </div>

            {/* Кнопки вызова маршрута и Яндекс.Карт */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={yandexRouteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-glowAmber transition-all active:scale-98"
              >
                <Navigation className="w-4 h-4 fill-slate-950" />
                <span>Построить маршрут в Яндекс.Картах</span>
              </a>

              <div className="flex items-center justify-between px-4 py-3 rounded-2xl glass-card text-xs text-slate-300">
                <span className="text-slate-400">Средний чек:</span>
                <span className="font-semibold text-amber-300">
                  {place.averageCheck || "от 800 ₽"}
                </span>
              </div>
            </div>

            {/* Детали: Адрес, Время работы, Контакты */}
            <div className="glass-card rounded-3xl p-5 space-y-3.5 text-xs text-slate-200">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">{place.address}</p>
                  <p className="text-slate-400 text-[11px]">Ростов-на-Дону</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-medium text-white">{place.workingHoursText}</span>
                </div>
              </div>

              {place.phone && (
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <Phone className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <a href={`tel:${place.phone}`} className="hover:text-amber-400 transition-colors">
                    {place.phone}
                  </a>
                </div>
              )}

              {place.telegram && (
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <Send className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <a
                    href={`https://t.me/${place.telegram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-400 transition-colors"
                  >
                    @{place.telegram}
                  </a>
                </div>
              )}

              {place.website && (
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <Globe className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-400 transition-colors truncate"
                  >
                    {place.website}
                  </a>
                </div>
              )}
            </div>

            {/* Полное описание */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                О заведении
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {place.description}
              </p>
            </div>

            {/* Теги */}
            {place.tags && place.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  Особенности
                </h3>
                <div className="flex flex-wrap gap-2">
                  {place.tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-white/5 text-slate-200 border border-white/10 text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Отзывы и обзоры жителей / авторов */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    Отзывы и рекомендации ({place.reviews?.length || 0})
                  </h3>
                </div>

                <button
                  onClick={() => {
                    if (!user) {
                      openAuthModal();
                    } else {
                      setIsAddingReview(!isAddingReview);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Оставить отзыв</span>
                </button>
              </div>

              {/* Форма добавления отзыва */}
              {isAddingReview && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="p-4 rounded-2xl glass-panel border border-amber-500/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-semibold">Ваша оценка:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= reviewRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-600"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Поделитесь впечатлениями, любимыми блюдами или атмосферой..."
                    rows={3}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                    required
                  />

                  <input
                    type="url"
                    value={reviewPhoto}
                    onChange={(e) => setReviewPhoto(e.target.value)}
                    placeholder="Ссылка на фото (необязательно, например Unsplash URL)"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingReview(false)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 text-xs text-slate-300 hover:bg-white/10"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 disabled:opacity-50"
                    >
                      {isSubmittingReview ? "Публикация..." : "Опубликовать"}
                    </button>
                  </div>
                </form>
              )}

              {/* Список отзывов */}
              {place.reviews && place.reviews.length > 0 ? (
                <div className="space-y-3">
                  {place.reviews.map((rev: any) => (
                    <div key={rev.id} className="p-4 rounded-2xl glass-card space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              rev.author.avatarUrl ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
                            }
                            alt={rev.author.name}
                            className="w-7 h-7 rounded-full object-cover border border-amber-400/40"
                          />
                          <div>
                            <span className="text-xs font-semibold text-white block">
                              {rev.author.name}
                            </span>
                            <span className="text-[11px] text-amber-300">
                              @{rev.author.handle}
                            </span>
                          </div>
                        </div>

                        {rev.rating && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{rev.rating}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {rev.content}
                      </p>

                      {rev.photos && rev.photos.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pt-1">
                          {rev.photos.map((ph: string, pIdx: number) => (
                            <img
                              key={pIdx}
                              src={ph}
                              alt=""
                              className="w-20 h-20 rounded-xl object-cover border border-white/10"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl glass-card text-center text-slate-400 text-xs">
                  Пока нет отзывов. Будьте первым, кто поделится впечатлениями!
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">Место не найдено</div>
        )}
      </div>
    </div>
  );
}
