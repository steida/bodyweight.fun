import { either, option, readonlyArray, record } from 'fp-ts';
import { constVoid, flow, pipe } from 'fp-ts/function';
import { useRouter } from 'next/router';
import { FC, memo, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Clipboard, Text, View } from 'react-native';
import stc from 'string-to-color';
import {
  MaxLength,
  NanoID,
  String1024,
  String32,
} from '../../../codecs/branded';
import { Workout } from '../../../codecs/domain';
import { Route, WorkoutRoute } from '../../../codecs/routing';
import { OutlineButton } from '../../../components/buttons/OutlineButton';
import { PrimaryButton } from '../../../components/buttons/PrimaryButton';
import { TextButton } from '../../../components/buttons/TextButton';
import { TextField } from '../../../components/fields/TextField';
import { InsetBorder } from '../../../components/InsetBorder';
import { Stack } from '../../../components/Stack';
import { Title } from '../../../components/Title';
import {
  initialAppState,
  useAppDispatch,
  useAppState,
} from '../../../contexts/AppStateContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { workoutToExercises } from '../../../utils/workoutToExercises';
import { serializeWorkout } from '../../../utils/workoutSerialization';
import Page404 from '../../404';

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
}>(({ id, workout }) => {
  const t = useTheme();
  const intl = useIntl();
  const appDispatch = useAppDispatch();
  const router = useRouter();

  const handleDeletePress = () => {
    appDispatch({ type: 'deleteWorkout', id });
    const route: Route = { pathname: '/' };
    router.push(route);
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

  const exercisesModel = useMemo(() => workoutToExercises(workout), [workout]);

  const handleSharePress = () => {
    const hash = serializeWorkout(workout);
    const link = `${location.origin}#${hash}`;
    // "copying in Safari will only work if it is coming from DOM event"
    // https://stackoverflow.com/a/65389852/233902
    Clipboard.setString(link);
    setCopiedToClipboard(true);
  };

  const handleStartPress = () => {
    const route: Route = { pathname: '/workout/[id]/play', query: { id } };
    router.push(route);
  };

  const handleClosePress = () => {
    const route: Route = { pathname: '/' };
    router.push(route);
  };

  const [showOtherButtons, setShowOtherButtons] = useState(false);

  return (
    <>
      <Title title={workout.name} />
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
          {/*
            TODO: Start and Close should be links, but we have to
            sync LocalStorage across tabs first. It's must.
           */}
          <PrimaryButton
            title={intl.formatMessage({ defaultMessage: 'Start' })}
            disabled={option.isNone(exercisesModel)}
            onPress={handleStartPress}
          />
          <OutlineButton
            title={intl.formatMessage({ defaultMessage: 'Close' })}
            onPress={handleClosePress}
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

const WorkoutForm: FC<{ workout: Workout }> = ({ workout }) => {
  const t = useTheme();
  const shadowColor = stc(workout.name);

  return (
    <View style={[t.pv, t.phLg]}>
      <InsetBorder
        style={[t.shadow, t.bgColor, { shadowColor }]}
        slowTransition={true}
      />
      <View style={[t.width13, t.mh, t.mb]}>
        <Stack>
          <WorkoutNameField id={workout.id} value={workout.name} />
          <WorkoutExercisesField id={workout.id} value={workout.exercises} />
        </Stack>
      </View>
      <Buttons id={workout.id} workout={workout} />
    </View>
  );
};

const WorkoutPageWithID: FC<{ id: NanoID }> = ({ id }) => {
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
      (workout) => <WorkoutForm workout={workout} />,
    ),
  );
};

const WorkoutPage = () => {
  const router = useRouter();
  // There is no reason to render anything. Only the client has data.
  if (record.isEmpty(router.query)) return null;

  return pipe(
    WorkoutRoute.decode(router),
    either.match(
      // Render Page404 for the wrong query. We render Page404 also
      // for the missing workout, but with this approach, we can render
      // a custom workout 404 page.
      () => <Page404 />,
      ({ query: { id } }) => <WorkoutPageWithID id={id} />,
    ),
  );
};

export default WorkoutPage;
