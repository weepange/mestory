import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";

async function seed() {
  console.log("🌱 Seeding Mestory database for Rostov-on-Don...");

  // Очистка предыдущих данных
  await prisma.like.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.collectionPlace.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.post.deleteMany();
  await prisma.story.deleteMany();
  await prisma.event.deleteMany();
  await prisma.place.deleteMany();
  await prisma.businessProfile.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("mestory2026", 10);

  // 1. Создание пользователей и локальных авторов
  const authors = await Promise.all([
    prisma.user.create({
      data: {
        name: "Алексей Смирнов",
        handle: "don_foodie",
        email: "alex@mestory.city",
        passwordHash,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
        bio: "Шеф-редактор 'Гастрономический Ростов'. Знаю, где варят лучший фильтр и готовят лучшую уху на Дону.",
        role: "USER",
        isVerifiedCreator: true,
        cityId: "rostov-on-don",
        interests: JSON.stringify(["Спешелти кофе", "Завтраки весь день", "Донская кухня", "Летняя терраса", "Вино"])
      }
    }),
    prisma.user.create({
      data: {
        name: "Полина Ветрова",
        handle: "rostov_culture",
        email: "polina@mestory.city",
        passwordHash,
        avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80",
        bio: "Искусствовед, гид по тайным дворикам и мозаикам переходов Ростова. Рассказываю о выставках и архитектуре.",
        role: "USER",
        isVerifiedCreator: true,
        cityId: "rostov-on-don",
        interests: JSON.stringify(["Галерея / Выставка", "Стрит-арт", "Культура", "Уютный дворик", "Живая музыка"])
      }
    }),
    prisma.user.create({
      data: {
        name: "LEO Wine & Kitchen",
        handle: "leowinekitchen",
        email: "partner@leowine.ru",
        passwordHash,
        avatarUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80",
        bio: "Локальный сезонный ресторан на Максима Горького. 2-кратный обладатель всероссийских ресторанных премий.",
        role: "BUSINESS",
        isVerifiedCreator: true,
        cityId: "rostov-on-don",
        interests: JSON.stringify(["Авторская кухня", "Вино", "Гастрономия"])
      }
    }),
    prisma.user.create({
      data: {
        name: "Дмитрий Новиков",
        handle: "rostov_night",
        email: "dima@mestory.city",
        passwordHash,
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
        bio: "Гид по ночной жизни южной столицы. Барный критик и коллекционер винила.",
        role: "USER",
        isVerifiedCreator: true,
        cityId: "rostov-on-don",
        interests: JSON.stringify(["Авторские коктейли", "Винил", "Крафтовое пиво", "Свидание", "Для компании"])
      }
    })
  ]);

  const [authorFoodie, authorCulture, businessLeo, authorNight] = authors;

  // 2. Создание мест (Places) в Ростове-на-Дону
  const placeLeo = await prisma.place.create({
    data: {
      name: "LEO Wine & Kitchen",
      slug: "leo-wine-kitchen",
      summary: "Легендарный ресторан авторской кухни с упором на локальные донские продукты и натуральные вина.",
      description: "Один из главных гастрономических феноменов Юга России. Шеф-повар Максим Любимов каждые три недели полностью обновляет меню в зависимости от сезонности местных овощей, рыбы и трав. Атмосферное пространство в историческом особняке, безупречная винная карта и внимание к каждой детали.",
      category: "restaurant",
      cityId: "rostov-on-don",
      address: "ул. Максима Горького, 195",
      lat: 47.2274,
      lng: 39.7242,
      workingHoursText: "13:00 – 23:00 (Пн-Вс)",
      phone: "+7 (928) 296-10-88",
      website: "https://leowinekitchen.ru",
      telegram: "leowinekitchen",
      priceRange: "EXPENSIVE",
      averageCheck: "2 200 – 3 500 ₽",
      coverPhoto: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
        "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&q=80",
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80"
      ]),
      tags: JSON.stringify(["Донская кухня", "Авторская кухня", "Вино", "Свидание", "Летняя терраса"]),
      rating: 4.95,
      reviewsCount: 38,
      savesCount: 142,
      isVerifiedBusiness: true,
      businessOwnerId: businessLeo.id
    }
  });

  const placeSettlers = await prisma.place.create({
    data: {
      name: "Settlers Specialty Coffee",
      slug: "settlers-coffee",
      summary: "Минималистичный спешелти-спот на Пушкинской со свежей обжаркой, фильтром и собственной выпечкой.",
      description: "Любимое место архитекторов, дизайнеров и ценителей качественного зерна. Просторный светлый интерьер с большими окнами на тенистый бульвар Пушкинской. Здесь заваривают редкие лоты Эфиопии и Колумбии, пекут потрясающие круассаны и подают идеальные сливочные флэт-уайты.",
      category: "coffee",
      cityId: "rostov-on-don",
      address: "ул. Пушкинская, 151",
      lat: 47.2285,
      lng: 39.7271,
      workingHoursText: "08:00 – 22:00 (ежедневно)",
      phone: "+7 (903) 401-22-33",
      telegram: "settlers_rnd",
      priceRange: "BUDGET",
      averageCheck: "400 – 800 ₽",
      coverPhoto: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80",
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80",
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80"
      ]),
      tags: JSON.stringify(["Спешелти кофе", "Завтраки весь день", "Своя выпечка", "Dog friendly", "Коворкинг / Wi-Fi"]),
      rating: 4.9,
      reviewsCount: 52,
      savesCount: 210,
      isVerifiedBusiness: true
    }
  });

  const placeGavroche = await prisma.place.create({
    data: {
      name: "Бистро Гаврош",
      slug: "bistro-gavroche",
      summary: "Французское городское бистро на Пушкинской с легендарными сырниками, бенедиктами и открытой верандой.",
      description: "Классическая атмосфера парижского кафе прямо в центре Ростова. Знаменитые утренние очереди за фирменным кофе и завтраками, свежий хлеб из подовой печи, десерты и легкие европейские ланчи.",
      category: "restaurant",
      cityId: "rostov-on-don",
      address: "ул. Пушкинская, 36",
      lat: 47.2229,
      lng: 39.7042,
      workingHoursText: "08:00 – 23:00",
      priceRange: "MODERATE",
      averageCheck: "900 – 1 600 ₽",
      coverPhoto: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1200&q=80",
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1200&q=80",
        "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=1200&q=80"
      ]),
      tags: JSON.stringify(["Завтраки весь день", "Летняя терраса", "Уютный дворик", "Свидание"]),
      rating: 4.85,
      reviewsCount: 44,
      savesCount: 168,
      isVerifiedBusiness: true
    }
  });

  const placeOwGrant = await prisma.place.create({
    data: {
      name: "Спикизи-бар O.W. Grant",
      slug: "ow-grant-bar",
      summary: "Аутентичный тайный коктейльный бар с виниловым звучанием и глубокой культурой напитков.",
      description: "Бар без вывески в тихом переулке старого Ростова. Бармены подбирают авторский напиток под настроение каждого гостя. Живые джазовые джемы по четвергам и уютный полумрак.",
      category: "bar",
      cityId: "rostov-on-don",
      address: "пер. Газетный, 54",
      lat: 47.2215,
      lng: 39.7158,
      workingHoursText: "18:00 – 02:00 (Ср-Вс)",
      priceRange: "EXPENSIVE",
      averageCheck: "1 200 – 2 500 ₽",
      coverPhoto: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&q=80",
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&q=80",
        "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200&q=80"
      ]),
      tags: JSON.stringify(["Авторские коктейли", "Винил", "Живая музыка", "Свидание"]),
      rating: 4.92,
      reviewsCount: 29,
      savesCount: 185,
      isVerifiedBusiness: true
    }
  });

  const placeD50 = await prisma.place.create({
    data: {
      name: "Арт-пространство D50",
      slug: "art-space-d50",
      summary: "Главная независимая культурная площадка Ростова: выставки, лектории, маркеты и коворкинг.",
      description: "Креативный кластер в историческом особняке на Большой Садовой. Здесь проходят вернисажи современных южных художников, кинопоказы авторского кино, маркеты локальных брендов и книжный клуб.",
      category: "culture",
      cityId: "rostov-on-don",
      address: "ул. Большая Садовая, 50",
      lat: 47.2212,
      lng: 39.7120,
      workingHoursText: "11:00 – 21:00 (Вт-Вс)",
      priceRange: "BUDGET",
      averageCheck: "300 – 600 ₽",
      coverPhoto: "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=1200&q=80",
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=1200&q=80",
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80"
      ]),
      tags: JSON.stringify(["Галерея / Выставка", "Стрит-арт", "Коворкинг / Wi-Fi", "Новое открытие"]),
      rating: 4.88,
      reviewsCount: 31,
      savesCount: 195,
      isVerifiedBusiness: true
    }
  });

  const placeEmbankment = await prisma.place.create({
    data: {
      name: "Набережная реки Дон",
      slug: "don-river-embankment",
      summary: "Главная видовая артерия города: прогулки у воды, закаты, скульптуры и речные трамваи.",
      description: "Широкая благоустроенная набережная протяженностью более двух километров. Отсюда открывается вид на левый берег Дона и Ростов-Арену. Идеальное место для вечерних прогулок, пробежек и встреч с друзьями.",
      category: "parks",
      cityId: "rostov-on-don",
      address: "ул. Береговая, 23",
      lat: 47.2140,
      lng: 39.7210,
      workingHoursText: "Круглосуточно",
      priceRange: "FREE",
      averageCheck: "0 ₽",
      coverPhoto: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
      photos: JSON.stringify([
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80"
      ]),
      tags: JSON.stringify(["Вид на Дон", "Летняя терраса", "Для компании", "Свидание"]),
      rating: 4.94,
      reviewsCount: 88,
      savesCount: 310,
      isVerifiedBusiness: false
    }
  });

  // 3. Создание событий (Events)
  const event1 = await prisma.event.create({
    data: {
      title: "Гастрономический ужин 'Дары Дона и Азова' в LEO",
      slug: "gastronomic-dinner-leo",
      description: "Шеф Максим Любимов представит 7 авторских подач с пейрингом донских автохтонных вин. Локальный судак, раковые шейки, степные травы и вяленый виноград.",
      category: "restaurant",
      cityId: "rostov-on-don",
      placeId: placeLeo.id,
      placeName: placeLeo.name,
      placeAddress: placeLeo.address,
      lat: placeLeo.lat,
      lng: placeLeo.lng,
      startDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Через 2 дня
      isFree: false,
      priceText: "4 500 ₽ (дегустационный сет)",
      ticketUrl: "https://leowinekitchen.ru/events",
      coverPhoto: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
      tags: JSON.stringify(["Донская кухня", "Авторская кухня", "Вино", "Гастрономия"]),
      savesCount: 64,
      organizerId: businessLeo.id
    }
  });

  const event2 = await prisma.event.create({
    data: {
      title: "Виниловый четверг & Jazz Jam Session в O.W. Grant",
      slug: "vinyl-thursday-ow-grant",
      description: "Вечер теплого аналогового джаза и фанка на виниле. За вертушками — приглашенный селектор, специальное коктейльное меню с акцентом на южные травы.",
      category: "bar",
      cityId: "rostov-on-don",
      placeId: placeOwGrant.id,
      placeName: placeOwGrant.name,
      placeAddress: placeOwGrant.address,
      lat: placeOwGrant.lat,
      lng: placeOwGrant.lng,
      startDateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Завтра
      isFree: true,
      priceText: "Вход свободный (FC)",
      coverPhoto: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80",
      tags: JSON.stringify(["Винил", "Живая музыка", "Авторские коктейли"]),
      savesCount: 42,
      organizerId: authorNight.id
    }
  });

  const event3 = await prisma.event.create({
    data: {
      title: "Открытие выставки 'Южный авангард XXI века' в D50",
      slug: "exhibition-opening-d50",
      description: "Кураторская экскурсия, встреча с художниками Ростова и Краснодара, live-электроника и приветственный напиток для гостей вернисажа.",
      category: "culture",
      cityId: "rostov-on-don",
      placeId: placeD50.id,
      placeName: placeD50.name,
      placeAddress: placeD50.address,
      lat: placeD50.lat,
      lng: placeD50.lng,
      startDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      isFree: true,
      priceText: "Вход по регистрации",
      ticketUrl: "https://d50space.ru/art",
      coverPhoto: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&q=80",
      tags: JSON.stringify(["Галерея / Выставка", "Стрит-арт", "Культура"]),
      savesCount: 57,
      organizerId: authorCulture.id
    }
  });

  // 4. Создание Историй (Stories)
  await prisma.story.createMany({
    data: [
      {
        title: "Свежая обжарка из Кении в Settlers ☕",
        mediaUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
        mediaType: "IMAGE",
        placeId: placeSettlers.id,
        authorId: authorFoodie.id,
        cityId: "rostov-on-don",
        expiresAt: new Date(Date.now() + 36 * 60 * 60 * 1000),
        viewsCount: 184
      },
      {
        title: "Новый дегустационный сет в LEO 🍽️",
        mediaUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80",
        mediaType: "IMAGE",
        placeId: placeLeo.id,
        authorId: businessLeo.id,
        cityId: "rostov-on-don",
        expiresAt: new Date(Date.now() + 36 * 60 * 60 * 1000),
        viewsCount: 260
      },
      {
        title: "Тайный дворик на Пушкинской 🌿",
        mediaUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&q=80",
        mediaType: "IMAGE",
        placeId: placeGavroche.id,
        authorId: authorCulture.id,
        cityId: "rostov-on-don",
        expiresAt: new Date(Date.now() + 36 * 60 * 60 * 1000),
        viewsCount: 145
      },
      {
        title: "Винил готов к вечеру в O.W. Grant 🎵",
        mediaUrl: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80",
        mediaType: "IMAGE",
        placeId: placeOwGrant.id,
        authorId: authorNight.id,
        cityId: "rostov-on-don",
        expiresAt: new Date(Date.now() + 36 * 60 * 60 * 1000),
        viewsCount: 198
      }
    ]
  });

  // 5. Создание авторских подборок (Collections)
  const collection1 = await prisma.collection.create({
    data: {
      title: "Топ спешелти кофе и завтраков в Ростове",
      slug: "top-specialty-coffee-rostov",
      description: "Гид от @don_foodie: где выпить лучший фильтр, съесть горячий круассан и поработать с ноутбуком.",
      coverPhoto: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80",
      cityId: "rostov-on-don",
      isPublic: true,
      authorId: authorFoodie.id,
      savesCount: 112,
      items: {
        create: [
          { placeId: placeSettlers.id, sortOrder: 0 },
          { placeId: placeGavroche.id, sortOrder: 1 },
          { placeId: placeLeo.id, sortOrder: 2 }
        ]
      }
    }
  });

  const collection2 = await prisma.collection.create({
    data: {
      title: "Идеальный вечер: Спикизи-бары и авторский ужин",
      slug: "ideal-evening-bars-dinner",
      description: "Маршрут для незабываемого свидания или встречи с друзьями в историческом центре.",
      coverPhoto: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&q=80",
      cityId: "rostov-on-don",
      isPublic: true,
      authorId: authorNight.id,
      savesCount: 95,
      items: {
        create: [
          { placeId: placeLeo.id, sortOrder: 0 },
          { placeId: placeOwGrant.id, sortOrder: 1 },
          { placeId: placeEmbankment.id, sortOrder: 2 }
        ]
      }
    }
  });

  // 6. Создание постов / обзоров
  await prisma.post.create({
    data: {
      authorId: authorFoodie.id,
      placeId: placeLeo.id,
      rating: 5,
      content: "В LEO обновилось меню: обязательно попробуйте судака с соусом из печеных трав и донскую тарталетку. Это чистый гастрономический восторг! Бронируйте стол заранее минимум за 3-4 дня.",
      photos: JSON.stringify(["https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&q=80"]),
      tags: JSON.stringify(["Донская кухня", "Авторская кухня", "Вино"]),
      likesCount: 28,
      savesCount: 14
    }
  });

  await prisma.post.create({
    data: {
      authorId: authorCulture.id,
      placeId: placeD50.id,
      rating: 5,
      content: "Пространство D50 вдохновляет с первого шага. Очень крутая экспозиция молодых художников Юга. В коворкинге тихо и отличный естественный свет из огромных арочных окон.",
      photos: JSON.stringify(["https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=1000&q=80"]),
      tags: JSON.stringify(["Галерея / Выставка", "Культура"]),
      likesCount: 19,
      savesCount: 8
    }
  });

  // 7. Создание подписок (Follows)
  await prisma.follow.create({
    data: {
      followerId: authorCulture.id,
      followingId: authorFoodie.id
    }
  });

  await prisma.follow.create({
    data: {
      followerId: authorNight.id,
      followingId: authorFoodie.id
    }
  });

  console.log("✅ Seed completed successfully! Rostov-on-Don is fully populated.");
}

seed()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
