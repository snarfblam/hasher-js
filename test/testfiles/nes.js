var nes = [
    ["raw", [0x4e, 0x45, 0x53, 0x1A]], // "INES"
    ["raw", [0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]], // Most basic possible INES header
    ["repeat", 0x4000, 0xFF], // PRG
    ["repeat", 0x2000, 0xFF], // CHR
];

export default nes;