import { literal, struct, sum, TypeOf } from 'io-ts/Codec';

// We use URL Object because it can be typed and query values
// are processed with encodeURIComponent by default.
// https://nextjs.org/docs/routing/introduction#linking-to-dynamic-paths

// Href as io-ts Codec allows us to render 404 on wrong router query,
// check TypedRouterProvider.
export const Href = sum('pathname')({
  '/': struct({ pathname: literal('/') }),
  // '/login': struct({ pathname: literal('/login') }),
  // '/signup': struct({ pathname: literal('/signup') }),
  // '/lend': struct({ pathname: literal('/lend') }),
  // '/borrow': struct({ pathname: literal('/borrow') }),
  // '/account': struct({ pathname: literal('/account') }),
  // '/users/[id]': struct({
  //   pathname: literal('/users/[id]'),
  //   query: struct({ id: FaunaID }),
  // }),
  // '/people': struct({ pathname: literal('/people') }),
  // '/privacy-first': struct({ pathname: literal('/privacy-first') }),
  // '/blog': struct({ pathname: literal('/blog') }),
});

export type Href = TypeOf<typeof Href>;
