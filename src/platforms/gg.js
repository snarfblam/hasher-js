/**
 * Object containing NES-specific data and functions
 */

import smsUtil from '../romUtils/smsUtil';
import { toHex } from '../util';
import RomRegion from '../RomRegion';
import Platform from './Platform';
const category = Platform.exDataCategories;

import Platform_gg_sms from './Platform_gg_sms';

// function yesNo(bool) {
//     return bool ? "yes" : "no";
// }


class GgPlatform extends Platform_gg_sms {
    constructor() {
        super(
            // Name, long name, extensions
            'GG', 'Game Gear', ['gg'],
            // Region codes
            [5, 6, 7],
            // File format name
            'Game Gear ROM image'
        );
    }
}

export default GgPlatform;