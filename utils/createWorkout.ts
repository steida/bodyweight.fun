import { String1024, String32 } from '../codecs/branded';
import { Workout } from '../codecs/domain';
import { createNanoID } from './createNanoID';

export const createWorkout = (
  name: String32,
  exercises: String1024,
): Workout => ({
  id: createNanoID(),
  createdAt: new Date(),
  name,
  exercises,
});
