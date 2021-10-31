import { useIntl } from 'react-intl';
import { View } from 'react-native';
import { CreateWorkoutForm } from '../components/CreateWorkoutForm';
import { Title } from '../components/Title';
import { WorkoutsList } from '../components/WorkoutsList';
import { useTheme } from '../contexts/ThemeContext';

const Home = () => {
  const intl = useIntl();
  const t = useTheme();

  return (
    <>
      <Title
        title={intl.formatMessage({
          defaultMessage: 'Your calisthenics trainer',
        })}
      />
      <View style={[t.justifyCenter, t.itemsCenter, t.flexGrow]}>
        <WorkoutsList />
        <View style={t.mt}>
          <CreateWorkoutForm />
        </View>
      </View>
    </>
  );
};

export default Home;
