import {Unit} from "./unit";

export interface VarTypeDictionary {
    [ slug: string ]: VarType;
}

export class VarType {
  public name: string;
  public slug: string;
  public rawData: any;
  public availableInputUnits: Array<Unit>;
  public availableOutputUnits: Array<Unit>;

  constructor(data: any = {}) {
    this.name = data.name;
    this.slug = data.slug;
    this.rawData = data;

    if ("available_input_units" in data) {
      data["available_input_units"].forEach(u => {
        if (!this.availableInputUnits) {
          this.availableInputUnits = [];
        }
        let unit: Unit = new Unit(u);
        this.availableInputUnits.push(unit);
      });
    }

    if ("available_output_units" in data) {
      data["available_output_units"].forEach(u => {
        if (!this.availableOutputUnits) {
          this.availableOutputUnits = [];
        }
        let unit: Unit = new Unit(u);
        this.availableOutputUnits.push(unit);
      });
    }
  }

  public toJson(): any {
    return this.rawData;
  }

  public getInputUnitForSlug(slug): Unit {
    let resultingUnit: Unit;

    this.availableInputUnits.forEach(u => {
      if (u.slug === slug) {
        resultingUnit = u;
      }
    });

    return resultingUnit;
  }

  public getOutputUnitForSlug(slug): Unit {
    let resultingUnit: Unit;

    this.availableOutputUnits.forEach(u => {
      if (u.slug === slug) {
        resultingUnit = u;
      }
    });

    return resultingUnit;
  }
}
