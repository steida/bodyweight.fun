import { IO } from 'fp-ts/IO';
import { nanoid } from 'nanoid';
import { NanoID } from '../codecs/branded';

export const createNanoID: IO<NanoID> = () => nanoid() as NanoID;
