import {Unit} from "./unit";

export interface VarTypeDictionary {
    [ slug: string ]: VarType;
}

export interface SchemaKey {
  type: string;
  units: string;
  decimal: number;
  label: string;
  output_units: any;
}

export interface SchemaKeyDictionary {
  [index: string]: SchemaKey;
}

export class VarType {
  [key: string]: any;
  
  public name: string;
  public slug: string;
  public rawData: any;
  public unitFullName: string;
  public availableInputUnits: Array<Unit> = [];
  public availableOutputUnits: Array<Unit> = [];
  public schema?: SchemaKeyDictionary;

  constructor(data: any = {}) {
    this.name = data.name;
    this.slug = data.slug;
    this.unitFullName = data.storage_units_full;
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

    if ('schema' in data) {
      let schema = data['schema'];
      if (schema && 'keys' in schema) {
        this.schema = schema.keys;
      }
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

  public getASchemaObj(schemaKey: string): SchemaKey | null {
    return this.schema && schemaKey in this.schema ? this.schema[schemaKey] : null;
  }

  public getOutputUnitsForSchema(schemaKey: string): any {
    let schemaObj = this.getASchemaObj(schemaKey);

    if (schemaObj && 'output_units' in schemaObj) {
      return schemaObj['output_units'];
    }
  }
}
