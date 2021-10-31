import { pipe } from 'fp-ts/function';
import * as C from 'io-ts/Codec';
import * as D from 'io-ts/Decoder';

// Decoders

// As for branding: https://github.com/gcanti/io-ts/issues/453#issuecomment-841839778
// I think Giulio will update examples or I will use branding from previous io-ts.

interface NonEmptyStringBrand {
  readonly NonEmptyString: unique symbol;
}
type NonEmptyString = string & NonEmptyStringBrand;
const NonEmptyStringDecoder = pipe(
  D.string,
  D.parse((s) =>
    s.length > 0
      ? D.success(s as NonEmptyString)
      : D.failure(s, 'NonEmptyString'),
  ),
);

export const MaxLength = {
  32: 32,
  64: 64,
  1024: 1024,
};

interface Max32StringBrand {
  readonly Max32String: unique symbol;
}
type Max32String = NonEmptyString & Max32StringBrand;
const Max32StringDecoder = pipe(
  NonEmptyStringDecoder,
  D.parse((s) =>
    s.length <= MaxLength[32]
      ? D.success(s as Max32String)
      : D.failure(s, 'Max32String'),
  ),
);

interface Max64StringBrand {
  readonly Max64String: unique symbol;
}
type Max64String = NonEmptyString & Max64StringBrand;
const Max64StringDecoder = pipe(
  NonEmptyStringDecoder,
  D.parse((s) =>
    s.length <= MaxLength[64]
      ? D.success(s as Max64String)
      : D.failure(s, 'Max64String'),
  ),
);

interface Max1024StringBrand {
  readonly Max1024String: unique symbol;
}
type Max1024String = NonEmptyString & Max1024StringBrand;
const Max1024StringDecoder = pipe(
  NonEmptyStringDecoder,
  D.parse((s) =>
    s.length <= MaxLength[1024]
      ? D.success(s as Max1024String)
      : D.failure(s, 'Max1024String'),
  ),
);

interface NanoIDStringBrand {
  readonly NanoIDString: unique symbol;
}
type NanoIDString = NonEmptyString & NanoIDStringBrand;
const NanoIDStringDecoder = pipe(
  NonEmptyStringDecoder,
  D.parse((s) =>
    s.length === 21
      ? D.success(s as NanoIDString)
      : D.failure(s, 'NanoIDString'),
  ),
);

// Codecs

export const String32 = C.make(Max32StringDecoder, { encode: String });
export type String32 = C.TypeOf<typeof String32>;

export const String64 = C.make(Max64StringDecoder, { encode: String });
export type String64 = C.TypeOf<typeof String64>;

export const String1024 = C.make(Max1024StringDecoder, { encode: String });
export type String1024 = C.TypeOf<typeof String1024>;

export const NanoID = C.make(NanoIDStringDecoder, { encode: String });
export type NanoID = C.TypeOf<typeof NanoID>;
