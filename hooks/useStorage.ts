import { either, eq, ioEither, readonlyArray, taskEither } from 'fp-ts';
import { Either } from 'fp-ts/Either';
import { Eq } from 'fp-ts/Eq';
import { flow, pipe } from 'fp-ts/function';
import { parse, stringify } from 'fp-ts/Json';
import { Predicate } from 'fp-ts/Predicate';
import { TaskEither } from 'fp-ts/TaskEither';
import { array, literal, readonly, struct, sum, TypeOf } from 'io-ts/Codec';
import { useEffect, useMemo, useRef } from 'react';
import { eqWorkout, Workout } from '../codecs/domain';

export const storageKey = 'bodyweight.fun';

/**
 * To add a new version:
 *  - Increment storageVersion.
 *  - Update StorageVersions.
 *  - Update storageMigration.
 * If some codec has been changed, copy-paste previous version here
 * and use it in StorageVersions.
 */
const storageVersion = 1;

const StorageVersions = sum('version')({
  [1]: struct({
    version: literal(1),
    state: struct({
      workouts: readonly(array(Workout)),
    }),
  }),
  // [2]: struct({
  //   version: literal(2),
  //   state: struct({
  //     user: struct({
  //       email: string,
  //       name: nullable(string),
  //     }),
  //   }),
  // }),
});
type StorageVersions = TypeOf<typeof StorageVersions>;

export interface StorageGetError {
  type: 'storageGetError';
  error: {
    type: 'getItem' | 'getItemReturnsNull' | 'parse' | 'decode';
  };
}

export const isSeriousStorageGetError: Predicate<StorageGetError> = (error) =>
  error.error.type !== 'getItemReturnsNull';

export interface StorageSetError {
  type: 'storageSetError';
  error: {
    type: 'stringify' | 'setItem';
  };
}

const createStorageGetError = (
  type: StorageGetError['error']['type'],
): StorageGetError => ({ type: 'storageGetError', error: { type } });

const createStorageSetError = (
  type: StorageSetError['error']['type'],
): StorageSetError => ({ type: 'storageSetError', error: { type } });

export type StorageState = Extract<
  StorageVersions,
  { version: typeof storageVersion }
>['state'];

const eqStorageState: Eq<StorageState> = eq.struct({
  workouts: readonlyArray.getEq(eqWorkout),
});

const migrate = (decodedState: StorageVersions): StorageState => {
  // if (decodedState.version === 1)
  //   decodedState = {
  //     version: 2,
  //     state: {
  //       user: {
  //         email: decodedState.state.email,
  //         name: null,
  //       },
  //     },
  //   };

  return decodedState.state;
};

const parseDecodeMigrate: (s: string) => Either<StorageGetError, StorageState> =
  flow(
    flow(
      parse,
      either.mapLeft(() => createStorageGetError('parse')),
    ),
    either.chain(
      flow(
        StorageVersions.decode,
        either.mapLeft(() => createStorageGetError('decode')),
      ),
    ),
    either.map(migrate),
  );

const get: TaskEither<StorageGetError, StorageState> = pipe(
  ioEither.tryCatch(
    () => localStorage.getItem(storageKey),
    () => createStorageGetError('getItem'),
  ),
  ioEither.filterOrElse(
    (s): s is string => s != null,
    () => createStorageGetError('getItemReturnsNull'),
  ),
  ioEither.chainEitherK(parseDecodeMigrate),
  taskEither.fromIOEither,
);

const set = (state: StorageState): TaskEither<StorageSetError, void> =>
  pipe(
    ioEither.fromIO(
      (): StorageVersions => ({ state, version: storageVersion }),
    ),
    ioEither.map(StorageVersions.encode),
    ioEither.chainEitherK(stringify),
    ioEither.mapLeft(() => createStorageSetError('stringify')),
    ioEither.chain((s) =>
      ioEither.tryCatch(
        () => localStorage.setItem(storageKey, s),
        () => createStorageSetError('setItem'),
      ),
    ),
    taskEither.fromIOEither,
  );

/**
 * Typed and safe LocalStorage with migrations.
 * API is async to support React Native AsyncStorage in the future.
 * Data should be small because LocalStorage is sync. How small?
 * Always measure it before making a decision. I'm pretty sure even
 * thousands of workouts will be fast enough.
 * For larger data, we can use https://github.com/jakearchibald/idb-keyval
 * which is async or rather the whole https://github.com/jakearchibald/idb
 * I suppose we will need local-first progress tracking and for that
 * IndexedDB is probably the only choice but remember, measure it first.
 * We use LocalStorage for now because it has great DX but it can
 * become a bottleneck sooner or later.
 */
export const useStorage = (
  onRehydrate: (e: Either<StorageGetError, StorageState>) => void,
) => {
  const storageStateRef = useRef<StorageState | null>(null);

  useEffect(() => {
    const onRehydrateWithSetRef = (
      e: Either<StorageGetError, StorageState>,
    ) => {
      if (either.isRight(e)) storageStateRef.current = e.right;
      onRehydrate(e);
    };

    get().then(onRehydrateWithSetRef);

    const handleWindowStorage = (e: StorageEvent) => {
      if (e.key !== storageKey || e.newValue == null) return;
      pipe(e.newValue, parseDecodeMigrate, onRehydrateWithSetRef);
    };

    window.addEventListener('storage', handleWindowStorage);
    return () => {
      window.removeEventListener('storage', handleWindowStorage);
    };
  }, [onRehydrate]);

  const setWithChangeDetection = (state: StorageState) => {
    const hasChange = storageStateRef.current
      ? !eqStorageState.equals(state, storageStateRef.current)
      : true; // LocalStorage is empty.
    if (!hasChange) return taskEither.right(void 0);
    storageStateRef.current = state;
    return set(state);
  };

  return useMemo(() => ({ set: setWithChangeDetection }), []);
};
