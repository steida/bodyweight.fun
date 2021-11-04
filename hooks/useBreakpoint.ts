import { useWindowDimensions } from 'react-native';

/**
 * breakpoint === 'mobile' ? t.text : t.textSm
 * https://tailwindcss.com/docs/responsive-design#customizing-breakpoints
 */
export const useBreakpoint = (): 'mobile' | 'tablet' | 'desktop' => {
  const { width } = useWindowDimensions();
  return width > 1024 ? 'desktop' : width > 640 ? 'tablet' : 'mobile';
};
