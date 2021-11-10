import { useIntl } from 'react-intl';
import { CreateWorkoutForm } from '../components/forms/CreateWorkoutForm';
import { WorkoutsList } from '../components/lists/WorkoutsList';
import { Title } from '../components/Title';
import { ViewHiddenUntilStorageIsRehydrated } from '../components/ViewHiddenUntilStorageIsRehydrated';

const Home = () => {
  const intl = useIntl();

  return (
    <>
      <Title
        title={intl.formatMessage({
          defaultMessage: 'Your calisthenics trainer',
        })}
      />
      <ViewHiddenUntilStorageIsRehydrated>
        <WorkoutsList />
        <CreateWorkoutForm />
      </ViewHiddenUntilStorageIsRehydrated>
    </>
  );
};

export default Home;
