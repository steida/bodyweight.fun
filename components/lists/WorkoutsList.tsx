import { useRouter } from 'next/router';
import { memo } from 'react';
import { Pressable, Text } from 'react-native';
import stc from 'string-to-color';
import { Workout } from '../../codecs/domain';
import { Route } from '../../codecs/routing';
import { useAppState } from '../../contexts/AppStateContext';
import { useTheme } from '../../contexts/ThemeContext';
import { InsetBorder } from '../InsetBorder';

const WorkoutItem = memo<{ workout: Workout }>(({ workout }) => {
  const t = useTheme();
  const router = useRouter();

  const handlePressablePress = () => {
    const route: Route = {
      pathname: '/workout/[id]',
      query: { id: workout.id },
    };
    router.push(route);
  };

  // TODO: Pressable should be Link, but we have to
  // sync LocalStorage across tabs first. It's must.
  return (
    <Pressable
      style={[t.mvSm, t.p, t.maxWFull]}
      accessibilityRole="button"
      onPress={handlePressablePress}
    >
      <InsetBorder style={[t.shadow, { shadowColor: stc(workout.name) }]} />
      <Text
        // numberOfLines clips emojis because it adds overflow-y: hidden;
        // I don't think we need it. Only wwwwwwwwwwwwwwwwwwwwwwww wraps.
        // numberOfLines={1}
        selectable={false}
        style={[t.text, t.color]}
      >
        {workout.name}
      </Text>
    </Pressable>
  );
});

export const WorkoutsList = () => {
  const workouts = useAppState((s) => s.workouts);

  return (
    <>
      {workouts.map((w) => (
        <WorkoutItem workout={w} key={w.id} />
      ))}
    </>
  );
};
