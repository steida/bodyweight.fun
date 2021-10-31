import { either } from 'fp-ts';
import { constVoid } from 'fp-ts/function';
import { Dispatch, FC, Reducer, useEffect, useReducer } from 'react';
import {
  createContext,
  useContext,
  useContextSelector,
} from 'use-context-selector';
import { NanoID } from '../codecs/branded';
import { Workout } from '../codecs/domain';
import { useStorage } from '../hooks/useStorage';

export interface AppState {
  workouts: ReadonlyArray<Workout>;
}

type AppAction =
  | { type: 'createWorkout'; workout: Workout }
  | { type: 'deleteWorkout'; id: NanoID }
  | {
      type: 'rehydrate';
    };

const reducer: Reducer<AppState, AppAction> = (state, action) => {
  switch (action.type) {
    case 'createWorkout':
      return { ...state, workouts: [...state.workouts, action.workout] };
    case 'deleteWorkout':
      return {
        ...state,
        workouts: state.workouts.filter((w) => w.id !== action.id),
      };
    case 'rehydrate':
      return { ...state };
  }
};

const initialState: AppState = {
  workouts: [],
};

const AppStateContext = createContext<AppState>(initialState);
export const useAppState = <Selected extends any>(
  selector: (state: AppState) => Selected,
): Selected => useContextSelector(AppStateContext, selector);

const AppDispatchContext = createContext<Dispatch<AppAction>>(constVoid);
export const useAppDispatch = () => useContext(AppDispatchContext);

export const AppStateProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const storage = useStorage();

  useEffect(() => {
    storage.get().then(
      either.match(
        // We don't handle storage errors because there isn't much we can do.
        constVoid,
        () => {
          dispatch({ type: 'rehydrate' });
        },
      ),
    );
  }, [dispatch, storage]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};
