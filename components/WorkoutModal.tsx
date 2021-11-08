import { option, readonlyArray } from 'fp-ts';
import { decrement, increment, pipe } from 'fp-ts/function';
import {
  FC,
  KeyboardEvent,
  memo,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useIntl } from 'react-intl';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSpring } from 'react-spring';
import { String32 } from '../codecs/branded';
import { useTheme } from '../contexts/ThemeContext';
import { Exercise, Exercises } from '../utils/stringToExercises';
import { AnimatedView } from './AnimatedView';
import { FitText } from './FitText';
import { Title } from './Title';

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

const MinutesScreen = memo<{
  exercise: Extract<Exercise, { type: 'minutes' }>;
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
      duration: exercise.minutes * 60 * 1000,
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

export const WorkoutModal = memo<{
  name: String32;
  exercises: Exercises;
  onRequestClose: () => void;
}>(({ exercises: { exercises, rounds }, onRequestClose }) => {
  const intl = useIntl();
  const t = useTheme();
  const [currentRound, setCurrentRound] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(0);
  const exercise = pipe(exercises, readonlyArray.lookup(currentExercise));
  const [animIsPending, setAnimIsPending] = useState(false);

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
    switch (exercise.type) {
      case 'minutes':
        return (
          <MinutesScreen
            isShown={index === currentExercise && !animIsPending}
            exercise={exercise}
            onEnd={handleNextPress}
            key={index}
          />
        );
      case 'noParams':
        return <NoParamsScreen exercise={exercise} key={index} />;
      case 'repetitions':
        return <RepetitionsScreen exercise={exercise} key={index} />;
    }
  };

  return (
    <Modal visible onRequestClose={onRequestClose}>
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
    </Modal>
  );
});
