import { literal, struct, sum, TypeOf } from 'io-ts/Codec';
import { NanoID } from './branded';

export const WorkoutRoute = struct({
  pathname: literal('/workout/[id]'),
  query: struct({ id: NanoID }),
});
export type WorkoutRoute = TypeOf<typeof WorkoutRoute>;

export const WorkoutPlayRoute = struct({
  pathname: literal('/workout/[id]/play'),
  query: struct({ id: NanoID }),
});
export type WorkoutPlayRoute = TypeOf<typeof WorkoutPlayRoute>;

export const Route = sum('pathname')({
  '/': struct({ pathname: literal('/') }),
  '/workout/[id]': WorkoutRoute,
  '/workout/[id]/play': WorkoutPlayRoute,
  // '/blog': struct({ pathname: literal('/blog') }),
});

export type Route = TypeOf<typeof Route>;
