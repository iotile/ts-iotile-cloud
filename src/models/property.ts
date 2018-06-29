export interface PropertyDictionary {
    [index: string]: Property;
}

export class Property {
    public name: string;
    public value: string;
    public type: string;
    public isSystem: boolean;
    public target: string;
    public rawData: any;

    constructor(data: any = {}) {
    this.type = data.type;
    this.name = data.name;
    this.value = data.value;
    this.isSystem = data.is_system;
    this.target = data.target;
    this.rawData = data;
    }

    public toJson(): any {
        return this.rawData;
    }
}