export const CITIES = [
  {
    id: "rostov-on-don",
    name: "Ростов-на-Дону",
    shortName: "Ростов",
    region: "Ростовская область",
    center: {
      lat: 47.2225,
      lng: 39.7187
    },
    defaultZoom: 13,
    isDefault: true
  },
  {
    id: "moscow",
    name: "Москва",
    shortName: "Москва",
    region: "Москва",
    center: {
      lat: 55.7558,
      lng: 37.6173
    },
    defaultZoom: 12,
    isDefault: false
  },
  {
    id: "saint-petersburg",
    name: "Санкт-Петербург",
    shortName: "Петербург",
    region: "Санкт-Петербург",
    center: {
      lat: 59.9343,
      lng: 30.3351
    },
    defaultZoom: 12,
    isDefault: false
  },
  {
    id: "krasnodar",
    name: "Краснодар",
    shortName: "Краснодар",
    region: "Краснодарский край",
    center: {
      lat: 45.0355,
      lng: 38.9753
    },
    defaultZoom: 13,
    isDefault: false
  }
] as const;

export type CityId = (typeof CITIES)[number]["id"];

export const PLACE_CATEGORIES = [
  {
    id: "coffee",
    label: "Спешелти кофе",
    icon: "☕",
    color: "#F59E0B",
    description: "Кофейни третьей волны, свежая обжарка, десерты и уютные завтраки"
  },
  {
    id: "restaurant",
    label: "Рестораны и гастрономия",
    icon: "🍽️",
    color: "#EF4444",
    description: "Авторская кухня, гастробистро, локальные донские блюда и ужины"
  },
  {
    id: "bar",
    label: "Бары и коктейли",
    icon: "🍸",
    color: "#8B5CF6",
    description: "Спикизи-бары, крафтовые пабы, винные споты и вечерняя атмосфера"
  },
  {
    id: "culture",
    label: "Культура и арт",
    icon: "🎨",
    color: "#3B82F6",
    description: "Галереи, независимые театры, арт-кластеры, лектории и музеи"
  },
  {
    id: "parks",
    label: "Парки и набережные",
    icon: "🌿",
    color: "#10B981",
    description: "Зеленые зоны, набережная Дона, видовые точки и прогулочные улицы"
  },
  {
    id: "events",
    label: "События и вечеринки",
    icon: "🎉",
    color: "#EC4899",
    description: "Концерты, фестивали, маркеты, кинопоказы и открытые лекции"
  },
  {
    id: "activity",
    label: "Досуг и спорт",
    icon: "⚡",
    color: "#06B6D4",
    description: "Скейт-парки, яхтинг на Дону, сап-борды, студии и пространства"
  }
] as const;

export type PlaceCategoryId = (typeof PLACE_CATEGORIES)[number]["id"];

export const POPULAR_TAGS = [
  "Завтраки весь день",
  "Спешелти кофе",
  "Летняя терраса",
  "Вид на Дон",
  "Dog friendly",
  "Живая музыка",
  "Винил",
  "Крафтовое пиво",
  "Авторские коктейли",
  "Донская кухня",
  "Коворкинг / Wi-Fi",
  "Стрит-арт",
  "Уютный дворик",
  "Свидание",
  "Для компании",
  "Новое открытие",
  "Своя выпечка",
  "Галерея / Выставка"
] as const;

export const PRICE_RANGES = [
  { id: "FREE", label: "Бесплатно", symbol: "Бесплатно" },
  { id: "BUDGET", label: "До 700 ₽", symbol: "₽" },
  { id: "MODERATE", label: "700 – 1 500 ₽", symbol: "₽₽" },
  { id: "EXPENSIVE", label: "1 500 – 3 000 ₽", symbol: "₽₽₽" },
  { id: "LUXURY", label: "От 3 000 ₽", symbol: "₽₽₽₽" }
] as const;
