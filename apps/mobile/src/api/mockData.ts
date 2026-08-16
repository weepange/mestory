import { Place, CollectionItem } from "@mestory/shared";

export const MOCK_PLACES: Place[] = [
  {
    id: "p-1",
    name: "LEO Wine & Kitchen",
    slug: "leo-wine-kitchen",
    summary: "Легендарный ресторан авторской кухни с упором на локальные донские продукты и натуральные вина.",
    description: "Один из главных гастрономических феноменов Юга России. Шеф-повар Максим Любимов каждые три недели полностью обновляет меню в зависимости от сезонности местных овощей, рыбы и трав.",
    category: "restaurant",
    cityId: "rostov-on-don",
    address: "ул. Максима Горького, 195",
    lat: 47.2274,
    lng: 39.7242,
    workingHoursText: "13:00 – 23:00 (Пн-Вс)",
    phone: "+7 (928) 296-10-88",
    website: "https://leowinekitchen.ru",
    priceRange: "EXPENSIVE",
    averageCheck: "2 200 – 3 500 ₽",
    coverPhoto: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
    photos: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&q=80"
    ],
    tags: ["Донская кухня", "Авторская кухня", "Вино", "Свидание", "Летняя терраса"],
    rating: 4.95,
    reviewsCount: 38,
    savesCount: 142,
    isVerifiedBusiness: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p-2",
    name: "Settlers Specialty Coffee",
    slug: "settlers-coffee",
    summary: "Культовая кофейня третьей волны с собственным обжарочным цехом и минималистичным интерьером.",
    description: "Спешелти кофе от чемпионов обжарки. Огромные панорамные окна, фильтр-кофе на редких зернах из Эфиопии и Колумбии, знаменитые круассаны и сэндвичи.",
    category: "coffee",
    cityId: "rostov-on-don",
    address: "ул. Пушкинская, 134",
    lat: 47.2281,
    lng: 39.7215,
    workingHoursText: "08:00 – 22:00 (Ежедневно)",
    priceRange: "MODERATE",
    averageCheck: "350 – 700 ₽",
    coverPhoto: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80",
    photos: ["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80"],
    tags: ["Спешелти кофе", "Завтраки весь день", "Фильтр-кофе", "Для работы"],
    rating: 4.88,
    reviewsCount: 54,
    savesCount: 210,
    isVerifiedBusiness: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p-3",
    name: "Gavroche (Гаврош)",
    slug: "gavroche-bistro",
    summary: "Аутентичное французское брассери и кондитерская в самом сердце Пушкинского бульвара.",
    description: "Классическая парижская атмосфера, свежайшие багеты, луковый суп, яйца бенедикт и легендарный мильфей.",
    category: "restaurant",
    cityId: "rostov-on-don",
    address: "ул. Пушкинская, 36",
    lat: 47.2215,
    lng: 39.7042,
    workingHoursText: "08:00 – 00:00",
    priceRange: "EXPENSIVE",
    averageCheck: "1 500 – 2 500 ₽",
    coverPhoto: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
    photos: ["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80"],
    tags: ["Французская кухня", "Завтраки весь день", "Выпечка", "Свидание"],
    rating: 4.82,
    reviewsCount: 62,
    savesCount: 180,
    isVerifiedBusiness: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p-4",
    name: "O.W. Grant Cocktail Bar",
    slug: "ow-grant-bar",
    summary: "Спикизи-бар с новоорлеанским джазом, авторскими твистами на классику и таинственной атмосферой.",
    description: "Один из лучших баров России по версии премии Where2Drink. Вход через неприметную арку во внутренний дворик Газетного переулка.",
    category: "bar",
    cityId: "rostov-on-don",
    address: "пер. Газетный, 54/2",
    lat: 47.2238,
    lng: 39.7154,
    workingHoursText: "18:00 – 03:00 (Вт-Вс)",
    priceRange: "EXPENSIVE",
    averageCheck: "1 400 – 2 800 ₽",
    coverPhoto: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=80",
    photos: ["https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=80"],
    tags: ["Авторские коктейли", "Спикизи", "Джаз", "Свидание"],
    rating: 4.92,
    reviewsCount: 47,
    savesCount: 195,
    isVerifiedBusiness: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p-5",
    name: "Галерея D50",
    slug: "gallery-d50",
    summary: "Независимое арт-пространство современного искусства, выставки молодых южных художников и лекторий.",
    description: "Андеграундная галерея в бывшем купеческом складе. Регулярные сменяемые экспозиции, маркеты локального дизайна и кинопоказы.",
    category: "culture",
    cityId: "rostov-on-don",
    address: "ул. Большая Садовая, 50",
    lat: 47.2218,
    lng: 39.7125,
    workingHoursText: "12:00 – 21:00 (Ср-Вс)",
    priceRange: "FREE",
    averageCheck: "300 – 500 ₽",
    coverPhoto: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80",
    photos: ["https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80"],
    tags: ["Галерея / Выставка", "Современное искусство", "Стрит-арт", "Культура"],
    rating: 4.75,
    reviewsCount: 22,
    savesCount: 88,
    isVerifiedBusiness: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const MOCK_STORIES_GROUPS = [
  {
    author: {
      id: "a-1",
      name: "Алексей Смирнов",
      handle: "don_foodie",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      isVerifiedCreator: true
    },
    hasUnseen: true,
    stories: [
      {
        id: "s-1",
        title: "Топ фильтр недели в Ростове: Settlers на Пушкинской",
        mediaUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80",
        mediaType: "IMAGE",
        placeId: "p-2",
        placeName: "Settlers Specialty Coffee",
        viewsCount: 142
      },
      {
        id: "s-2",
        title: "Вечерний гастрономический сет в LEO",
        mediaUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
        mediaType: "IMAGE",
        placeId: "p-1",
        placeName: "LEO Wine & Kitchen",
        viewsCount: 98
      }
    ]
  },
  {
    author: {
      id: "a-2",
      name: "Полина Ветрова",
      handle: "rostov_culture",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80",
      isVerifiedCreator: true
    },
    hasUnseen: true,
    stories: [
      {
        id: "s-3",
        title: "Новая выставка в Галерее D50",
        mediaUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&q=80",
        mediaType: "IMAGE",
        placeId: "p-5",
        placeName: "Галерея D50",
        viewsCount: 84
      }
    ]
  },
  {
    author: {
      id: "a-3",
      name: "Дмитрий Новиков",
      handle: "rostov_night",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      isVerifiedCreator: true
    },
    hasUnseen: true,
    stories: [
      {
        id: "s-4",
        title: "Новоорлеанский джаз и коктейли в O.W. Grant",
        mediaUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=80",
        mediaType: "IMAGE",
        placeId: "p-4",
        placeName: "O.W. Grant Cocktail Bar",
        viewsCount: 112
      }
    ]
  }
];

export const MOCK_COLLECTIONS: CollectionItem[] = [
  {
    id: "c-1",
    title: "Лучший кофе и завтраки на Пушкинской",
    description: "Проверенные спешелти кофейни для утренней рутины и встреч.",
    coverPhoto: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80",
    cityId: "rostov-on-don",
    isCurated: true,
    placesCount: 4,
    savesCount: 89,
    author: {
      id: "a-1",
      name: "Алексей Смирнов",
      handle: "don_foodie",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
      isVerifiedCreator: true
    }
  }
];
