import { constFalse } from 'fp-ts/function';
import { forwardRef } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Button, ButtonProps } from './Button';

export type TextButtonProps = ButtonProps;

export const TextButton = forwardRef<View, ButtonProps>(
  ({ style, textStyle, ...props }, ref) => {
    const t = useTheme();
    return (
      <Button
        style={(state) => [
          t.transition,
          state.disabled
            ? t.opacityDisabled
            : state.pressed
            ? t.opacityPressed
            : [],
          style && style(state),
        ]}
        renderBorder={constFalse}
        textStyle={(state) => [
          t.transition,
          t.textSm,
          state.pressed || state.hovered ? t.color : t.colorGray,
          textStyle && textStyle(state),
        ]}
        {...props}
        ref={ref}
      />
    );
  },
);
