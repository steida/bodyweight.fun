import { either, readonlyArray } from 'fp-ts';
import { constVoid, pipe } from 'fp-ts/function';
import { Either } from 'fp-ts/Either';
import { lens, optional } from 'monocle-ts';
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

export interface AppState {
  isRehydrated: boolean;
  workouts: ReadonlyArray<Workout>;
}

type AppAction =
  | { type: 'rehydrate'; either: Either<StorageGetError, StorageState> }
  | { type: 'createWorkout'; name: String32 }
  | { type: 'deleteWorkout'; id: NanoID }
  | { type: 'updateWorkoutName'; id: NanoID; value: String32 }
  | { type: 'updateWorkoutExercises'; id: NanoID; value: String1024 };

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
        lens.modify((a) => [
          ...a,
          {
            id: createNanoID(),
            createdAt: new Date(),
            name: action.name,
            exercises: emptyString1024,
          },
        ]),
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
  }
};

const initialState: AppState = {
  isRehydrated: false,
  workouts: [
    {
      id: createNanoID(),
      createdAt: new Date(),
      name: eitherToRightOrThrow(String32.decode('An example')),
      exercises: eitherToRightOrThrow(
        // TODO: Localize with {newLine}
        String1024.decode(
          `
jumping jacks 3m
stretching 1m
sit-ups 20x
stretching 1m
push-ups 20x
plank 1m

2 rounds`.trim(),
        ),
      ),
    },
  ],
};

const AppStateContext = createContext<AppState>(initialState);
export const useAppState = <Selected extends any>(
  selector: (state: AppState) => Selected,
): Selected => useContextSelector(AppStateContext, selector);

const AppDispatchContext = createContext<Dispatch<AppAction>>(constVoid);
export const useAppDispatch = () => useContext(AppDispatchContext);

export const AppStateProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

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

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};
