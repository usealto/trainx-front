export enum EColors {
  primary = 'primary',
  success = 'success',
  default = 'default',
}

export interface ISelectOption {
  label: string; // The label to display in the select
  value: string; // The ID of the option (could be same as label)
}

export class SelectOption implements ISelectOption {
  label: string;
  value: string;

  constructor(data: ISelectOption) {
    this.label = data.label;
    this.value = data.value;
  }

  get rawData(): ISelectOption {
    return { label: this.label, value: this.value };
  }
}

export interface IPillOption extends ISelectOption {
  color?: EColors;
}

export class PillOption extends SelectOption implements IPillOption {
  color: EColors;

  constructor(data: IPillOption) {
    super(data);
    this.color = data.color ?? EColors.default;
  }

  override get rawData(): IPillOption {
    return { label: this.label, value: this.value, color: this.color };
  }
}
