import { either, option, readonlyArray } from 'fp-ts';
import { Either } from 'fp-ts/Either';
import { constVoid, pipe } from 'fp-ts/function';
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
import {
  emptyString1024,
  NanoID,
  String1024,
  String32,
} from '../codecs/branded';
import { Workout } from '../codecs/domain';
import { StorageGetError, StorageState, useStorage } from '../hooks/useStorage';
import { createNanoID } from '../utils/createNanoID';
import { eitherToRightOrThrow } from '../utils/eitherToRighOrThrow';
import { deserializeWorkout } from '../utils/workoutSerialization';

export interface AppState {
  isRehydrated: boolean;
  workouts: ReadonlyArray<Workout>;
}

type AppAction =
  | { type: 'rehydrate'; either: Either<StorageGetError, StorageState> }
  | { type: 'createWorkout'; name: String32 }
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
          () =>
            pipe(
              lens.id<AppState>(),
              lens.prop('isRehydrated'),
              lens.modify(() => true),
            )(state),
          (storageState) =>
            pipe(
              lens.id<AppState>(),
              lens.props('isRehydrated', 'workouts'),
              lens.modify(() => ({
                isRehydrated: true,
                workouts: storageState.workouts,
              })),
            )(state),
        ),
      );

    case 'createWorkout':
      return pipe(
        lens.id<AppState>(),
        lens.prop('workouts'),
        lens.modify(
          readonlyArray.appendW({
            id: createNanoID(),
            createdAt: new Date(),
            name: action.name,
            exercises: emptyString1024,
          }),
        ),
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
        lens.modify(readonlyArray.appendW(action.workout)),
      )(state);
  }
};

export const initialAppState: AppState = {
  isRehydrated: false,
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

  const storage = useStorage(
    either.match(
      (e) => {
        // An error can happen if the code is wrong so log it in dev mode.
        if (
          process.env.NODE_ENV === 'development' &&
          e.error.type !== 'getItemReturnsNull'
        )
          // eslint-disable-next-line no-console
          console.log(e);
        dispatch({ type: 'rehydrate', either: either.left(e) });
      },
      (storageState) => {
        dispatch({ type: 'rehydrate', either: either.right(storageState) });
      },
    ),
  );

  const storageStateToSave: StorageState = useMemo(
    () => ({ workouts: state.workouts }),
    [state.workouts],
  );

  // https://twitter.com/estejs/status/1455313999902433283
  const prevStorageStateToSave = useRef(storageStateToSave);
  useEffect(() => {
    if (prevStorageStateToSave.current !== storageStateToSave) {
      prevStorageStateToSave.current = storageStateToSave;
      // Do not save anything before rehydrate.
      if (!state.isRehydrated) return;
      // Fire and forget, we don't care about errors nor result.
      storage.set(storageStateToSave)();
    }
  });

  useEffect(() => {
    if (state.isRehydrated)
      document.documentElement.classList.remove('loading');
  }, [state.isRehydrated]);

  const router = useRouter();

  useEffect(() => {
    const maybeImportWorkout = () => {
      pipe(
        decodeURIComponent(location.hash.slice(1)),
        deserializeWorkout,
        option.match(constVoid, (workout) => {
          // Remove location.hash from URL. It's weird but it works.
          // https://stackoverflow.com/a/49373716/233902
          history.replaceState(null, '', ' ');
          dispatch({ type: 'importWorkout', workout });
        }),
      );
    };
    maybeImportWorkout();

    window.addEventListener('hashchange', maybeImportWorkout);
    return () => {
      window.removeEventListener('hashchange', maybeImportWorkout);
    };
  }, [router.events]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};
