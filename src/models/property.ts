export interface PropertyDictionary {
    [index: string]: Property;
}
  
export class Property {
  public id?: number;
  public name: string;
  public value: string;
  public type: string;
  public isSystem: boolean;
  public target?: string;
  public rawData: any;

  constructor(data: any) {
    this.name = data.name;
    this.value = data.value;
    this.type = data.type;
    this.isSystem = data.is_system;
    this.rawData = data;

    if ('id' in data) {
      this.id = data.id;
    } else {
      delete this.id;
    }

    if ('target' in data){
      this.target = data.target;
    }
  }

  public toJson(): any {
      return this.rawData;
  }

  public getPostPayload() {
    let payload: any = {};
    let type = this.type.toLowerCase() + '_value';

    if ('id' in this) {
      payload['id'] = this.id;
    }

    payload['name'] = this.name;
    payload[type] = this.value;

    return payload;
  }
}