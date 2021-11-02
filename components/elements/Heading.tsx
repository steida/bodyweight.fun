import { Platform, Text } from 'react-native';

// No accessibilityRole="heading" in RN.
// https://github.com/react-native-community/discussions-and-proposals/pull/146

export const Heading = ({
  level,
  ...props
}: Text['props'] & { level?: 2 | 3 }) => {
  return (
    <Text
      {...props}
      {...Platform.select({
        web: {
          accessibilityRole: 'heading' as 'none',
          accessibilityLevel: level || 1,
        },
      })}
    />
  );
};
