import { ExecutionContext } from '@nestjs/common';

/** Matches @casl/ability's AnyObject (subject default when not narrowed). */
// I am try to install @casl/ability@6.8.0 but it is not working because it is not compatible with the nestjs version I am using.
type AnyObject = Record<PropertyKey, unknown>;

export interface SubjectHook<
  TSubject = AnyObject,
  TContext = ExecutionContext,
> {
  run: (context: TContext) => Promise<TSubject | null>;
}
