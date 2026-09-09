export type ConfigSettings = Record<string, string | number | boolean>;

export interface SelectOption {
  value: string;
  labelKey: string;
}

export interface FieldDef {
  key: string;
  type: "text" | "number" | "boolean" | "select";
  options?: SelectOption[];
}

export interface FieldGroup {
  labelKey: string;
  fields: FieldDef[];
}
