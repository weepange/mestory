"use client";

import React, { useState } from "react";
import { X, Sparkles, User, Lock, Mail, Phone, AtSign, Check } from "lucide-react";
import { POPULAR_TAGS } from "@mestory/shared";
import { useAuth } from "@/lib/auth-context";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, register, demoLogin, selectedCity } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");

  // Form states
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const toggleInterest = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(selectedInterests.filter((t) => t !== tag));
    } else {
      setSelectedInterests([...selectedInterests, tag]);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ identifier, password });
    } catch (err: any) {
      setError(err.message || "Ошибка входа");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({
        name,
        handle: handle.replace("@", "").trim(),
        email: email || undefined,
        phone: phone || undefined,
        password,
        cityId: selectedCity.id,
        interests: selectedInterests
      });
    } catch (err: any) {
      setError(err.message || "Ошибка регистрации");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#121722] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto"
      >
        {/* Кнопка закрытия */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Заголовок */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-500 mx-auto flex items-center justify-center shadow-glowAmber mb-2">
            <Sparkles className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="text-xl font-bold text-white font-display">
            Добро пожаловать в Mestory
          </h2>
          <p className="text-xs text-slate-400">
            Городские рекомендации, истории и ваши любимые места
          </p>
        </div>

        {/* Быстрый демо-вход в 1 клик */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
          <p className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider text-center">
            Быстрый вход для проверки (1 клик):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => demoLogin("user")}
              className="px-2 py-2 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white text-[11px] font-semibold transition-all text-center"
            >
              Житель
            </button>
            <button
              onClick={() => demoLogin("creator")}
              className="px-2 py-2 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white text-[11px] font-semibold transition-all text-center"
            >
              Автор ⭐
            </button>
            <button
              onClick={() => demoLogin("business")}
              className="px-2 py-2 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white text-[11px] font-semibold transition-all text-center"
            >
              Бизнес 🏢
            </button>
            <button
              onClick={() => demoLogin("admin")}
              className="px-2 py-2 rounded-xl bg-amber-500/30 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all text-center shadow"
            >
              Админ 👑
            </button>
          </div>
        </div>

        {/* Переключатель Вход / Регистрация */}
        <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === "login"
                ? "bg-amber-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Войти
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === "register"
                ? "bg-amber-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Регистрация
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Форма Входа */}
        {tab === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">
                Email, логин или телефон
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="don_foodie или alex@mestory.city"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-glowAmber transition-all active:scale-98 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? "Вход..." : "Войти в Mestory"}
            </button>
          </form>
        ) : (
          /* Форма Регистрации */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Ваше имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Анна Смирнова"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Никнейм (@handle)</label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="anna_rostov"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anna@mail.ru"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Телефон</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 999 000-00-00"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            {/* Выбор интересов для персонализации ленты */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-amber-300">
                Ваши интересы (для умной ленты):
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
                {POPULAR_TAGS.slice(0, 10).map((tag) => {
                  const isSelected = selectedInterests.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterest(tag)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1 ${
                        isSelected
                          ? "bg-amber-500 text-slate-950 border-amber-400 font-bold"
                          : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-glowAmber transition-all active:scale-98 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
