import { memo } from 'react';
import { View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export interface InsetBorderProps {
  style?: View['props']['style'];
}

/**
 * Borders applied to an element affect its size, which breaks the rhythm.
 * To preserve the rhythm, we render borders as underlying elements.
 */
export const InsetBorder = memo<InsetBorderProps>(({ style }) => {
  const t = useTheme();
  return (
    <View
      style={[
        t.absolute,
        t.inset,
        t.rounded,
        t.border,
        t.borderLightGray,
        t._z1,
        t.transition,
        style,
      ]}
    />
  );
});
