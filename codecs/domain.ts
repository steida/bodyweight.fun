import { struct, TypeOf } from 'io-ts/Codec';
import { NanoID, String32 } from './branded';
import { DateFromNumber } from './DateFromNumber';

export const Exercise = struct({
  // No ID, it's value object.
  name: String32,
  // v minutach, positive non negative number
  // durationInMinutes:
});

export const Workout = struct({
  id: NanoID,
  createdAt: DateFromNumber,
  name: String32,
  // exercises: []
});
export type Workout = TypeOf<typeof Workout>;

// TODO: UrlWorkout, no id nor createdAt, optimized for sharing
