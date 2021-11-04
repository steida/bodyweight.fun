import { struct, TypeOf } from 'io-ts/Codec';
import { NanoID, String1024, String32 } from './branded';
import { DateFromNumber } from './DateFromNumber';

export const Workout = struct({
  id: NanoID,
  createdAt: DateFromNumber,
  name: String32,
  exercises: String1024,
});
export type Workout = TypeOf<typeof Workout>;

// TODO: UrlWorkout, no id nor createdAt, optimized for sharing
