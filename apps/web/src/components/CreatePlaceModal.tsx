"use client";

import React, { useState } from "react";
import { X, Sparkles, MapPin, Camera, Tag, Clock, DollarSign } from "lucide-react";
import { PLACE_CATEGORIES, POPULAR_TAGS, PlaceCategoryId } from "@mestory/shared";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface CreatePlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceCreated?: () => void;
}

export function CreatePlaceModal({
  isOpen,
  onClose,
  onPlaceCreated
}: CreatePlaceModalProps) {
  const { selectedCity } = useAuth();

  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<PlaceCategoryId>("coffee");
  const [address, setAddress] = useState("ул. Пушкинская, ");
  const [workingHoursText, setWorkingHoursText] = useState("09:00 – 22:00");
  const [coverPhoto, setCoverPhoto] = useState(
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80"
  );
  const [averageCheck, setAverageCheck] = useState("500 – 1 000 ₽");
  const [tags, setTags] = useState<string[]>(["Спешелти кофе", "Завтраки весь день"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleTag = (t: string) => {
    if (tags.includes(t)) {
      setTags(tags.filter((item) => item !== t));
    } else {
      setTags([...tags, t]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Примерные координаты в центре Ростова с небольшим рандомом для маркера
      const lat = 47.2225 + (Math.random() - 0.5) * 0.02;
      const lng = 39.7187 + (Math.random() - 0.5) * 0.02;

      await api.createPlace({
        name,
        summary,
        description,
        category,
        cityId: selectedCity.id,
        address,
        lat,
        lng,
        workingHoursText,
        averageCheck,
        coverPhoto,
        photos: [coverPhoto],
        tags,
        priceRange: "MODERATE"
      });

      onPlaceCreated?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Ошибка при добавлении места");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#121722] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">
              Добавить новое место
            </h2>
            <p className="text-xs text-slate-400">
              Поделитесь классным заведением в г. {selectedCity.name}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-slate-200">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Название заведения</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Кофейня / Бар / Галерея"
              className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Категория</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PlaceCategoryId)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-amber-400"
            >
              {PLACE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Краткое описание (слоган)</label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Уютный дворик со спешелти кофе и винилом"
              className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Подробный обзор</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Расскажите об атмосфере, кухне, напитках и почему это место стоит посетить..."
              className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Адрес</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Режим работы</label>
              <input
                type="text"
                value={workingHoursText}
                onChange={(e) => setWorkingHoursText(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Фотография (URL обложки)</label>
            <input
              type="url"
              value={coverPhoto}
              onChange={(e) => setCoverPhoto(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="font-semibold text-amber-300">Теги и особенности:</label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {POPULAR_TAGS.map((tag) => {
                const isSelected = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-0.5 rounded-full text-[11px] border transition-all ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 border-amber-400 font-bold"
                        : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold hover:from-amber-400 hover:to-amber-500 shadow-glowAmber disabled:opacity-50"
            >
              {isSubmitting ? "Добавление..." : "Опубликовать место"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
