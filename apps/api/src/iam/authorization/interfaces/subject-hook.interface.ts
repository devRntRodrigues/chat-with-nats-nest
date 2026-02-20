import { ExecutionContext } from '@nestjs/common';

export interface SubjectHook<TSubject = unknown> {
  run(context: ExecutionContext): Promise<TSubject | null>;
}
