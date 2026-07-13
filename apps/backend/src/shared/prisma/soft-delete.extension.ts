import { Prisma } from '@prisma/client';

export const softDeleteExtension = Prisma.defineExtension({
  name: 'softDelete',
  query: {
    $allModels: {
      async findMany({ model, args, query }) {
        if (model === 'User') {
          args.where = { isActive: true, ...args.where };
        }
        return query(args);
      },
      async findFirst({ model, args, query }) {
        if (model === 'User') {
          args.where = { isActive: true, ...args.where };
        }
        return query(args);
      },
      async findUnique({ model, args, query }) {
        if (model === 'User') {
          args.where = { isActive: true, ...args.where };
        }
        return query(args);
      },
      async count({ model, args, query }) {
        if (model === 'User') {
          args.where = { isActive: true, ...args.where };
        }
        return query(args);
      },
    },
  },
});
