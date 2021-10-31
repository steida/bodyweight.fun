import { either } from 'fp-ts';
import { constVoid } from 'fp-ts/function';
import { Dispatch, FC, Reducer, useEffect, useReducer } from 'react';
import {
  createContext,
  useContext,
  useContextSelector,
} from 'use-context-selector';
import { useStorage } from '../hooks/useStorage';

export interface AppState {
  foo: string | null;
}

type AppAction = {
  type: 'rehydrate';
};

const reducer: Reducer<AppState, AppAction> = (state, action) => {
  switch (action.type) {
    case 'rehydrate':
      return { ...state };
  }
};

const initialState: AppState = {
  foo: null,
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
