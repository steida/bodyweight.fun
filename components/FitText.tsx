import { pipe } from 'fp-ts/function';
import { lens } from 'monocle-ts';
import { memo, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const isOverflown = ({
  clientWidth,
  clientHeight,
  scrollWidth,
  scrollHeight,
}: HTMLDivElement) => scrollWidth > clientWidth || scrollHeight > clientHeight;

interface Rectangle {
  readonly width: number;
  readonly height: number;
}

export const FitText = memo<{ text: string }>(({ text }) => {
  const t = useTheme();
  const [viewRect, setViewRect] = useState<Rectangle>({ width: 0, height: 0 });
  const viewRef = useRef<View>(null);
  const textRef = useRef<Text>(null);

  const computeFontSize = () => {
    const { current: view } = viewRef;
    const { current: text } = textRef;
    if (view == null || text == null) return;

    // Opacity must be set via setNativeProps for some reason.
    text.setNativeProps({ style: { opacity: '0' } });

    const binarySearch = (minFontSize: number, maxFontSize: number) => {
      const delta = maxFontSize - minFontSize;
      // As big fontSize as possible, but never overflown.
      if (delta < 0.1) {
        text.setNativeProps({ style: { opacity: '1' } });
        return;
      }
      const fontSize = (minFontSize + maxFontSize) / 2;
      // Must be set directly.
      (text as unknown as HTMLDivElement).style.fontSize = `${fontSize}px`;
      if (isOverflown(view as unknown as HTMLDivElement)) {
        binarySearch(minFontSize, fontSize);
      } else {
        binarySearch(fontSize, maxFontSize);
      }
    };

    binarySearch(16, 2048);
  };

  const handleViewLayout = ({
    nativeEvent: {
      layout: { height, width },
    },
  }: LayoutChangeEvent) => {
    setViewRect(
      pipe(
        lens.id<Rectangle>(),
        lens.props('height', 'width'),
        lens.modify(() => ({ height, width })),
      ),
    );
  };

  const prevViewRect = useRef(viewRect);
  useEffect(() => {
    if (prevViewRect.current !== viewRect) {
      prevViewRect.current = viewRect;
      computeFontSize();
    }
  }, [viewRect]);

  const prevText = useRef(text);
  useEffect(() => {
    if (prevText.current !== text) {
      prevText.current = text;
      computeFontSize();
    }
  }, [text]);

  return (
    <View
      ref={viewRef}
      style={[t.flexGrow, t.justifyCenter]}
      onLayout={handleViewLayout}
    >
      <Text
        selectable={false}
        style={[
          t.color,
          t.textCenter,
          t.opacity0,
          // @ts-expect-error RNfW breaks words which breaks FitText logic.
          { wordWrap: 'normal', whiteSpace: 'pre' },
        ]}
        ref={textRef}
      >
        {text}
      </Text>
    </View>
  );
});
