export class PropertyTemplate {
    public type: string;
    public org: string;
    public name: string;
    public default: string;
    public enums: string[];
    public extra: any;
    public rawData: any;

    constructor(data: any = {}) {
    this.type = data.type;
    this.org = data.org;
    this.name = data.name;
    this.default = data.default;
    this.enums = data.enums;
    this.extra = data.extra;
    this.rawData = data;
    }

    public toJson(): any {
        return this.rawData;
    }
}