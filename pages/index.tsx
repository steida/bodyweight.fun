import { useIntl } from 'react-intl';
import { Text, View } from 'react-native';
import { Link } from '../components/elements/Link';
import { CreateWorkoutForm } from '../components/forms/CreateWorkoutForm';
import { WorkoutsList } from '../components/lists/WorkoutsList';
import { Title } from '../components/Title';
import { ViewHiddenUntilStorageIsRehydrated } from '../components/ViewHiddenUntilStorageIsRehydrated';
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
      <ViewHiddenUntilStorageIsRehydrated
        style={t.centeredViewportHeightMin100}
      >
        {/* Ensure the same width for all children. */}
        <View>
          <WorkoutsList />
          <View style={[t.flexRow, t.justifyCenter, t.pt, t.pbSm]}>
            <CreateWorkoutForm />
          </View>
          <View style={[t.flexRow, t.justifyCenter]}>
            <Link href={{ pathname: '/blog' }}>
              {({ hovered }) => (
                <Text style={[t.text, hovered ? t.color : t.colorGray]}>
                  Blog
                </Text>
              )}
            </Link>
          </View>
        </View>
      </ViewHiddenUntilStorageIsRehydrated>
    </>
  );
};

export default Home;
