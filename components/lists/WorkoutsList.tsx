import { eq } from 'fp-ts';
import { Eq } from 'fp-ts/Eq';
import { memo } from 'react';
import { Text, View } from 'react-native';
import stc from 'string-to-color';
import { eqWorkout, Workout } from '../../codecs/domain';
import { useAppState } from '../../contexts/AppStateContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from '../elements/Link';
import { InsetBorder } from '../InsetBorder';

interface WorkoutItemProps {
  workout: Workout;
}

const eqWorkoutItemProps: Eq<{ workout: Workout }> = eq.struct({
  workout: eqWorkout,
});

const WorkoutItem = memo<WorkoutItemProps>(({ workout }) => {
  const t = useTheme();

  return (
    <Link href={{ pathname: '/workout/[id]', query: { id: workout.id } }}>
      <View style={[t.mvSm, t.p, t.maxWFull]}>
        <InsetBorder style={[t.shadow, { shadowColor: stc(workout.name) }]} />
        <Text
          // numberOfLines clips emojis because it adds overflow-y: hidden;
          // I'm pretty sure we don't need it. Only wwwwwwwwwwwwwwwwwwwwwwww wraps.
          // numberOfLines={1}
          selectable={false}
          style={[t.text, t.color]}
        >
          {workout.name}
        </Text>
      </View>
    </Link>
  );
}, eqWorkoutItemProps.equals);

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
