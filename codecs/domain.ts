import { date, eq, string } from 'fp-ts';
import { Eq } from 'fp-ts/Eq';
import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray';
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
  exercises: String1024,
  // Remember to update eqWorkout!
});
export type Workout = TypeOf<typeof Workout>;

export const eqWorkout: Eq<Workout> = eq.struct({
  id: string.Eq,
  createdAt: date.Eq,
  name: string.Eq,
  exercises: string.Eq,
});
