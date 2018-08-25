import NES, { NesPlatform } from './nes';
import { FdsPlatform} from './fds';
import SNES, {SnesPlatform} from './snes';
import {GbPlatform} from './gb';
import {GbaPlatform} from './gba';
import SMS from './sms';
import GG from './gg';
// import GEN from './gen';
import { GenPlatform } from './gen';
import {NgpPlatform} from './ngp';
import NDS from './nds';

// export default [NES, SNES, GB, GBA, FDS, SMS, GG, GEN, NGP, NDS];

export default [
    new NesPlatform(),
    new SnesPlatform(),
    new GenPlatform(),
    new FdsPlatform(),
    new GbPlatform(),
    new GbaPlatform(),
    new NgpPlatform(),
];