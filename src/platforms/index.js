import NES, { NesPlatform } from './nes';
import FDS from './fds';
import SNES from './snes';
import GB from './gb';
import GBA from './gba';
import SMS from './sms';
import GG from './gg';
import GEN from './gen';
import NGP from './ngp';
import NDS from './nds';

// export default [NES, SNES, GB, GBA, FDS, SMS, GG, GEN, NGP, NDS];

export default [new NesPlatform()];