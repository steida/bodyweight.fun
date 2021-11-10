import { Platform, Text } from 'react-native';

// No accessibilityRole="paragraph" in RN.
// https://github.com/react-native-community/discussions-and-proposals/pull/146

export const Paragraph = (props: Text['props']) => {
  return (
    <Text
      {...props}
      {...Platform.select({
        web: {
          accessibilityRole: 'paragraph',
        },
      } as any)}
    />
  );
};
