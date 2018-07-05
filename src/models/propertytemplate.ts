export class PropertyTemplate {
    public id?: number;
    public name: string;
    public org?: string;
    public type: string;
    public default: string;
    public enums: Array<string> = [];
    public extra?: any;
    public rawData: any;
  
    constructor(data: any) {
      this.name = data.name;
      this.type = data.type;
      this.default = data.default;
      this.enums = data.enums;
      this.rawData = data;
  
      if ('id' in data) {
        this.id = data.id;
      }
      if ('org' in data) {
        this.org = data.org;
      }
      if ('extra' in data) {
        this.extra = data.extra;
      }
    }

    public toJson(): any {
        return this.rawData;
    }
  }