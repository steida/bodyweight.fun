import { memo, useCallback, useState } from 'react';
import { Pressable, Text } from 'react-native';
import stc from 'string-to-color';
import { NanoID } from '../codecs/branded';
import { Workout } from '../codecs/domain';
import { useAppState } from '../contexts/AppStateContext';
import { useTheme } from '../contexts/ThemeContext';
import { InsetBorder } from './InsetBorder';
import { WorkoutDetail } from './WorkoutDetail';

const WorkoutItem = memo<{ workout: Workout; onPress: (id: NanoID) => void }>(
  ({ workout, onPress }) => {
    const t = useTheme();

    return (
      <Pressable
        style={[t.mvSm, t.p, t.maxWFull]}
        accessibilityRole="button"
        onPress={() => {
          onPress(workout.id);
        }}
      >
        <InsetBorder style={[t.shadow, { shadowColor: stc(workout.name) }]} />
        <Text numberOfLines={1} selectable={false} style={[t.text, t.color]}>
          {workout.name}
        </Text>
      </Pressable>
    );
  },
);

export const WorkoutsList = () => {
  const workouts = useAppState((s) => s.workouts);

  const [shownWorkoutID, setShownWorkoutID] = useState<NanoID | null>(null);

  const handleWorkoutItemPress = useCallback((id: NanoID) => {
    setShownWorkoutID(id);
  }, []);

  const handleWorkoutDetailClose = useCallback(() => {
    setShownWorkoutID(null);
  }, []);

  return (
    <>
      {workouts.map((w) => (
        <WorkoutItem workout={w} key={w.id} onPress={handleWorkoutItemPress} />
      ))}
      {shownWorkoutID && (
        <WorkoutDetail
          id={shownWorkoutID}
          onRequestClose={handleWorkoutDetailClose}
        />
      )}
    </>
  );
};
