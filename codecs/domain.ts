import { ReadonlyNonEmptyArray } from 'fp-ts/lib/ReadonlyNonEmptyArray';
import { struct, TypeOf } from 'io-ts/Codec';
import { NanoID, String1024, String32 } from './branded';
import { DateFromNumber } from './DateFromNumber';

export type Exercise = Readonly<
  | { type: 'noParams'; name: string }
  | { type: 'seconds'; name: string; seconds: number }
  | { type: 'minutes'; name: string; minutes: number }
  | { type: 'repetitions'; name: string; repetitions: number }
>;

export interface Exercises {
  readonly exercises: ReadonlyNonEmptyArray<Exercise>;
  readonly rounds: number;
}

export const Workout = struct({
  id: NanoID,
  createdAt: DateFromNumber,
  name: String32,
  // We store Exercises as a string that has to be parsed.
  exercises: String1024,
});
export type Workout = TypeOf<typeof Workout>;

// TODO: UrlWorkout, no id nor createdAt, optimized for sharing
