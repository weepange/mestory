import { FastifyPluginAsync } from "fastify";
import { prisma, parseJson } from "../../lib/prisma";

export const usersRoutes: FastifyPluginAsync = async (fastify) => {
  // Список авторов / создателей контента города
  fastify.get("/authors", async (request) => {
    const query = request.query as { cityId?: string };
    const cityId = query.cityId || "rostov-on-don";

    const authors = await prisma.user.findMany({
      where: {
        cityId,
        isVerifiedCreator: true
      },
      include: {
        _count: {
          select: { followers: true, collections: true, posts: true }
        }
      }
    });

    return {
      items: authors.map((a) => ({
        id: a.id,
        name: a.name,
        handle: a.handle,
        avatarUrl: a.avatarUrl,
        bio: a.bio,
        isVerifiedCreator: a.isVerifiedCreator,
        cityId: a.cityId,
        interests: parseJson<string[]>(a.interests, []),
        followersCount: a._count.followers,
        collectionsCount: a._count.collections,
        reviewsCount: a._count.posts
      }))
    };
  });

  // Публичный профиль автора/пользователя по handle или ID
  fastify.get("/:handleOrId", async (request, reply) => {
    const { handleOrId } = request.params as { handleOrId: string };

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id: handleOrId }, { handle: handleOrId }]
      },
      include: {
        _count: {
          select: { followers: true, following: true, collections: true, posts: true }
        },
        collections: {
          where: { isPublic: true },
          include: {
            items: { include: { place: true } }
          }
        },
        posts: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: { place: true }
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
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      role: user.role,
      isVerifiedCreator: user.isVerifiedCreator,
      cityId: user.cityId,
      interests: parseJson<string[]>(user.interests, []),
      followersCount: user._count.followers,
      followingCount: user._count.following,
      collectionsCount: user._count.collections,
      reviewsCount: user._count.posts,
      collections: user.collections.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        coverPhoto: c.coverPhoto,
        placesCount: c.items.length,
        savesCount: c.savesCount
      })),
      posts: user.posts.map((p) => ({
        id: p.id,
        content: p.content,
        rating: p.rating,
        photos: parseJson<string[]>(p.photos, []),
        place: p.place ? { id: p.place.id, name: p.place.name, address: p.place.address } : null,
        likesCount: p.likesCount,
        createdAt: p.createdAt.toISOString()
      })),
      createdAt: user.createdAt.toISOString()
    };
  });

  // Подписка / отписка от автора
  fastify.post("/:id/follow", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: "Требуется авторизация" });
    }

    const { id: followingId } = request.params as { id: string };
    const payload = request.user as { id: string };

    if (payload.id === followingId) {
      return reply.status(400).send({ error: "Нельзя подписаться на самого себя" });
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: payload.id,
          followingId
        }
      }
    });

    if (existing) {
      await prisma.follow.delete({
        where: { id: existing.id }
      });
      return { following: false };
    } else {
      await prisma.follow.create({
        data: {
          followerId: payload.id,
          followingId
        }
      });
      return { following: true };
    }
  });
};
