import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { BookingStatus, UserRole } from '@prisma/client';

const createBookingSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  startsAt: z.string().datetime('Invalid date format'),
  notes: z.string().optional(),
});

const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
});

const bookingQuerySchema = z.object({
  userId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  status: z.nativeEnum(BookingStatus).optional(),
});

async function checkBookingOverlap(
  serviceId: string,
  startsAt: Date,
  endsAt: Date,
  excludeBookingId?: string,
): Promise<boolean> {
  const overlapping = await prisma.booking.findFirst({
    where: {
      serviceId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      status: { not: BookingStatus.CANCELED },
      OR: [
        {
          startsAt: { lte: startsAt },
          endsAt: { gt: startsAt },
        },
        {
          startsAt: { lt: endsAt },
          endsAt: { gte: endsAt },
        },
        {
          startsAt: { gte: startsAt },
          endsAt: { lte: endsAt },
        },
      ],
    },
  });

  return !!overlapping;
}

export async function bookingsRoutes(fastify: FastifyInstance) {
  // POST /api/bookings (CLIENT/ADMIN)
  fastify.post(
    '/bookings',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = createBookingSchema.parse(request.body);
      const user = request.user as { userId: string; email: string; role: UserRole };
      const userId = user.userId;

      const service = await prisma.service.findUnique({
        where: { id: body.serviceId },
      });

      if (!service) {
        return reply.code(404).send({ error: 'Service not found' });
      }

      if (!service.active) {
        return reply.code(400).send({ error: 'Service is not active' });
      }

      const startsAt = new Date(body.startsAt);
      const endsAt = new Date(startsAt.getTime() + service.durationMin * 60 * 1000);

      if (startsAt < new Date()) {
        return reply.code(400).send({ error: 'Cannot book in the past' });
      }

      const hasOverlap = await checkBookingOverlap(service.id, startsAt, endsAt);
      if (hasOverlap) {
        return reply.code(409).send({ error: 'Booking time overlaps with existing booking' });
      }

      const booking = await prisma.booking.create({
        data: {
          userId,
          serviceId: service.id,
          startsAt,
          endsAt,
          notes: body.notes,
          status: BookingStatus.PENDING,
        },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              durationMin: true,
              priceCents: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return reply.code(201).send({
        id: booking.id,
        userId: booking.userId,
        serviceId: booking.serviceId,
        service: booking.service,
        startsAt: booking.startsAt,
        endsAt: booking.endsAt,
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt,
      });
    },
  );

  // GET /api/bookings
  fastify.get(
    '/bookings',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as { userId: string; email: string; role: UserRole };
      const query = bookingQuerySchema.parse(request.query);

      const where: any = {};

      if (user.role === UserRole.CLIENT) {
        where.userId = user.userId;
      } else if (query.userId) {
        where.userId = query.userId;
      }

      if (query.dateFrom || query.dateTo) {
        where.startsAt = {};
        if (query.dateFrom) {
          where.startsAt.gte = new Date(query.dateFrom);
        }
        if (query.dateTo) {
          where.startsAt.lte = new Date(query.dateTo);
        }
      }

      if (query.status) {
        where.status = query.status;
      }

      const bookings = await prisma.booking.findMany({
        where,
        orderBy: { startsAt: 'desc' },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              durationMin: true,
              priceCents: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return reply.send(
        bookings.map((booking) => ({
          id: booking.id,
          userId: booking.userId,
          serviceId: booking.serviceId,
          service: booking.service,
          user: booking.user,
          startsAt: booking.startsAt,
          endsAt: booking.endsAt,
          status: booking.status,
          notes: booking.notes,
          createdAt: booking.createdAt,
        })),
      );
    },
  );

  // PUT /api/bookings/:id/status
  fastify.put(
    '/bookings/:id/status',
    {
      preHandler: [fastify.authenticate],
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const params = z.object({ id: z.string() }).parse(request.params);
      const body = updateBookingStatusSchema.parse(request.body);
      const user = request.user as { userId: string; email: string; role: UserRole };

      const booking = await prisma.booking.findUnique({
        where: { id: params.id },
        include: {
          service: true,
        },
      });

      if (!booking) {
        return reply.code(404).send({ error: 'Booking not found' });
      }

      const isOwner = booking.userId === user.userId;
      const isAdmin = user.role === UserRole.ADMIN;

      if (!isOwner && !isAdmin) {
        return reply.code(403).send({ error: 'Forbidden' });
      }

      if (body.status === BookingStatus.CANCELED && !isAdmin && !isOwner) {
        return reply.code(403).send({ error: 'Only owner or admin can cancel booking' });
      }

      if (booking.status === BookingStatus.CANCELED) {
        return reply.code(400).send({ error: 'Cannot update canceled booking' });
      }

      const updatedBooking = await prisma.booking.update({
        where: { id: params.id },
        data: { status: body.status },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              durationMin: true,
              priceCents: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return reply.send({
        id: updatedBooking.id,
        userId: updatedBooking.userId,
        serviceId: updatedBooking.serviceId,
        service: updatedBooking.service,
        user: updatedBooking.user,
        startsAt: updatedBooking.startsAt,
        endsAt: updatedBooking.endsAt,
        status: updatedBooking.status,
        notes: updatedBooking.notes,
        createdAt: updatedBooking.createdAt,
      });
    },
  );
}
