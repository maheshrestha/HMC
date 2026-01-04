import { Prisma } from '@prisma/client';

type IncludeArgs = {
  [key: string]: boolean | { where?: Record<string, unknown>; include?: IncludeArgs };
};

// Helper to apply deletedAt filter recursively
function applyIncludeFilters(include: IncludeArgs): void {
  for (const key in include) {
    const value = include[key];

    if (value === true) {
      include[key] = { where: { deletedAt: null } };
    } else if (typeof value === 'object') {
      value.where = { ...(value.where ?? {}), deletedAt: null };
      if (value.include) {
        applyIncludeFilters(value.include);
      }
    }
  }
}

// Models to skip soft-delete (e.g., Outbox)
const SKIP_SOFT_DELETE_MODELS = ['OutboxEvent'];

export const softDeleteExtension = Prisma.defineExtension(client =>
  client.$extends({
    name: 'prisma-soft-delete-extension',
    query: {
      $allModels: {
        async update({ model, args, query }) {
          if (SKIP_SOFT_DELETE_MODELS.includes(model)) {
            return query(args);
          }

          return query({
            ...args,
            where: { ...((args.where ?? {}) as Record<string, unknown>), deletedAt: null },
          });
        },
        async updateMany({ model, args, query }) {
          if (SKIP_SOFT_DELETE_MODELS.includes(model)) {
            return query(args);
          }

          return query({
            ...args,
            where: { ...((args.where ?? {}) as Record<string, unknown>), deletedAt: null },
          });
        },
        async delete({ model, args, query }) {
          if (SKIP_SOFT_DELETE_MODELS.includes(model)) {
            return query(args);
          }
          const modelClient = client[model];

          return modelClient.update({
            ...args,
            data: { deletedAt: new Date() },
          });
        },

        async deleteMany({ model, args, query }) {
          if (SKIP_SOFT_DELETE_MODELS.includes(model)) {
            return query(args);
          }

          const modelClient = client[model];

          return modelClient.updateMany({
            ...args,
            data: { deletedAt: new Date() },
          });
        },

        async findUnique({ model, args, query }) {
          if (SKIP_SOFT_DELETE_MODELS.includes(model)) {
            return query(args);
          }

          return query({
            ...args,
            where: { ...((args.where ?? {}) as Record<string, unknown>), deletedAt: null },
          });
        },
        async findUniqueOrThrow({ model, args, query }) {
          if (SKIP_SOFT_DELETE_MODELS.includes(model)) {
            return query(args);
          }

          return query({
            ...args,
            where: { ...((args.where ?? {}) as Record<string, unknown>), deletedAt: null },
          });
        },

        async findFirst({ model, args, query }) {
          if (SKIP_SOFT_DELETE_MODELS.includes(model)) {
            return query(args);
          }

          return query({
            ...args,
            where: { ...((args.where ?? {}) as Record<string, unknown>), deletedAt: null },
          });
        },
        async findFirstOrThrow({ model, args, query }) {
          if (SKIP_SOFT_DELETE_MODELS.includes(model)) {
            return query(args);
          }

          return query({
            ...args,
            where: { ...((args.where ?? {}) as Record<string, unknown>), deletedAt: null },
          });
        },

        async findMany({ model, args, query }) {
          if (SKIP_SOFT_DELETE_MODELS.includes(model)) {
            return query(args);
          }

          args.where = { ...((args.where ?? {}) as Record<string, unknown>), deletedAt: null };

          if (args.include) {
            applyIncludeFilters(args.include as IncludeArgs);
          }

          return query(args);
        },
      },
    },
  }),
);
