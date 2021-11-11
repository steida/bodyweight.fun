import { expression } from 'expressive-ts';
import { either, option, predicate, readonlyArray, string } from 'fp-ts';
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

const lineBreakReplacer = '+';
const whitespaceReplacer = '_';

// TODO: Escape replacers. ':' in Workout name breaks sharing.
const serialize = flow(
  string.replace(allLineBreakRegex, lineBreakReplacer),
  string.replace(allWhitespaceRegex, whitespaceReplacer),
);

const deserialize = (s: string) =>
  s
    .replaceAll(lineBreakReplacer, '\n')
    .replaceAll(whitespaceReplacer, ' ')
    .trim();

// Almost everything is allowed. Percent-encoding for UTF ins't required
// for modern browsers, I think. We want readable URLs. Let's see.
// http://localhost:3000#Zahrivacka:downdog+plank_30s+push-up_10x+relax++3x
// https://stackoverflow.com/questions/26088849/url-fragment-allowed-characters
export const serializeWorkout = (workout: Workout) =>
  `${serialize(workout.name)}:${serialize(workout.exercises)}`;

export const deserializeWorkout: (s: string) => Option<Workout> = flow(
  option.some,
  option.map(string.split(':')),
  option.filter((a) => a.length === 2),
  option.map(readonlyArray.map(deserialize)),
  option.filter(readonlyArray.every(predicate.not(string.isEmpty))),
  option.chainEitherK(([name, exercises]) =>
    sequenceT(either.Applicative)(
      String32.decode(name),
      String1024.decode(exercises),
    ),
  ),
  option.map(([name, exercises]) => createWorkout(name, exercises)),
);
