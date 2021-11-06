import { pipe } from 'fp-ts/function';
import { lens } from 'monocle-ts';
import {
  memo,
  Reducer,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
} from 'react';
import { Dimensions, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface State {
  initialText: string;
  isMeasuring: boolean;
}

const createInitialState = (initialText: string): State => ({
  initialText,
  isMeasuring: true,
});

type Action = { type: 'done' } | { type: 'reset'; initialText: string };

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'done':
      return pipe(lens.id<State>(), lens.prop('isMeasuring')).set(false)(state);
    case 'reset':
      return createInitialState(action.initialText);
  }
};

export const MaxTextWithoutWrap = memo<{ text: string }>(({ text }) => {
  const t = useTheme();
  const [state, dispatch] = useReducer(reducer, text, createInitialState);

  useLayoutEffect(() => {
    if (text !== state.initialText)
      dispatch({ type: 'reset', initialText: text });
  }, [state.initialText, text]);

  const textRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!state.isMeasuring || textRef.current == null) return;
    let currentFontSize = 18;
    const maxFontSize = 256;
    let isWrapped = false;

    // This can be faster via smarter search...
    // const t = performance.now();
    while (!isWrapped && currentFontSize <= maxFontSize) {
      textRef.current.style.fontSize = `${currentFontSize}px`;
      isWrapped = textRef.current.getClientRects().length > 1;
      if (!isWrapped) currentFontSize++;
    }
    textRef.current.style.fontSize = `${currentFontSize - 1}px`;
    // console.log(performance.now() - t);

    dispatch({ type: 'done' });
  }, [state.isMeasuring]);

  useEffect(() => {
    const handleChange = () => {
      dispatch({ type: 'reset', initialText: text });
    };
    const subscription = Dimensions.addEventListener('change', handleChange);
    return () => {
      subscription.remove();
    };
  }, [text]);

  return (
    <Text style={[t.text, t.color, state.isMeasuring && t.opacity0]}>
      {/* Span without styles returns rects. NBSPs are for a padding. */}
      <span ref={textRef}>{`\xa0${text}\xa0`}</span>
    </Text>
  );
});
