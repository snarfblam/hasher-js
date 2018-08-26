// @ts-check

var headerFlags = {
    // byte 6
    verticalMirroring: 1,
    battery: 2,
    trainer: 4,
    fourScreen: 8,
    mapper: 240, // 6 & 7
    
    // byte 7
    vsUnisystem: 1,
    playchoice10: 2,
    nes2: 12,

    // byte 9
    pal: 1,

}

var mappers = [];
{ // Is there a good way to initialize sparse arrays? ¯\_(ツ)_/¯ 
   mappers[0] = 'NoMapper';
   mappers[1] = 'MMC1';
   mappers[2] = 'UxROM';
   mappers[3] = 'CxROM';
   mappers[4] = 'MMC3';
   mappers[5] = 'MMC5';
   mappers[6] = 'FFE_F4';
   mappers[7] = 'AxROM';
   mappers[8] = 'FFE_F3';
   mappers[9] = 'MMC2';
   mappers[10] = 'MMC4';
   mappers[11] = 'ColorDreams';
   mappers[12] = 'FFE_F6';
   mappers[13] = 'CPROM';
   mappers[15] = 'Contra_100_in_1';
   mappers[16] = 'Bandai';
   mappers[17] = 'FFE_F8';
   mappers[18] = 'Jaleco_SS8806';
   mappers[19] = 'Namcot_106';
   mappers[20] = 'Mapper_20';
   mappers[21] = 'VRC4';
   mappers[22] = 'VRC2_A';
   mappers[23] = 'VRC2_B';
   mappers[24] = 'VRC6';
   mappers[25] = 'VRC4_Y';
   mappers[32] = 'Irem_G101';
   mappers[33] = 'Taito_TC0190';
   mappers[34] = 'BxRom';
   mappers[64] = 'Tengen_RAMBO_1';
   mappers[65] = 'Irem_H_3001';
   mappers[66] = 'GNROM';
   mappers[67] = 'Sunsoft_3';
   mappers[68] = 'Sunsoft_4';
   mappers[69] = 'Sunsoft_FME_07';
   mappers[71] = 'Camerica';
   mappers[73] = 'VCR3';
   mappers[74] = 'MMC3_Pirate_Variant';
   mappers[75] = 'VRC1';
   mappers[78] = 'Irem_74HC161';
   mappers[79] = 'Nina003';
   mappers[80] = 'X005';
   mappers[81] = 'C075';
   mappers[82] = 'X1_17';
   mappers[83] = 'Cony';
   mappers[84] = 'PasoFami';
   mappers[85] = 'VRC7';
   mappers[91] = 'PC_HK_SF3';
   mappers[94] = 'Capcom';
   mappers[118] = 'TxSROM';
   mappers[119] = 'TQROM';
   mappers[180] = 'Nichibutsu';
}

/**
 * Decodes an iNES ROM header
 * @constructor
 * @param {Uint8Array} romImage iNES ROM image
 */
function iNESHeader(romImage) {
    if (!(this instanceof iNESHeader)) throw Error('Missing new on iNESHeader constructor');

    /** The 4-byte string at the beginning of the header */
    this.magicNumber = (
        String.fromCharCode(romImage[0]) +
        String.fromCharCode(romImage[1]) +
        String.fromCharCode(romImage[2]) +
        String.fromCharCode(romImage[3])
    );

    /** Boolean indicating whether the magic number is correct for an iNES ROM */
    this.magicNumberIsCorrect = (this.magicNumber == 'NES\x1a');

    /** The number of 16k PRG ROM pages in the ROM image */
    this.prgRomCount = romImage[4];
    /** The number of 8k CHR ROM pages in the ROM image */
    this.chrRomCount = romImage[5];
    /** The number of 8k PRG RAM pages for the ROM */
    this.prgRamCount = romImage[8];

    if (romImage[6] & headerFlags.fourScreen) {
        /** The screen mirroring used for rendering */
        this.mirroring = "4-screen"
    } else {
        var isVertical = (romImage[6] & headerFlags.verticalMirroring);
        this.mirroring = isVertical ? "vertical" : "horizontal";
    }

    /** Whether the cartridge contains persistent (save) memory */
    this.hasBattery = !!(romImage[6] & headerFlags.battery);
    /** Whether the cartridge contains a trainer (used for pirate games) */
    this.hasTrainer = !!(romImage[6] & headerFlags.trainer);
    /** Whether the ROM is intended for VS Unisystem */
    this.vsUnisystem = !!(romImage[7] & headerFlags.vsUnisystem);
    /** Whether the ROM is intended for PlayChoice 10 */
    this.playchoice10 = !!(romImage[7] & headerFlags.playchoice10);
    /** Whether the ROM Header uses the extended NES 2.0 format */
    this.nes2 = (romImage[7] & headerFlags.nes2) == 2;
    /** Whether the PAL flag is set. */
    this.palFlagSet = romImage[9] & headerFlags.pal;

    /** Mapper number to identify cartridge hardware */
    this.mapper =
        ((romImage[6] & headerFlags.mapper) >> 4) |
        (romImage[7] & headerFlags.mapper);
    /** Mapper name (board, MMC, or other hardware configuration) */
    this.mapperName = mappers[this.mapper] || 'unknown';
}

export default iNESHeader;