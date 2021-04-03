import { romType } from "./romType"
import { expansionOption } from "./expansionOption"

//https://snesdev.mesen.ca/wiki/index.php?title=Internal_ROM_Header#ROM_Size
export const sizeIds = [
    { size: 0x010000, id: 0x07 }, //<= 1MBit (Guessed)
    { size: 0x020000, id: 0x08 }, //<= 2MBit (Guessed)
    { size: 0x040000, id: 0x09 }, //<= 4MBit
    { size: 0x080000, id: 0x0a }, //<= 8MBit
    { size: 0x100000, id: 0x0b }, //<= 16Mbit
    { size: 0x200000, id: 0x0c }, //<= 32MBit
    { size: 0x400000, id: 0x0d }  //<= 64MBit
];

// https://problemkaputt.de/fullsnes.htm#snescartridgeromheader
/*
  Bit7-6 Always 0
  Bit5   Always 1 (maybe meant to be MSB of bit4, for "2" and "3" MHz)
  Bit4   Speed (0=Slow, 1=Fast)              (Slow 200ns, Fast 120ns)
  Bit3-0 Map Mode

Map Mode can be:

  0=LoROM/32K Banks             Mode 20 (LoROM)
  1=HiROM/64K Banks             Mode 21 (HiROM)
  2=LoROM/32K Banks + S-DD1     Mode 22 (mappable) "Super MMC"
  3=LoROM/32K Banks + SA-1      Mode 23 (mappable) "Emulates Super MMC"
  5=HiROM/64K Banks             Mode 25 (ExHiROM)
  A=HiROM/64K Banks + SPC7110   Mode 25? (mappable)

*/
const mapMode = {
    LoROM: 0x00,
    HiROM: 0x01,
    LoROMSDD1: 0x02,
    LoROMSA1: 0x03,
    ExHiROM: 0x05,
    ExHiROMSPC7110: 0xa
};

export function expand(oldRomData, currentRomType, settings) {
    let error = "";
    let newRomData;
    if (settings.size > oldRomData.length) {
        // Resize the rom now
        newRomData = resize(oldRomData, settings.size, 0x00);

        // Adjust the SNES header 
        newRomData = correctSizeInHeader(newRomData, currentRomType);
        newRomData = correctMapTypeInHeader(newRomData, currentRomType, settings);

        /*
        There's two modes when expanding:
        1) Simply appending zeros
        2) Append zeros and mirror the old rom.

        Lunar address provides the latter as a last resort method when the first fails.
        */
        switch (settings.expansionOption) {
            case expansionOption.AppendZeros:
                if (settings.isExtended) {
                    switch (currentRomType) {
                        case romType.LoROM1:
                            // Move rom data to new space
                            newRomData = newRomData.copyWithin(0x400000, 0x000000, 0x400000);
                            // And blank out the old space
                            newRomData = newRomData.fill(0x00, 0x8000, 0x400000);
                            break;
                        case romType.LoROM2:
                            // Copy header to new region. That's it.
                            newRomData = newRomData.copyWithin(0x400000, 0x000000, 0x8000);
                            break;
                        case romType.ExLoROM:
                            break;
                        case romType.HiROM:
                            // Copy header to new region. That's it.
                            newRomData = newRomData.copyWithin(0x408000, 0x008000, 0x10000);
                            break;
                        case romType.ExHiROM:
                            break;
                        default:
                            throw new Error("Invalid rom type");
                    }
                }
                break;
            case expansionOption.Mirror:
                if (settings.isExtended) {
                    if (currentRomType === romType.HiROM || currentRomType === romType.ExHiROM) {
                        // Copying what Lunar Expand does. Not sure why it's like this.
                        let pc = 0x408000;
                        while (pc < newRomData.length) {
                            let FirstHalfLocation = pc - 0x400000;
                            newRomData = newRomData.copyWithin(pc, FirstHalfLocation, FirstHalfLocation + 0x8000);
                            pc += 0x10000;
                        }
                    } else if (currentRomType === romType.LoROM1 || currentRomType === romType.LoROM2 || currentRomType === romType.ExLoROM) {
                        newRomData = newRomData.copyWithin(0x400000, 0x000000, 0x400000);
                    } else {
                        throw new Error("Invalid rom type");
                    }
                } else {
                    throw new Error("Can't mirror when not extended.");
                }

                break;
            default:
                error = new Error("Invalid expansion option");
        }
    } else {
        error = "Selected size to expand to is smaller than the current rom size"
    }

    return { romData: newRomData, error: error };
}

// A simple array resize function
// https://stackoverflow.com/questions/32054170/how-to-resize-an-array
function resize(arr, newSize, defaultValue) {
    return new Int8Array([...arr, ...Array(Math.max(newSize - arr.length, 0)).fill(defaultValue)]);
}

// correctHeader changes the header's size value to reflect the size change.
function correctSizeInHeader(romData, currentRomType) {
    let writeLocation;
    switch (currentRomType) {
        case romType.LoROM1:
        case romType.LoROM2:
        case romType.ExLoROM:
            writeLocation = 0x7FD7;
            break;
        case romType.HiROM:
        case romType.ExHiROM:
            writeLocation = 0xFFD7;
            break;
        default:
            throw new Error("Invalid rom type");
    }

    let found = false;
    for (let i = sizeIds.length - 1; i >= 0; i--) {
        // The header size field operates on a range, so 
        // we check if it's within a certain range with "sizeIds".
        if (romData.length > sizeIds[i].size) {
            romData[writeLocation] = sizeIds[i].id;
            found = true;
            break;
        }
    }

    if (!found) {
        throw new Error("Invalid size");
    }

    return romData;
}

// correctMapType changes the header to indicate we expanded it.
// It's only really used to indicate we expanded from HiROM to ExHiROM.
function correctMapTypeInHeader(romData, currentRomType, settings) {
    let location;

    // The header location differs between HiROM and LoROM.
    switch (currentRomType) {
        case romType.LoROM1:
        case romType.LoROM2:
        case romType.ExLoROM:
            location = 0x7FD5;
            break;
        case romType.HiROM:
        case romType.ExHiROM:
            location = 0xFFD5;
            break;
        default:
            throw new Error("Invalid rom type");
    }

    // Copy over the bits that we won't be changing
    let newByte = romData[location] & 0xF0;

    // Get map type of the original rom
    let currentMapType = romData[location] & 0x0F;

    /*
    Change the header to reflect we expanded it. 
    Otherwise, keep the map type the same.
    */
    switch (currentMapType) {
        case mapMode.HiROM:
            if (settings.isExtended) {
                newByte |= mapMode.ExHiROM;
            } else {
                newByte |= mapMode.HiROM;
            }
            break;
        default:
            // Change nothing as I don't know how to check 
            // for special chips.
            newByte |= currentMapType;

    }

    romData[location] = newByte;

    return romData;
}