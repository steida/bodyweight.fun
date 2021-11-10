import { either, option, readonlyArray, record } from 'fp-ts';
import { constNull, decrement, flow, increment, pipe } from 'fp-ts/function';
import { useRouter } from 'next/router';
import {
  FC,
  KeyboardEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useIntl } from 'react-intl';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSpring } from 'react-spring';
import { NanoID } from '../../../codecs/branded';
import { Exercise, Exercises, Workout } from '../../../codecs/domain';
import { Route, WorkoutPlayRoute } from '../../../codecs/routing';
import { AnimatedView } from '../../../components/AnimatedView';
import { FitText } from '../../../components/FitText';
import { Title } from '../../../components/Title';
import { useAppState } from '../../../contexts/AppStateContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { workoutToExercises } from '../../../utils/workoutToExercises';
import Page404 from '../../404';

const Screen: FC<{ name: string }> = ({ name, children }) => {
  const t = useTheme();

  return (
    <View style={[t.flexGrow, t.viewportWidth100, t.overflowHidden]}>
      {children}
      <View style={[t.absolute, t.inset]}>
        <FitText text={`\xa0${name}\xa0`} />
      </View>
    </View>
  );
};

const NoParamsScreen = memo<{
  exercise: Extract<Exercise, { type: 'noParams' }>;
}>(({ exercise }) => {
  return <Screen name={exercise.name} />;
});

const TimeScreen = memo<{
  exercise: Extract<Exercise, { type: 'minutes' | 'seconds' }>;
  isShown: boolean;
  onEnd: () => void;
}>(({ exercise, onEnd, isShown }) => {
  const t = useTheme();

  const styles = useSpring({
    from: { translateX: '-100%' },
    to: { translateX: '0%' },
    onRest: (result) => {
      if (result.finished) onEnd();
    },
    pause: !isShown,
    config: {
      duration:
        exercise.type === 'minutes'
          ? exercise.minutes * 60 * 1000
          : exercise.seconds * 1000,
    },
  });

  const { backgroundColor } = StyleSheet.flatten(t.bgColorInverted);
  const { opacity } = StyleSheet.flatten(t.opacity02);

  return (
    <Screen name={exercise.name}>
      <AnimatedView
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          // @ts-expect-error RNfW
          backgroundColor,
          opacity,
          // translateX: '-100%',
          ...styles,
        }}
      />
    </Screen>
  );
});

const RepetitionsScreen = memo<{
  exercise: Extract<Exercise, { type: 'repetitions' }>;
}>(({ exercise }) => {
  const t = useTheme();
  return (
    <Screen name={exercise.name}>
      <View style={[t.absolute, t.inset, t.opacity02]}>
        <FitText text={exercise.repetitions.toString()} />
      </View>
    </Screen>
  );
});

const WorkoutPlay: FC<{ id: NanoID; exercises: Exercises }> = ({
  id,
  exercises: { exercises, rounds },
}) => {
  const intl = useIntl();
  const t = useTheme();
  const [currentRound, setCurrentRound] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(0);
  const exercise = pipe(exercises, readonlyArray.lookup(currentExercise));
  const [animIsPending, setAnimIsPending] = useState(false);
  const router = useRouter();

  const handleSpringStart = useCallback(() => {
    setAnimIsPending(true);
  }, []);

  const handleSpringRest = useCallback(() => {
    setAnimIsPending(false);
  }, []);

  const styles = useSpring({
    translateX: `-${(currentExercise * 100) / exercises.length}%`,
    onStart: handleSpringStart,
    onRest: handleSpringRest,
  });

  const onRequestClose = useCallback(() => {
    const route: Route = {
      pathname: '/workout/[id]',
      query: { id },
    };
    router.push(route);
  }, [id, router]);

  useEffect(() => {
    if (option.isNone(exercise)) onRequestClose();
  }, [exercise, onRequestClose]);

  const handlePreviousPress = useCallback(() => {
    if (currentExercise === 0) {
      if (currentRound > 0) {
        setCurrentRound(decrement);
        setCurrentExercise(exercises.length - 1);
      } else {
        onRequestClose();
      }
    } else {
      setCurrentExercise(decrement);
    }
  }, [currentExercise, currentRound, exercises.length, onRequestClose]);

  const handleNextPress = useCallback(() => {
    if (currentExercise === exercises.length - 1) {
      if (currentRound < rounds - 1) {
        setCurrentRound(increment);
        setCurrentExercise(0);
      } else {
        onRequestClose();
      }
    } else {
      setCurrentExercise(increment);
    }
  }, [currentExercise, currentRound, exercises.length, onRequestClose, rounds]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePreviousPress();
          break;
        case 'ArrowRight':
          handleNextPress();
          break;
      }
    },
    [handleNextPress, handlePreviousPress],
  );

  if (option.isNone(exercise)) return null;

  const renderExercise = (exercise: Exercise, index: number): JSX.Element => {
    const key = `${currentRound}-${index}`;
    switch (exercise.type) {
      case 'noParams':
        return <NoParamsScreen exercise={exercise} key={key} />;
      case 'seconds':
      case 'minutes':
        return (
          <TimeScreen
            isShown={index === currentExercise && !animIsPending}
            exercise={exercise}
            onEnd={handleNextPress}
            key={key}
          />
        );
      case 'repetitions':
        return <RepetitionsScreen exercise={exercise} key={key} />;
    }
  };

  return (
    <>
      <Title title={exercise.value.name} />
      <View style={[t.absolute, t.inset, t.overflowHidden]}>
        <AnimatedView
          style={{
            position: 'absolute',
            flexDirection: 'row',
            left: 0,
            top: 0,
            bottom: 0,
            ...styles,
          }}
        >
          {exercises.map(renderExercise)}
        </AnimatedView>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={intl.formatMessage({
          defaultMessage: 'Previous Exercise',
        })}
        style={[
          t.absolute,
          t.noOutline,
          { top: 0, bottom: 0, left: 0, right: '50%' },
        ]}
        onPress={handlePreviousPress}
        // @ts-expect-error RNfW
        onKeyDown={handleKeyDown}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={intl.formatMessage({
          defaultMessage: 'Next Exercise',
        })}
        style={[
          t.absolute,
          t.noOutline,
          { top: 0, bottom: 0, left: '50%', right: 0 },
        ]}
        onPress={handleNextPress}
        // @ts-expect-error RNfW
        onKeyDown={handleKeyDown}
      />
    </>
  );
};

const WorkoutPlayPageWithWorkout: FC<{ workout: Workout }> = ({ workout }) => {
  const exercises = useMemo(() => workoutToExercises(workout), [workout]);

  return pipe(
    exercises,
    // constNull can happen only if another tab invalidated exercises string.
    // Render nothing is probably the best.
    option.match(constNull, (exercises) => (
      <WorkoutPlay id={workout.id} exercises={exercises} />
    )),
  );
};

const WorkoutPlayPageWithID: FC<{ id: NanoID }> = ({ id }) => {
  const workout = useAppState(
    flow(
      (s) => s.workouts,
      readonlyArray.findFirst((w) => w.id === id),
    ),
  );

  return pipe(
    workout,
    option.match(
      () => <Page404 />,
      (workout) => <WorkoutPlayPageWithWorkout workout={workout} />,
    ),
  );
};

const WorkoutPlayPage = () => {
  const router = useRouter();
  if (record.isEmpty(router.query)) return null;

  return pipe(
    WorkoutPlayRoute.decode(router),
    either.match(
      () => <Page404 />,
      ({ query: { id } }) => <WorkoutPlayPageWithID id={id} />,
    ),
  );
};

export default WorkoutPlayPage;
