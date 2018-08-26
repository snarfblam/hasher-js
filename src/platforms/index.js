
import NesPlatform from './nes';
import FdsPlatform from './fds';
import SnesPlatform from './snes';
import GbPlatform from './gb';
import GbaPlatform from './gba';
import SmsPlatform from './sms';
import GgPlatform from './gg';
import GenPlatform from './gen';
import NgpPlatform from './ngp';
import NdsPlatform from './nds';
import N64Platform from './n64';


// export default [NES, SNES, GB, GBA, FDS, SMS, GG, GEN, NGP, NDS];

export default [
    new NesPlatform(),
    new SnesPlatform(),
    new GenPlatform(),
    new FdsPlatform(),
    new GbPlatform(),
    new GbaPlatform(),
    new NgpPlatform(),
    new GgPlatform(),
    new SmsPlatform(),
    new NdsPlatform(),
    new N64Platform(),
];
