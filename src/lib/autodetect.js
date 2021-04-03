import { romType } from "./romType"

let Position = 0;
let romData = null

export function autodetect(romData_) {
    let identifiedRomType;
    let ptr = 0;

    romData = romData_;

    if (romData.length < 0x10000) {
        identifiedRomType = romType.Invalid;
        return { romType: identifiedRomType, error: "Rom too small" };
    }

    Position = 0x7FDC;

    // Essentially checks if a rom is headered.
    if (romData_.length % 0x010000 !== 0) {
        identifiedRomType = romType.Invalid;
        return { romType: identifiedRomType, error: "Rom is not a proper size." };
    }

    if ((ReadUInt16() ^ ReadUInt16()) === 0xFFFF) {
        Position = 0x7FD5;
        ptr = ReadByte();
    }
    else {
        Position = 0xFFDC;

        if ((ReadUInt16() ^ ReadUInt16()) !== 0xFFFF) {
            identifiedRomType = romType.Invalid;
            return { romType: identifiedRomType, error: "File is not a SNES rom" };
        }
        Position = 0xFFD5;
        ptr = ReadByte();
    }

    if ((ptr & 0xF) === 5) {
        identifiedRomType = romType.ExHiROM;
    }
    else if ((ptr & 0xF) === 3) {
        identifiedRomType = romType.HiROM;
    }
    else if ((ptr & 1) === 1) {
        if (romData.length <= 0x400000) {
            identifiedRomType = romType.HiROM;
        }
        else {
            identifiedRomType = romType.ExHiROM;
        }
    }
    else if (romData.length <= 0x400000) {
        identifiedRomType = (ptr >> 4) >= 3 ? romType.LoROM2 : romType.LoROM1;
    }
    else {
        identifiedRomType = romType.ExLoROM;
    }
    return { romType: identifiedRomType, error: "" };
}

function ReadUInt16() {
    const size = 2;

    if (Position + size > romData.length) {
        throw new Error("Location outside bounds of rom");
    }

    let subslice = new Uint8Array(romData.slice(Position, Position + size));
    let uint = (subslice[0] << 8) + subslice[1];
    Position += size;

    return uint;
}

function ReadByte() {
    const size = 1;

    if (Position + size > romData.length) {
        throw new Error("Location outside bounds of rom");
    }
    let retVal = new Uint8Array(romData.slice(Position, Position + size))[0];
    Position += size;

    return retVal;
}