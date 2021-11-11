import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { Pressable, PressableProps } from 'react-native';
import { Route } from '../../codecs/routing';

export interface LinkProps {
  href: Route;
  children:
    | ReactNode
    | ((state: {
        active: boolean;
        hovered: boolean;
        pressed: boolean;
      }) => ReactNode);
  onPress?: PressableProps['onPress'];
  style?: PressableProps['style'];
}

export const Link = ({ href, children, onPress, style }: LinkProps) => {
  const router = useRouter();

  const active =
    href.pathname === router.pathname &&
    // @ts-expect-error I know but it's safe.
    JSON.stringify(href.query) === JSON.stringify(router.query);

  // Why Pressable has to be a parent of Next.js Link.
  // https://github.com/necolas/react-native-web/issues/1885#issuecomment-907837508

  return (
    <Pressable
      // Anchor is focusable by default so Pressable don't have to be.
      focusable={false}
      onPress={onPress}
      style={style}
    >
      {({ hovered, pressed }) => (
        <NextLink href={href} passHref>
          {typeof children === 'function'
            ? children({ active, pressed, hovered: hovered as boolean })
            : children}
        </NextLink>
      )}
    </Pressable>
  );
};
