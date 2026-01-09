import { Prisma } from 'prisma/generated/client';

// Models to skip soft-delete (e.g., Outbox)
const SKIP_SOFT_DELETE_MODELS = ['OutboxEvent'];

export const softDeleteExtension = Prisma.defineExtension(client =>
  client.$extends({
    name: 'prisma-soft-delete-extension',
    query: {
      $allModels: {
        async update({ model, args, query }) {
          if (!SKIP_SOFT_DELETE_MODELS.includes(model)) {
            args.where = { ...args.where, deletedAt: null };
          }

          return query(args);
        },
        async updateMany({ model, args, query }) {
          if (!SKIP_SOFT_DELETE_MODELS.includes(model)) {
            args.where = { ...args.where, deletedAt: null };
          }

          return query(args);
        },
        async delete({ model, args, query }) {
          // Skip soft-delete for models in skip list
          if (SKIP_SOFT_DELETE_MODELS.includes(model)) {
            return query(args);
          }

          // Soft-delete: convert delete to update with deletedAt
          const modelClient = client[model];

          return modelClient.update({
            ...args,
            data: { deletedAt: new Date() },
          });
        },

        async deleteMany({ model, args, query }) {
          // Skip soft-delete for models in skip list
          if (SKIP_SOFT_DELETE_MODELS.includes(model)) {
            return query(args);
          }

          // Soft-delete: convert deleteMany to updateMany with deletedAt
          const modelClient = client[model];

          return modelClient.updateMany({
            ...args,
            data: { deletedAt: new Date() },
          });
        },

        async findUnique({ model, args, query }) {
          if (!SKIP_SOFT_DELETE_MODELS.includes(model)) {
            args.where = { ...args.where, deletedAt: null };
          }

          return query(args);
        },
        async findUniqueOrThrow({ model, args, query }) {
          if (!SKIP_SOFT_DELETE_MODELS.includes(model)) {
            args.where = { ...args.where, deletedAt: null };
          }

          return query(args);
        },

        async findFirst({ model, args, query }) {
          if (!SKIP_SOFT_DELETE_MODELS.includes(model)) {
            args.where = { ...args.where, deletedAt: null };
          }

          return query(args);
        },
        async findFirstOrThrow({ model, args, query }) {
          if (!SKIP_SOFT_DELETE_MODELS.includes(model)) {
            args.where = { ...args.where, deletedAt: null };
          }

          return query(args);
        },

        async findMany({ model, args, query }) {
          if (!SKIP_SOFT_DELETE_MODELS.includes(model)) {
            args.where = { ...((args.where ?? {}) as Record<string, unknown>), deletedAt: null };
          }

          return query(args);
        },
      },
    },
  }),
);
