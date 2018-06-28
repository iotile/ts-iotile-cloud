import {MdoDictionary, SerializedMDO, Mdo} from "./mdo";

export interface DeviceUnitTypeDictionary {
  [ index: string ]: MdoDictionary;
}

export interface SerializedUnitTypeDictionary {
  [index: string]: {[index: string]: SerializedMDO};
}

export interface SerializedUnit {
  slug: string;
  unit_full: string;
  unit_short: string;
  m: number;
  d: number;
  o: number;
  decimal_places?: number;
  derived_units?: SerializedUnitTypeDictionary;
}

export class Unit {
  public mdo: Mdo;
  public fullName: string;
  public shortName: string;
  public slug: string;
  public decimalPlaces?: number;
  public derivedUnits?: DeviceUnitTypeDictionary;

  constructor(data: any = {}) {
    this.mdo = new Mdo(data);
    this.fullName = data.unit_full;
    this.shortName = data.unit_short;
    this.slug = data.slug;
    if ('decimal_places' in data) {
      this.decimalPlaces = data.decimal_places;
    }

    if ('derived_units' in data) {
      this.derivedUnits = {};
      for (let key in data['derived_units']) {
        this.derivedUnits[key] = {};

        for (let name in data['derived_units'][key]) {
          this.derivedUnits[key][name] = new Mdo(data['derived_units'][key][name]);
        }
      }
    }
  }

  private initFromJSON(data: any) {
    this.mdo = new Mdo(data);
    this.fullName = data.unit_full;
    this.shortName = data.unit_short;
    this.slug = data.slug;
    if ('decimal_places' in data) {
      this.decimalPlaces = data.decimal_places;
    }

    if ('derived_units' in data) {
      this.derivedUnits = {};
      for (let key in data['derived_units']) {
        this.derivedUnits[key] = {};

        for (let name in data['derived_units'][key]) {
          this.derivedUnits[key][name] = new Mdo(data['derived_units'][key][name]);
        }
      }
    }
  }

  public toJson() : SerializedUnit {
    let obj: SerializedUnit = {
      slug: this.slug,
      unit_full: this.fullName,
      unit_short: this.shortName,
      m: this.mdo.m,
      d: this.mdo.d,
      o: this.mdo.o,
    }

    if (this.decimalPlaces !== undefined) {
      obj.decimal_places = this.decimalPlaces;
    }

    if (this.derivedUnits !== undefined) {
      obj.derived_units = {}

      for (let key in this.derivedUnits) {
        obj.derived_units[key] = {};

        for (let name in this.derivedUnits[key]) {
          obj.derived_units[key][name] = this.derivedUnits[key][name].toJson(false);
        }
      }
    }

    return obj;
  }

  public setFromUnit(src: Unit) {
    this.initFromJSON(src.toJson());
  }

  public deriveUnitTypes(): string[] {
    var keySet: string[] = [];

    if (this.derivedUnits){
      for (var prop in this.derivedUnits) {
        if (this.derivedUnits.hasOwnProperty(prop)) {
          keySet.push(prop);
        }
      }
    }

    return keySet;
  }

  public deriveUnitsByType(type: string): string[] {
    var keySet: string[] = [];

    if (this.derivedUnits){
      for (var prop in this.derivedUnits[type]) {
        if (this.derivedUnits[type].hasOwnProperty(prop)) {
          keySet.push(prop);
        }
      }
    }

    return keySet;
  }
}

