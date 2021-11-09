import { either, option, readonlyArray } from 'fp-ts';
import { Clipboard } from 'react-native';
import { constVoid, flow, pipe } from 'fp-ts/function';
import { memo, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Text, View } from 'react-native';
import stc from 'string-to-color';
import { MaxLength, NanoID, String1024, String32 } from '../../codecs/branded';
import {
  initialAppState,
  useAppDispatch,
  useAppState,
} from '../../contexts/AppStateContext';
import { useTheme } from '../../contexts/ThemeContext';
import { stringToExercises } from '../../utils/stringToExercises';
import { OutlineButton } from '../buttons/OutlineButton';
import { PrimaryButton } from '../buttons/PrimaryButton';
import { TextButton } from '../buttons/TextButton';
import { WorkoutModal } from '../WorkoutModal';
import { TextField } from '../fields/TextField';
import { Modal } from '../Modal';
import { Stack } from '../Stack';
import { Workout } from '../../codecs/domain';
import { Title } from '../Title';
import { serializeWorkout } from '../../utils/workoutSerialization';

const WorkoutNameField = memo<{ id: NanoID; value: String32 }>(
  ({ id, value }) => {
    const intl = useIntl();
    const appDispatch = useAppDispatch();

    const handleChangeText = flow(
      String32.decode,
      either.match(constVoid, (value) => {
        appDispatch({ type: 'updateWorkoutName', id, value });
      }),
    );

    return (
      <TextField
        maxLength={MaxLength['32']}
        label={intl.formatMessage({ defaultMessage: 'Workout Name' })}
        value={value}
        onChangeText={handleChangeText}
      />
    );
  },
);

const WorkoutExercisesField = memo<{ id: NanoID; value: String1024 }>(
  ({ id, value }) => {
    const intl = useIntl();
    const appDispatch = useAppDispatch();

    const handleChangeText = (s: string) =>
      pipe(
        String1024.decode(s),
        either.match(constVoid, (value) => {
          appDispatch({ type: 'updateWorkoutExercises', id, value });
        }),
      );

    const handleExamplePress = () => {
      const example = initialAppState.workouts[0].exercises;
      handleChangeText(value.length === 0 ? example : `${value}\n\n${example}`);
    };

    return (
      <TextField
        maxLength={MaxLength['1024']}
        multiline
        numberOfLines={8}
        label={intl.formatMessage({ defaultMessage: 'Workout Exercises' })}
        value={value}
        onChangeText={handleChangeText}
        afterLabel={
          <TextButton
            title={intl.formatMessage({ defaultMessage: 'Example' })}
            onPress={handleExamplePress}
          />
        }
      />
    );
  },
);

const Buttons = memo<{
  id: NanoID;
  workout: Workout;
  onRequestClose: () => void;
}>(({ id, workout, onRequestClose }) => {
  const t = useTheme();
  const intl = useIntl();
  const appDispatch = useAppDispatch();

  const handleDeletePress = () => {
    appDispatch({ type: 'deleteWorkout', id });
  };

  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  useEffect(() => {
    if (!copiedToClipboard) return;
    const timeout = setTimeout(() => {
      setCopiedToClipboard(false);
    }, 2000);
    return () => {
      clearTimeout(timeout);
    };
  }, [copiedToClipboard]);

  const exercisesModel = useMemo(
    () => stringToExercises(workout.exercises),
    [workout.exercises],
  );

  const handleSharePress = () => {
    const hash = serializeWorkout(workout);
    const link = `${location.origin}#${hash}`;
    // "copying in Safari will only work if it is coming from DOM event"
    // https://stackoverflow.com/a/65389852/233902
    Clipboard.setString(link);
    setCopiedToClipboard(true);
  };

  const [modalIsVisible, setModalIsVisible] = useState(false);

  const handleStartPress = () => {
    setModalIsVisible(true);
  };

  const handleExerciseModalRequestClose = () => {
    setModalIsVisible(false);
  };

  const [showOtherButtons, setShowOtherButtons] = useState(false);

  return (
    <>
      <Title title={workout.name} />
      {modalIsVisible && option.isSome(exercisesModel) && (
        <WorkoutModal
          name={workout.name}
          exercises={exercisesModel.value}
          onRequestClose={handleExerciseModalRequestClose}
        />
      )}
      {copiedToClipboard ? (
        <Text style={[t.text, t.color, t.textCenter, t.pvSm]}>
          {intl.formatMessage({ defaultMessage: 'Copied to clipboard.' })}
        </Text>
      ) : showOtherButtons ? (
        <Stack direction="row" style={t.justifyCenter}>
          <OutlineButton
            title={intl.formatMessage({ defaultMessage: '…' })}
            onPress={() => setShowOtherButtons(false)}
          />
          <OutlineButton
            title={intl.formatMessage({ defaultMessage: 'Delete' })}
            onPress={handleDeletePress}
          />
          <PrimaryButton
            title={intl.formatMessage({ defaultMessage: 'Share' })}
            disabled={option.isNone(exercisesModel)}
            onPress={handleSharePress}
          />
        </Stack>
      ) : (
        <Stack direction="row" style={t.justifyCenter}>
          <PrimaryButton
            title={intl.formatMessage({ defaultMessage: 'Start' })}
            disabled={option.isNone(exercisesModel)}
            onPress={handleStartPress}
          />
          <OutlineButton
            title={intl.formatMessage({ defaultMessage: 'Close' })}
            onPress={onRequestClose}
          />
          <OutlineButton
            title={intl.formatMessage({ defaultMessage: '…' })}
            onPress={() => setShowOtherButtons(true)}
          />
        </Stack>
      )}
    </>
  );
});

export const WorkoutDetailForm = memo<{
  id: NanoID;
  onRequestClose: () => void;
}>(({ id, onRequestClose }) => {
  const t = useTheme();

  const workout = useAppState((s) =>
    pipe(
      s.workouts,
      readonlyArray.findFirst((w) => w.id === id),
      option.toNullable,
    ),
  );

  // Close WorkoutDetailForm when a workout is deleted.
  useEffect(() => {
    if (workout == null) onRequestClose();
  }, [onRequestClose, workout]);

  return (
    workout && (
      <Modal onRequestClose={onRequestClose} shadowColor={stc(workout.name)}>
        <View style={[t.width13, t.mh, t.mb]}>
          <Stack>
            <WorkoutNameField id={workout.id} value={workout.name} />
            <WorkoutExercisesField id={workout.id} value={workout.exercises} />
          </Stack>
        </View>
        <Buttons id={id} workout={workout} onRequestClose={onRequestClose} />
      </Modal>
    )
  );
});
