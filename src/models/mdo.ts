export interface MdoDictionary {
  [ index: string ]: Mdo;
}

const MAX_INT32: number = 2147483647;

export interface SerializedMDOShort {
  m: number;
  d: number;
  o?: number;
}

export interface SerializedMDOLong {
  multiplication_factor: number;
  division_factor: number;
  offset?: number,
  mdo_label?: string
}

export type SerializedMDO = SerializedMDOShort | SerializedMDOLong;

export class Mdo {
  public m: number;
  public d: number;
  public o: number;
  public label?: string;

  constructor(data: any = {}) {
    this.m = data.multiplication_factor || data.m || 1;
    this.d = data.division_factor || data.d || 1;
    this.o = data.offset || data.o || 0;
    if (data.mdo_label) {
        this.label = data.mdo_label;
    }
  }

  public equal(other: Mdo) {
    if (this.m !== other.m || this.d !== other.d || this.o !== other.o || this.label !== other.label) {
      return false;
    }

    return true;
  }

  public addToObject(obj: {[key: string]: any}, longNames: boolean) {
    if (longNames) {
      obj['offset'] = this.o;
      obj['multiplication_factor'] = this.m;
      obj['division_factor'] = this.d;
      obj['mdo_label'] = this.label;
    } else {
      obj['m'] = this.m;
      obj['d'] = this.d;
      obj['o'] = this.o;
    }
  }

  public toJson(longNames: boolean) : SerializedMDO {
    let obj = {};
    this.addToObject(obj, longNames);
    
    return <SerializedMDO>obj;
  }

  /*
  private _round(value, decimals) {
    // See http://www.jacklmoore.com/notes/rounding-in-javascript/
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }
  */

  private _retr_dec(num: number): number {
    // let numberFixedDecimal = num.toFixed(10);
    let numberString = num.toString();
    let decimalLength: number = (numberString.split(".")[1] || []).length;
    if (decimalLength > 8) {
      // Limit number of decimals to 8
      decimalLength = 8;
    }
    return decimalLength;
  }

  public computeValue(value: number): number {
      let result: number = value;
      if (this.m) {
          result = result * this.m;
      }
      if (this.d) {
          result = result / this.d;
      }
      if (this.o) {
          result += this.o;
      }
      return result;
  }

  public setFromMdo(src: Mdo): void {
      if (src.m) {
          this.m = src.m;
      }
      if (src.d) {
          this.d = src.d;
      }
      if (src.o) {
          this.o = src.o;
      }
      if (src.label) {
          this.label = src.label;
      }
  }

  public setFromFactor(factor: number, invert: boolean): void {
    let multiplication_factor: number = 1;
    let newFactor: number;
    if (factor < MAX_INT32) {
      // console.debug('factor is ' + factor);
      let decimals: number = this._retr_dec(factor);
      // console.debug('Decimals is ' + decimals);
      multiplication_factor = Math.pow(10, decimals);
      // console.debug('multiplication_factor is ' + multiplication_factor);
      newFactor = Math.round(factor * multiplication_factor);

      while (newFactor >= MAX_INT32) {
        // console.debug('factor is too large: ' + newFactor);
        newFactor = Math.round(newFactor / 10);
        multiplication_factor = Math.round(multiplication_factor / 10);
      }
    } else {
      newFactor = MAX_INT32;
    }

    this.o = 0.0;
    if (invert) {
      this.d = newFactor;
      this.m = multiplication_factor;
    } else {
      this.m = newFactor;
      this.d = multiplication_factor;
    }
  }

  public eq(): string {
    let eqStr: string = 'V * ' + this.m + '/' + this.d;
    if (this.o) {
      eqStr += ' + ' + this.o;
    }
    return eqStr
  }

  public getPatchPayload(): any {
    let payload: any = {
      multiplication_factor: this.m,
      division_factor: this.d,
      offset: this.o
    };
    if (this.label) {
      payload['mdo_label'] = this.label;
    }
    return payload;
  }
}
