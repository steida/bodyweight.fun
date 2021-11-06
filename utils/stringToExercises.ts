import { expression } from 'expressive-ts';
import { option, predicate, readonlyArray, string } from 'fp-ts';
import { regExp } from 'fp-ts-contrib';
import { constant, flow, pipe } from 'fp-ts/function';

type Exercise = Readonly<
  | { type: 'noParams'; name: string }
  | { type: 'minutes'; name: string; minutes: number }
  | { type: 'repetitions'; name: string; repetitions: number }
>;

export interface Exercises {
  readonly exercises: readonly Exercise[];
  readonly rounds: number;
}

// \n is not enough
const lineBreakRegex = pipe(
  expression.compile,
  expression.lineBreak,
  expression.toRegex,
);

const createExerciseRegexWithParam = (char: string) =>
  pipe(
    expression.compile,
    expression.beginCapture,
    expression.anything,
    expression.endCapture,
    expression.whitespace,
    expression.oneOrMore,
    expression.beginCapture,
    expression.digit,
    expression.oneOrMore,
    expression.endCapture,
    expression.string(char),
    expression.toRegex,
  );

const minutesExerciseRegex = createExerciseRegexWithParam('m');
// Test whitespaces with emoji. We trim expression.anything.
// console.log(' 😂 mavat  rukama  1m'.match(minutesExercise));
const repetitionsExerciseRegex = createExerciseRegexWithParam('x');

const roundsRegex = pipe(
  expression.compile,
  expression.startOfInput,
  expression.whitespace,
  expression.zeroOrMore,
  expression.beginCapture,
  expression.digit,
  expression.oneOrMore,
  expression.endCapture,
  expression.string('x'),
  expression.toRegex,
);

const stringToMinutesExercise = flow(
  regExp.match(minutesExerciseRegex),
  option.map(
    (a): Exercise => ({
      type: 'minutes',
      name: a[1].trim(),
      minutes: Number(a[2]),
    }),
  ),
);

const stringToRepetitionsExercise = flow(
  regExp.match(repetitionsExerciseRegex),
  option.map(
    (a): Exercise => ({
      type: 'repetitions',
      name: a[1].trim(),
      repetitions: Number(a[2]),
    }),
  ),
);

export const stringToExercises = flow(
  regExp.split(lineBreakRegex),
  readonlyArray.map(string.trim),
  readonlyArray.filter(predicate.not(string.isEmpty)),
  readonlyArray.partition(regExp.test(roundsRegex)),
  ({ left, right }): Exercises => ({
    exercises: left.map((s) =>
      pipe(
        stringToMinutesExercise(s),
        option.alt(() => stringToRepetitionsExercise(s)),
        option.getOrElse(
          (): Exercise => ({ type: 'noParams', name: s.trim() }),
        ),
      ),
    ),
    rounds: pipe(
      readonlyArray.head(right),
      option.chain(regExp.match(roundsRegex)),
      option.map((a) => Number(a[1])),
      option.getOrElse(constant(1)),
    ),
  }),
);
