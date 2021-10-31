import { memo } from 'react';
import { Pressable, Text } from 'react-native';
import stc from 'string-to-color';
import { Workout } from '../codecs/domain';
import { useAppDispatch, useAppState } from '../contexts/AppStateContext';
import { useTheme } from '../contexts/ThemeContext';
import { InsetBorder } from './InsetBorder';

const WorkoutItem = memo<{ workout: Workout }>(({ workout }) => {
  const t = useTheme();
  const appDispatch = useAppDispatch();

  const handlePress = () => {
    appDispatch({ type: 'deleteWorkout', id: workout.id });
  };

  return (
    <Pressable
      style={[t.mvSm, t.p]}
      accessibilityRole="button"
      onPress={handlePress}
    >
      <InsetBorder style={[t.shadow, { shadowColor: stc(workout.name) }]} />
      <Text selectable={false} style={[t.text, t.color]}>
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
