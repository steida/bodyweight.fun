import { either, ioEither, taskEither } from 'fp-ts';
import { Either } from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
import { parse, stringify } from 'fp-ts/Json';
import { TaskEither } from 'fp-ts/TaskEither';
import { array, literal, readonly, struct, sum, TypeOf } from 'io-ts/Codec';
import { useEffect, useRef } from 'react';
import { Workout } from '../codecs/domain';

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

interface StorageGetError {
  type: 'storageGetError';
  error: {
    type: 'getItem' | 'getItemReturnsNull' | 'parse' | 'decode';
  };
}

interface StorageSetError {
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

const get: TaskEither<StorageGetError, StorageState> = pipe(
  ioEither.tryCatch(
    () => localStorage.getItem(storageKey),
    () => createStorageGetError('getItem'),
  ),
  ioEither.filterOrElse(
    (s): s is string => s != null,
    () => createStorageGetError('getItemReturnsNull'),
  ),
  ioEither.chainEitherK(
    flow(
      parse,
      either.mapLeft(() => createStorageGetError('parse')),
    ),
  ),
  ioEither.chainEitherK(
    flow(
      StorageVersions.decode,
      either.mapLeft(() => createStorageGetError('decode')),
    ),
  ),
  ioEither.map(migrate),
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
 * TODO: Propagate changes across tabs.
 * Data should be small because LocalStorage is sync.
 * For larger data, we can use https://github.com/jakearchibald/idb-keyval
 * which is async.
 */
export const useStorage = (
  onRehydrate: (e: Either<StorageGetError, StorageState>) => void,
) => {
  const onInitialRehydrateRef = useRef(onRehydrate);

  useEffect(() => {
    get().then(onInitialRehydrateRef.current);
  }, []);

  return useRef({ set }).current;
};
