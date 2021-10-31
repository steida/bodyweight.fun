import { forwardRef } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Button, ButtonProps } from './Button';

export const PrimaryButton = forwardRef<View, ButtonProps>(
  ({ style, borderStyle, textStyle, ...props }, ref) => {
    const t = useTheme();
    return (
      <Button
        style={(state) => [
          t.transition,
          t.ph,
          t.pvXS,
          t.mvXS,
          t.rounded,
          state.disabled
            ? [t.opacityDisabled, t.bgColorInverted]
            : state.pressed
            ? [t.opacityPressed, t.bgColor]
            : state.hovered
            ? t.bgColor
            : t.bgColorInverted,
          style && style(state),
        ]}
        borderStyle={(state) => [
          t.borderBlack,
          borderStyle && borderStyle(state),
        ]}
        textStyle={(state) => [
          t.transition,
          t.textSm,
          t.textBold,
          t.textCenter,
          state.disabled
            ? [t.colorInverted]
            : state.pressed || state.hovered
            ? t.color
            : t.colorInverted,
          textStyle && textStyle(state),
        ]}
        {...props}
        ref={ref}
      />
    );
  },
);
