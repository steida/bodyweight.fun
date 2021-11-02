import { option, readonlyArray } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { memo, useEffect } from 'react';
import { NanoID } from '../codecs/branded';
import { useAppState } from '../contexts/AppStateContext';
import { useTheme } from '../contexts/ThemeContext';
import { Heading } from './elements/Heading';
import { Modal } from './Modal';

export const WorkoutDetail = memo<{
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

  useEffect(() => {
    if (workout == null) onRequestClose();
  }, [onRequestClose, workout]);

  return (
    workout && (
      <Modal onRequestClose={onRequestClose}>
        <Heading level={2} style={[t.text, t.color]}>
          {workout.name}
        </Heading>
      </Modal>
    )
  );
});
