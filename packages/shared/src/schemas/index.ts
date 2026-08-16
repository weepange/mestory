import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("Некорректный email").optional(),
  phone: z.string().min(10, "Некорректный номер телефона").optional(),
  password: z.string().min(6, "Пароль должен содержать не менее 6 символов"),
  name: z.string().min(2, "Имя должно быть от 2 символов"),
  handle: z
    .string()
    .min(3, "Никнейм от 3 символов")
    .regex(/^[a-zA-Z0-9_]+$/, "Только латинские буквы, цифры и _"),
  cityId: z.string().optional().default("rostov-on-don"),
  interests: z.array(z.string()).optional().default([])
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  identifier: z.string().min(3, "Укажите email, телефон или логин"),
  password: z.string().min(1, "Введите пароль")
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(300).optional(),
  avatarUrl: z.string().url().optional(),
  interests: z.array(z.string()).optional(),
  cityId: z.string().optional()
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;

export const CreatePlaceSchema = z.object({
  name: z.string().min(2, "Название обязательно"),
  summary: z.string().min(10, "Краткое описание обязательно"),
  description: z.string().min(20, "Полное описание обязательно"),
  category: z.enum([
    "coffee",
    "restaurant",
    "bar",
    "culture",
    "parks",
    "events",
    "activity"
  ]),
  cityId: z.string().default("rostov-on-don"),
  address: z.string().min(5, "Адрес обязателен"),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  workingHoursText: z.string().min(3),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  telegram: z.string().optional(),
  vk: z.string().optional(),
  priceRange: z.enum(["FREE", "BUDGET", "MODERATE", "EXPENSIVE", "LUXURY"]).default("MODERATE"),
  averageCheck: z.string().optional(),
  photos: z.array(z.string()).min(1, "Добавьте минимум 1 фото"),
  coverPhoto: z.string().min(1),
  tags: z.array(z.string()).default([])
});

export type CreatePlaceDto = z.infer<typeof CreatePlaceSchema>;

export const CreateEventSchema = z.object({
  title: z.string().min(3, "Название события обязательно"),
  description: z.string().min(20, "Описание обязательно"),
  category: z.enum([
    "coffee",
    "restaurant",
    "bar",
    "culture",
    "parks",
    "events",
    "activity"
  ]),
  cityId: z.string().default("rostov-on-don"),
  placeId: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  startDateTime: z.string(),
  endDateTime: z.string().optional(),
  isFree: z.boolean().default(false),
  priceText: z.string().default("Вход свободный"),
  ticketUrl: z.string().url().optional().or(z.literal("")),
  coverPhoto: z.string().min(1),
  tags: z.array(z.string()).default([])
});

export type CreateEventDto = z.infer<typeof CreateEventSchema>;

export const CreateStorySchema = z.object({
  title: z.string().min(2),
  mediaUrl: z.string().min(1),
  mediaType: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  placeId: z.string().optional(),
  eventId: z.string().optional(),
  cityId: z.string().default("rostov-on-don")
});

export type CreateStoryDto = z.infer<typeof CreateStorySchema>;

export const CreateCollectionSchema = z.object({
  title: z.string().min(3, "Название подборки обязательно"),
  description: z.string().min(10, "Описание обязательно"),
  coverPhoto: z.string().min(1),
  cityId: z.string().default("rostov-on-don"),
  isPublic: z.boolean().default(true),
  placeIds: z.array(z.string()).default([])
});

export type CreateCollectionDto = z.infer<typeof CreateCollectionSchema>;

export const CreatePostSchema = z.object({
  placeId: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  content: z.string().min(10, "Текст публикации от 10 символов"),
  photos: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([])
});

export type CreatePostDto = z.infer<typeof CreatePostSchema>;

export const ToggleBookmarkSchema = z.object({
  targetType: z.enum(["PLACE", "EVENT", "COLLECTION"]),
  targetId: z.string(),
  folderName: z.string().default("Избранное")
});

export type ToggleBookmarkDto = z.infer<typeof ToggleBookmarkSchema>;
