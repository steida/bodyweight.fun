import Head from 'next/head';
import { memo } from 'react';

export const Title = memo(({ title }: { title: string }) => {
  return (
    <Head>
      <title>{title} – Bodyweight Fun</title>
    </Head>
  );
});
