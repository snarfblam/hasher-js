/**
 * Object containing NES-specific data and functions
 */

import smsUtil from '../romUtils/smsUtil';
import { toHex } from '../util';
import RomRegion from '../RomRegion';


import Platform_gg_sms from './Platform_gg_sms';

class SmsPlatform extends Platform_gg_sms {
    constructor() {
        super(
            // Name, long name, extensions
            'SMS', 'Master System', ['sms'],
            // Region codes
            [3, 4],
            // File format name
            'Master System ROM image'
        );
    }
}





export default SmsPlatform;