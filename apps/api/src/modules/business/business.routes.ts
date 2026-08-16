import { FastifyPluginAsync } from "fastify";
import { prisma, parseJson } from "../../lib/prisma";

export const businessRoutes: FastifyPluginAsync = async (fastify) => {
  // Получить статистику для владельца бизнеса
  fastify.get("/dashboard", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: "Требуется авторизация" });
    }

    const payload = request.user as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        businessProfile: true,
        places: {
          include: {
            _count: { select: { stories: true, posts: true } }
          }
        }
      }
    });

    if (!user) {
      return reply.status(404).send({ error: "Пользователь не найден" });
    }

    const places = user.places.map((p) => {
      const estimatedViews = (p.savesCount * 14) + (p.reviewsCount * 28) + 120;
      const routeClicks = Math.round(estimatedViews * 0.18);
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        address: p.address,
        coverPhoto: p.coverPhoto,
        rating: p.rating,
        savesCount: p.savesCount,
        reviewsCount: p.reviewsCount,
        viewsCount: estimatedViews,
        routeClicks,
        isVerified: p.isVerifiedBusiness
      };
    });

    const totalViews = places.reduce((acc, p) => acc + p.viewsCount, 0);
    const totalSaves = places.reduce((acc, p) => acc + p.savesCount, 0);
    const totalReviews = places.reduce((acc, p) => acc + p.reviewsCount, 0);
    const totalRouteClicks = places.reduce((acc, p) => acc + p.routeClicks, 0);

    return {
      businessProfile: user.businessProfile,
      summary: {
        totalPlaces: places.length,
        totalViews,
        totalSaves,
        totalReviews,
        totalRouteClicks
      },
      places
    };
  });

  // Заявка на регистрацию бизнеса / верификацию
  fastify.post("/verify", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: "Требуется авторизация" });
    }

    const payload = request.user as { id: string };
    const { companyName, inn, ogrn, placeId } = request.body as {
      companyName: string;
      inn: string;
      ogrn?: string;
      placeId?: string;
    };

    if (!companyName || !inn) {
      return reply.status(400).send({ error: "Укажите наименование компании и ИНН" });
    }

    const profile = await prisma.businessProfile.upsert({
      where: { userId: payload.id },
      create: {
        userId: payload.id,
        companyName,
        inn,
        ogrn: ogrn || null,
        status: "VERIFIED"
      },
      update: {
        companyName,
        inn,
        ogrn: ogrn || null,
        status: "VERIFIED"
      }
    });

    await prisma.user.update({
      where: { id: payload.id },
      data: { role: "BUSINESS" }
    });

    if (placeId) {
      await prisma.place.update({
        where: { id: placeId },
        data: {
          businessOwnerId: payload.id,
          isVerifiedBusiness: true
        }
      });
    }

    return { success: true, profile };
  });
};
