import { expression } from 'expressive-ts';
import { either, option, string } from 'fp-ts';
import { sequenceT } from 'fp-ts/Apply';
import { flow, pipe } from 'fp-ts/function';
import { Option } from 'fp-ts/Option';
import { String1024, String32 } from '../codecs/branded';
import { Workout } from '../codecs/domain';
import { createWorkout } from './createWorkout';

// \n is not enough
const allLineBreakRegex = pipe(
  expression.compile,
  expression.lineBreak,
  expression.allowMultiple,
  expression.toRegex,
);

const allWhitespaceRegex = pipe(
  expression.compile,
  expression.whitespace,
  expression.allowMultiple,
  expression.toRegex,
);

const lineBreakReplacement = '+';
const whitespaceReplacement = '_';

// Replacer are rate, still should be escaped.
const serialize = flow(
  string.replace(allLineBreakRegex, lineBreakReplacement),
  string.replace(allWhitespaceRegex, whitespaceReplacement),
);

const deserialize = (s: string) =>
  s
    .replaceAll(lineBreakReplacement, '\n')
    .replaceAll(whitespaceReplacement, ' ')
    .trim();

// Almost everything is allowed. Percent-encoding for UTF ins't required
// for modern browsers, I think. We want readable URLs. Let's see.
// https://stackoverflow.com/questions/26088849/url-fragment-allowed-characters
export const serializeWorkout = (workout: Workout) =>
  `${serialize(workout.name)}:${serialize(workout.exercises)}`;

export const deserializeWorkout = (s: string): Option<Workout> => {
  const chunks = s.split(':');
  if (chunks.length !== 2) return option.none;
  const name = deserialize(chunks[0]);
  const exercises = deserialize(chunks[1]);
  if (!name || !exercises) return option.none;
  return pipe(
    sequenceT(either.Applicative)(
      String32.decode(name),
      String1024.decode(exercises),
    ),
    either.map(([name, exercises]) => createWorkout(name, exercises)),
    option.fromEither,
  );
};
