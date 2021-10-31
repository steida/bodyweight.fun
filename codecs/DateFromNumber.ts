import { pipe } from 'fp-ts/function';
import * as C from 'io-ts/Codec';
import * as D from 'io-ts/Decoder';

export const DateFromNumber = C.make(
  pipe(
    D.number,
    D.parse((n) => {
      const d = new Date(n);
      return isNaN(d.getTime()) ? D.failure(n, 'DateFromNumber') : D.success(d);
    }),
  ),
  {
    encode: (d) => d.getTime(),
  },
);
