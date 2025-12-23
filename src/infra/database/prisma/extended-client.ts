import { PrismaClient } from 'prisma/generated/client';
import { prismaErrorExtension } from './extensions/prisma-error.extension';
import { softDeleteExtension } from './extensions/prisma-soft-delete.extension';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const extendClient = (client: PrismaClient) =>
  client.$extends(prismaErrorExtension).$extends(softDeleteExtension);

class UntypedExtendedClient extends PrismaClient {
  constructor(options?: ConstructorParameters<typeof PrismaClient>[0]) {
    super(options);

    return extendClient(this) as this;
  }
}

export const ExtendedPrismaClient = UntypedExtendedClient as new (
  options?: ConstructorParameters<typeof PrismaClient>[0],
) => ReturnType<typeof extendClient>;
