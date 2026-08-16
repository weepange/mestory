import { FastifyInstance, FastifyPluginAsync } from "fastify";
import bcrypt from "bcryptjs";
import { RegisterSchema, LoginSchema, UpdateProfileSchema } from "@mestory/shared";
import { prisma, parseJson } from "../../lib/prisma";

export const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Регистрация
  fastify.post("/register", async (request, reply) => {
    const parseResult = RegisterSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parseResult.error.flatten()
      });
    }

    const { email, phone, password, name, handle, cityId, interests } = parseResult.data;

    // Проверка уникальности
    const existingHandle = await prisma.user.findUnique({ where: { handle } });
    if (existingHandle) {
      return reply.status(409).send({ error: "Никнейм уже занят" });
    }

    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return reply.status(409).send({ error: "Email уже зарегистрирован" });
      }
    }

    if (phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone } });
      if (existingPhone) {
        return reply.status(409).send({ error: "Номер телефона уже используется" });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email || null,
        phone: phone || null,
        passwordHash,
        name,
        handle,
        cityId: cityId || "rostov-on-don",
        interests: JSON.stringify(interests || []),
        role: "USER"
      }
    });

    const token = fastify.jwt.sign(
      {
        id: user.id,
        handle: user.handle,
        role: user.role
      },
      { expiresIn: "7d" }
    );

    return reply.status(201).send({
      token,
      user: {
        id: user.id,
        name: user.name,
        handle: user.handle,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerifiedCreator: user.isVerifiedCreator,
        cityId: user.cityId,
        interests: parseJson<string[]>(user.interests, []),
        avatarUrl: user.avatarUrl,
        bio: user.bio
      }
    });
  });

  // Логин
  fastify.post("/login", async (request, reply) => {
    const parseResult = LoginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parseResult.error.flatten()
      });
    }

    const { identifier, password } = parseResult.data;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { handle: identifier },
          { phone: identifier }
        ]
      }
    });

    if (!user) {
      return reply.status(401).send({ error: "Неверный логин или пароль" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return reply.status(401).send({ error: "Неверный логин или пароль" });
    }

    const token = fastify.jwt.sign(
      {
        id: user.id,
        handle: user.handle,
        role: user.role
      },
      { expiresIn: "7d" }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        handle: user.handle,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerifiedCreator: user.isVerifiedCreator,
        cityId: user.cityId,
        interests: parseJson<string[]>(user.interests, []),
        avatarUrl: user.avatarUrl,
        bio: user.bio
      }
    };
  });

  // Быстрый вход для демо/тестирования (роли: user, creator, business)
  fastify.post("/demo-login", async (request, reply) => {
    const { role = "user" } = (request.body as { role?: string }) || {};

    let user;
    if (role === "creator") {
      user = await prisma.user.findFirst({ where: { isVerifiedCreator: true } });
    } else if (role === "business") {
      user = await prisma.user.findFirst({ where: { role: "BUSINESS" } });
    }

    if (!user) {
      user = await prisma.user.findFirst();
    }

    if (!user) {
      return reply.status(404).send({ error: "Пользователи еще не созданы (запустите сид)" });
    }

    const token = fastify.jwt.sign(
      {
        id: user.id,
        handle: user.handle,
        role: user.role
      },
      { expiresIn: "7d" }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        handle: user.handle,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerifiedCreator: user.isVerifiedCreator,
        cityId: user.cityId,
        interests: parseJson<string[]>(user.interests, []),
        avatarUrl: user.avatarUrl,
        bio: user.bio
      }
    };
  });

  // Получение текущего пользователя
  fastify.get("/me", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: "Требуется авторизация" });
    }

    const payload = request.user as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            collections: true,
            posts: true,
            bookmarks: true
          }
        }
      }
    });

    if (!user) {
      return reply.status(404).send({ error: "Пользователь не найден" });
    }

    return {
      id: user.id,
      name: user.name,
      handle: user.handle,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerifiedCreator: user.isVerifiedCreator,
      cityId: user.cityId,
      interests: parseJson<string[]>(user.interests, []),
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      collectionsCount: user._count.collections,
      reviewsCount: user._count.posts,
      bookmarksCount: user._count.bookmarks,
      createdAt: user.createdAt.toISOString()
    };
  });

  // Обновление профиля
  fastify.patch("/profile", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: "Требуется авторизация" });
    }

    const payload = request.user as { id: string };
    const parseResult = UpdateProfileSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: "Некорректные данные" });
    }

    const data = parseResult.data;
    const updated = await prisma.user.update({
      where: { id: payload.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
        ...(data.cityId && { cityId: data.cityId }),
        ...(data.interests && { interests: JSON.stringify(data.interests) })
      }
    });

    return {
      id: updated.id,
      name: updated.name,
      handle: updated.handle,
      bio: updated.bio,
      avatarUrl: updated.avatarUrl,
      cityId: updated.cityId,
      interests: parseJson<string[]>(updated.interests, [])
    };
  });
};
