import mongoose, { Connection } from 'mongoose';
import { ClientSessionOptions } from 'mongoose';

export const TRANSACTION_DEFAULT_CONFIG: ClientSessionOptions = {
  defaultTransactionOptions: {
    readPreference: 'primary',
    readConcern: { level: 'local' },
    writeConcern: { w: 'majority' },
    maxTimeMS: 50,
  },
};

type TransactionFn<T> = (
  transaction: mongoose.mongo.ClientSession,
) => Promise<T>;

export async function runInDBTransaction<R>(
  connection: Connection,
  cb: TransactionFn<R>,
): Promise<R> {
  const session = await connection.startSession(TRANSACTION_DEFAULT_CONFIG);

  let result: R = null as R;

  try {
    await session.withTransaction(async () => {
      result = await cb(session);
    });
  } finally {
    await session.endSession();
  }

  return result;
}
