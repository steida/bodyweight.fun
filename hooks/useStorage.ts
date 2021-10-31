import { either, ioEither, taskEither } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import { parse, stringify } from 'fp-ts/Json';
import { TaskEither } from 'fp-ts/TaskEither';
import { literal, string, struct, sum, TypeOf } from 'io-ts/Codec';
import { useMemo, useState } from 'react';

export const storageKey = 'bodyweight.fun';

/**
 * To add a new version:
 *  - Increment storageVersion.
 *  - Update StorageVersions.
 *  - Update storageMigration.
 */
const storageVersion = 1;

const StorageVersions = sum('version')({
  [1]: struct({
    version: literal(1),
    state: struct({
      foo: string,
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

// TODO: Split to StorageGetError and StorageSetError.
interface StorageError {
  type: 'storage';
  error: {
    type:
      | 'stringify'
      | 'setItem'
      | 'getItem'
      | 'getItemReturnsNull'
      | 'parse'
      | 'decode';
  };
}

const createStorageError = (
  type: StorageError['error']['type'],
): StorageError => ({ type: 'storage', error: { type } });

type StorageState = Extract<
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

const get: TaskEither<StorageError, StorageState> = pipe(
  ioEither.tryCatch(
    () => localStorage.getItem(storageKey),
    () => createStorageError('getItem'),
  ),
  ioEither.filterOrElse(
    (s): s is string => s != null,
    () => createStorageError('getItemReturnsNull'),
  ),
  ioEither.chainEitherK(
    flow(
      parse,
      either.mapLeft(() => createStorageError('parse')),
    ),
  ),
  ioEither.chainEitherK(
    flow(
      StorageVersions.decode,
      either.mapLeft(() => createStorageError('decode')),
    ),
  ),
  ioEither.map(migrate),
  taskEither.fromIOEither,
);

const set = (state: StorageState): TaskEither<StorageError, void> =>
  pipe(
    ioEither.fromIO(
      (): StorageVersions => ({ state, version: storageVersion }),
    ),
    ioEither.chainEitherK(stringify),
    ioEither.mapLeft(() => createStorageError('stringify')),
    ioEither.chain((s) =>
      ioEither.tryCatch(
        () => localStorage.setItem(storageKey, s),
        () => createStorageError('setItem'),
      ),
    ),
    taskEither.fromIOEither,
  );

/**
 * Typed and safe LocalStorage with schema migration.
 * API is async for future React Native AsyncStorage.
 * I don't expect a lot of data, so sync LocalStorage is OK.
 * We will probably never cache images because they are huge.
 * LocalStorage data shall be small so browsers will not clear it.
 * In case a lot of data, we can reconsider this approach.
 * TODO: Propagate changes across tabs.
 */
export const useStorage = () => {
  // Will be used for AsyncStorage.
  const [isSaving] = useState(false);
  return useMemo(() => ({ get, set, isSaving }), [isSaving]);
};
