import { either, option, readonlyArray } from 'fp-ts';
import { Either } from 'fp-ts/Either';
import { constVoid, pipe } from 'fp-ts/function';
import { IO } from 'fp-ts/IO';
import { lens, optional } from 'monocle-ts';
import { useRouter } from 'next/router';
import {
  Dispatch,
  FC,
  Reducer,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import {
  createContext,
  useContext,
  useContextSelector,
} from 'use-context-selector';
import { NanoID, String1024, String32 } from '../codecs/branded';
import { Workout } from '../codecs/domain';
import { Route } from '../codecs/routing';
import {
  isSeriousStorageGetError,
  StorageGetError,
  StorageState,
  useStorage,
} from '../hooks/useStorage';
import { createNanoID } from '../utils/createNanoID';
import { eitherToRightOrThrow } from '../utils/eitherToRighOrThrow';
import { ensureUniqueWorkoutName } from '../utils/ensureUniqueWorkoutName';
import { deserializeWorkout } from '../utils/workoutSerialization';

export interface AppState {
  isRehydrated: boolean;
  storageGetError: StorageGetError | null;
  workouts: ReadonlyArray<Workout>;
}

type AppAction =
  | { type: 'rehydrate'; either: Either<StorageGetError, StorageState> }
  | { type: 'createWorkout'; workout: Workout }
  | { type: 'deleteWorkout'; id: NanoID }
  | { type: 'updateWorkoutName'; id: NanoID; value: String32 }
  | { type: 'updateWorkoutExercises'; id: NanoID; value: String1024 }
  | { type: 'importWorkout'; workout: Workout };

const reducer: Reducer<AppState, AppAction> = (state, action) => {
  switch (action.type) {
    case 'rehydrate':
      return pipe(
        action.either,
        either.match(
          (storageGetError) =>
            pipe(
              lens.id<AppState>(),
              lens.props('isRehydrated', 'storageGetError'),
            ).set({
              isRehydrated: true,
              storageGetError,
            })(state),
          (storageState) =>
            pipe(
              lens.id<AppState>(),
              lens.props('isRehydrated', 'workouts'),
            ).set({
              isRehydrated: true,
              workouts: storageState.workouts,
            })(state),
        ),
      );

    case 'createWorkout':
      return pipe(
        lens.id<AppState>(),
        lens.prop('workouts'),
        lens.modify(readonlyArray.appendW(action.workout)),
      )(state);

    case 'deleteWorkout':
      return pipe(
        lens.id<AppState>(),
        lens.prop('workouts'),
        lens.modify(readonlyArray.filter((w) => w.id !== action.id)),
      )(state);

    case 'updateWorkoutName':
      return pipe(
        lens.id<AppState>(),
        lens.prop('workouts'),
        lens.findFirst((w) => w.id === action.id),
        optional.prop('name'),
        optional.modify(() => action.value),
      )(state);

    case 'updateWorkoutExercises':
      return pipe(
        lens.id<AppState>(),
        lens.prop('workouts'),
        lens.findFirst((w) => w.id === action.id),
        optional.prop('exercises'),
        optional.modify(() => action.value),
      )(state);

    case 'importWorkout':
      return pipe(
        lens.id<AppState>(),
        lens.prop('workouts'),
        lens.modify(
          readonlyArray.appendW(
            pipe(state.workouts, ensureUniqueWorkoutName(action.workout)),
          ),
        ),
      )(state);
  }
};

export const initialAppState: AppState = {
  isRehydrated: false,
  storageGetError: null,
  workouts: [
    {
      id: createNanoID(),
      createdAt: new Date(),
      name: eitherToRightOrThrow(String32.decode('An example')),
      exercises: eitherToRightOrThrow(
        // TODO: Localize with {newLine}, { newLine: '\n' },
        String1024.decode(
          `
stretching 1m
jumping jacks 1m
push-ups 20x
sit-ups 20x
relax
plank 30s

2x`.trim(),
        ),
      ),
    },
  ],
};

const AppStateContext = createContext<AppState>(initialAppState);
export const useAppState = <Selected extends any>(
  selector: (state: AppState) => Selected,
): Selected => useContextSelector(AppStateContext, selector);

const AppDispatchContext = createContext<Dispatch<AppAction>>(constVoid);
export const useAppDispatch = () => useContext(AppDispatchContext);

export const AppStateProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialAppState);

  const storage = useStorage((either) => {
    dispatch({ type: 'rehydrate', either });
  });

  const storageStateToSave: StorageState = useMemo(
    () => ({ workouts: state.workouts }),
    [state.workouts],
  );

  // https://twitter.com/estejs/status/1455313999902433283
  const prevStorageStateToSave = useRef(storageStateToSave);
  useEffect(() => {
    // We can compare references safely because we use monocle-ts
    // lens in the reducer.
    if (prevStorageStateToSave.current !== storageStateToSave) {
      prevStorageStateToSave.current = storageStateToSave;
      // Do not save anything before the storage is rehydrated
      // or it was rehydrated with a decode error.
      // Decode error means another browser tab with a newer script
      // version updated LocalStorage therefore, the current browser
      // tab can't decode it so the app has to ask a user for reload.
      // Outdated app is not allowed to save, otherwise data would be lost.
      if (
        !state.isRehydrated ||
        (state.storageGetError &&
          isSeriousStorageGetError(state.storageGetError))
      )
        return;
      // Fire and forget. It should never throw anyway because private
      // browsing in Safari has been fixed and old Edge is dead.
      // There is not much we can do anyway.
      storage.set(storageStateToSave)();
    }
  });

  const router = useRouter();

  useEffect(() => {
    // Do not import anything before the storage is rehydrated.
    if (!state.isRehydrated) return;

    const tryImportWorkout = (callback: IO<void>) =>
      pipe(
        decodeURIComponent(location.hash.slice(1)),
        deserializeWorkout,
        option.match(callback, (workout) => {
          dispatch({ type: 'importWorkout', workout });
          const route: Route = {
            pathname: '/workout/[id]',
            query: { id: workout.id },
          };
          // Postpone loading class remove until the route is loaded.
          // Replace, so back button will not repeat an import.
          router.replace(route).finally(callback);
        }),
      );

    tryImportWorkout(() => {
      if (document.documentElement.classList.contains('loading'))
        document.documentElement.classList.remove('loading');
    });

    const handleHashChange = () => {
      tryImportWorkout(constVoid);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [router, state.isRehydrated]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};
