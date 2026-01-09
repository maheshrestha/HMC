import {
  ForeignKeyViolationError,
  InvalidValueError,
  JsonParsingError,
  RecordNotFoundError,
  ValueTooLongError,
} from '@src/common/errors/prisma';
import { UniqueFieldError } from '@src/common/errors/prisma/unique-field.error';
import { Prisma } from 'prisma/generated/client';

export const prismaErrorExtension = Prisma.defineExtension({
  name: 'prisma-error-extension',
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        try {
          return await query(args);
        } catch (e: unknown) {
          if (e instanceof Prisma.PrismaClientKnownRequestError) {
            let field = e.meta?.target?.[0];

            // If target is not in meta, try to extract from error message
            if (!field && e.code === 'P2002') {
              const match = e.message.match(/fields?: \(`"?([^`"]+)"?`\)/);
              field = match ? match[1] : null;
            }

            switch (e.code) {
              case 'P2002':
                if (field) {
                  throw new UniqueFieldError(field);
                }
                break;
              case 'P2003':
                throw new ForeignKeyViolationError();
              case 'P2025':
                throw new RecordNotFoundError();
              case 'P2000':
                if (field) {
                  throw new ValueTooLongError(field);
                }
                break;
              case 'P2005':
                if (field) {
                  throw new InvalidValueError(field);
                }
                break;
              case 'P2020':
                if (field) {
                  throw new JsonParsingError(field);
                }
                break;
              // Add more mappings as needed
            }
          }
          throw e; // bubble unknown errors
        }
      },
    },
  },
});
