import { expression } from 'expressive-ts';
import { monoid, number, option, readonlyArray } from 'fp-ts';
import { regExp } from 'fp-ts-contrib';
import { apply, flow, pipe } from 'fp-ts/function';
import { lens } from 'monocle-ts';
import { String32 } from '../codecs/branded';
import { Workout } from '../codecs/domain';

export const ensureUniqueWorkoutName: (
  workout: Workout,
) => (a: ReadonlyArray<Workout>) => Workout = (workout) => {
  const nameWithIndex = pipe(
    expression.compile,
    expression.startOfInput,
    expression.string(workout.name),
    expression.endOfInput,
    expression.orExpression,
    expression.startOfInput,
    expression.string(workout.name),
    expression.whitespace,
    expression.beginCapture,
    expression.digit,
    expression.oneOrMore,
    expression.endCapture,
    expression.endOfInput,
    expression.toRegex,
  );

  return flow(
    readonlyArray.map((w) => w.name),
    readonlyArray.filterMap(regExp.match(nameWithIndex)),
    option.fromPredicate(readonlyArray.isNonEmpty),
    option.map(readonlyArray.map((r) => Number(r[1] || 1))),
    option.map(monoid.concatAll(monoid.max(number.Bounded))),
    option.map((i) => `${workout.name} ${i + 1}`),
    option.chainEitherK(String32.decode),
    option.map(
      flow(pipe(lens.id<Workout>(), lens.prop('name')).set, apply(workout)),
    ),
    option.getOrElse(() => workout),
  );
};
