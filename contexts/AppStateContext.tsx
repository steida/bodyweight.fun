import { either } from 'fp-ts';
import { constVoid, pipe } from 'fp-ts/function';
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
import { NanoID, String32 } from '../codecs/branded';
import { Workout } from '../codecs/domain';
import { StorageState, useStorage } from '../hooks/useStorage';
import { createNanoID } from '../utils/createNanoID';

export interface AppState {
  isRehydrated: boolean;
  workouts: ReadonlyArray<Workout>;
}

type AppAction =
  | { type: 'rehydrated'; workouts?: ReadonlyArray<Workout> }
  | { type: 'createWorkout'; workout: Workout }
  | { type: 'deleteWorkout'; id: NanoID }
  | { type: 'updateWorkoutName'; id: NanoID; value: String32 };

const reducer: Reducer<AppState, AppAction> = (state, action) => {
  switch (action.type) {
    case 'rehydrated':
      return {
        ...state,
        isRehydrated: true,
        workouts: action.workouts || state.workouts,
      };
    case 'createWorkout':
      return { ...state, workouts: [...state.workouts, action.workout] };
    case 'deleteWorkout':
      return {
        ...state,
        workouts: state.workouts.filter((w) => w.id !== action.id),
      };
    case 'updateWorkoutName':
      return pipe(
        lens.id<AppState>(),
        lens.prop('workouts'),
        lens.findFirst((w) => w.id === action.id),
        optional.prop('name'),
      ).set(action.value)(state);
  }
};

const initialState: AppState = {
  isRehydrated: false,
  workouts: [
    { id: createNanoID(), createdAt: new Date(), name: 'Short' as String32 },
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
        dispatch({ type: 'rehydrated' });
      },
      ({ workouts }) => {
        dispatch({ type: 'rehydrated', workouts });
      },
    ),
  );

  const storageState: StorageState = useMemo(
    () => ({ workouts: state.workouts }),
    [state.workouts],
  );

  // https://twitter.com/estejs/status/1455313999902433283
  const prevStorageState = useRef(storageState);
  useEffect(() => {
    if (prevStorageState.current !== storageState) {
      prevStorageState.current = storageState;
      if (!state.isRehydrated) return;
      // Fire and forget, we don't care about errors nor result.
      storage.set(storageState)();
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
