import { struct, TypeOf } from 'io-ts/Codec';
import { NanoID, String32 } from './branded';
import { DateFromNumber } from './DateFromNumber';

export const Workout = struct({
  id: NanoID,
  createdAt: DateFromNumber,
  name: String32,
});
export type Workout = TypeOf<typeof Workout>;

// TODO: UrlWorkout, no id nor createdAt, optimized for sharing
