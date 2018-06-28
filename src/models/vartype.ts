import {Unit} from "./unit";

export interface VarTypeDictionary {
    [ slug: string ]: VarType;
}

export class VarType {
  public name: string;
  public slug: string;
  public rawData: any;
  public availableInputUnits: Array<Unit> = [];
  public availableOutputUnits: Array<Unit> = [];

  constructor(data: any = {}) {
    this.name = data.name;
    this.slug = data.slug;
    this.rawData = data;

    if ("available_input_units" in data) {
      let that = this;
      data["available_input_units"].forEach(function (u: any) {
        let unit: Unit = new Unit(u);
        that.availableInputUnits.push(unit);
      });
    }

    if ("available_output_units" in data) {
      let that = this;
      data["available_output_units"].forEach(function (u: any){
        let unit: Unit = new Unit(u);
        that.availableOutputUnits.push(unit);
      });
    }
  }

  public toJson(): any {
    return this.rawData;
  }

  public getInputUnitForSlug(slug: string): Unit | undefined {
    let resultingUnit;

    this.availableInputUnits.forEach(u => {
      if (u.slug === slug) {
        resultingUnit = u;
      }
    });

    return resultingUnit;
  }

  public getOutputUnitForSlug(slug: string): Unit | undefined {
    let resultingUnit;

    this.availableOutputUnits.forEach(u => {
      if (u.slug === slug) {
        resultingUnit = u;
      }
    });

    return resultingUnit;
  }
}
