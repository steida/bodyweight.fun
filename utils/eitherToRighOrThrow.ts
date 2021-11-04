import { either } from 'fp-ts';
import { Either } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

/**
 * Extract the right from Either or throw.
 * Remember, the app should never throws. This is for:
 *  1) Tests. It's like ruins-ts. Tests throw. That's fine.
 *  2) When we need a hard-coded value. For example:
 *  `export const emptyString32 = eitherToRightOrThrow(String32.decode(''))`
 *  Casting via 'as' is an anti-pattern. It's like `any`.
 *  eitherToRightOrThrow is safe for top-level code only.
 *  It's OK to throw when an app is starting.
 */
export const eitherToRightOrThrow = <R>(e: Either<unknown, R>): R =>
  pipe(
    e,
    either.getOrElseW(() => {
      throw new Error();
    }),
  );
