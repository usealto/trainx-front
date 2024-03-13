// TODO : improve system when removing team pipe color
export type TPillColor =
  | { color: '#344054'; bg: '#f2f4f7' } // grey
  | { color: '#175cd3'; bg: '#eff8ff' } // primary blue
  | { color: '#b32318'; bg: '#fef3f2' } // red
  | { color: '#b54708'; bg: '#fffaeb' } // warning orange
  | { color: '#027948'; bg: '#ecfdf3' } // green
  | { color: '#363f72'; bg: '#f8f9fc' } // blue grey
  | { color: '#026aa2'; bg: '#f0f9ff' } // light blue
  | { color: '#175cd3'; bg: '#eff8ff' } // blue
  | { color: '#3538cd'; bg: '#eef4ff' } // indigo
  | { color: '#5925dc'; bg: '#f4f3ff' } // purple
  | { color: '#c01574'; bg: '#fdf2fa' } // pink
  | { color: '#c01048'; bg: '#fff1f3' } // rose
  | { color: '#c4320a'; bg: '#fff6ed' } // orange
  | { color: '#344054'; bg: '#f2f4f7' }; // grey again (from legacy code)

// Same as team color pipe
const colorCodes: TPillColor[] = [
  { color: '#344054', bg: '#f2f4f7' },
  { color: '#175cd3', bg: '#eff8ff' },
  { color: '#b32318', bg: '#fef3f2' },
  { color: '#b54708', bg: '#fffaeb' },
  { color: '#027948', bg: '#ecfdf3' },
  { color: '#363f72', bg: '#f8f9fc' },
  { color: '#026aa2', bg: '#f0f9ff' },
  { color: '#175cd3', bg: '#eff8ff' },
  { color: '#3538cd', bg: '#eef4ff' },
  { color: '#5925dc', bg: '#f4f3ff' },
  { color: '#c01574', bg: '#fdf2fa' },
  { color: '#c01048', bg: '#fff1f3' },
  { color: '#c4320a', bg: '#fff6ed' },
  { color: '#344054', bg: '#f2f4f7' },
];

export interface ISelectOption {
  label: string; // The label to display in the select
  value: string; // The ID of the option (could be same as label)
  icon?: string; // The icon to display in the option
}

export class SelectOption implements ISelectOption {
  label: string;
  value: string;
  icon?: string;

  constructor(data: ISelectOption) {
    this.label = data.label;
    this.value = data.value;
    this.icon = data.icon;
  }

  get rawData(): ISelectOption {
    return { label: this.label, value: this.value, icon: this.icon };
  }
}

export interface IPillOption extends ISelectOption {
  pillColor?: TPillColor;
}

export class PillOption extends SelectOption implements IPillOption {
  pillColor: TPillColor;

  constructor(data: IPillOption) {
    super(data);
    this.pillColor = data.pillColor ?? colorCodes[1];
  }

  override get rawData(): IPillOption {
    return { label: this.label, value: this.value, icon: this.icon, pillColor: this.pillColor };
  }

  // Same as team color pipe
  static getPillColorFromId(id?: string): TPillColor {
    if (!id) {
      return colorCodes[1];
    }
    if (id.length < 8) {
      // console.error('String length must be at least 8');
      return colorCodes[0];
    }
    let output = 0;
    for (let index = 0; index < id.length; index++) {
      output += id[index].charCodeAt(0);
    }
    return colorCodes[output % colorCodes.length];
  }

  static getPrimaryPillColor(): TPillColor {
    return { color: '#175cd3', bg: '#eff8ff' };
  }

  static getSuccessPillColor(): TPillColor {
    return { color: '#027948', bg: '#ecfdf3' };
  }
}
