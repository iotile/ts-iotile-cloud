import {ModelDelta, DeltaStatus} from "../base/model-delta";
import {SensorGraph} from "./sensorgraph";
import {Property, PropertyDictionary} from "./property";
import {DataBlock} from "./datablock";

export interface DeviceDictionary {
  [ index: string ]: Device;
}

export class Device {
  [key: string]: any;

  public id: number;
  public slug: string;
  public gid: string;
  public label: string;
  public template: string;
  public rawData: any;
  public project: string;
  public propertyMap: PropertyDictionary;
  public properties: Array<Property>;
  public sensorGraphSlug: string;

  public isModified: boolean;
  public active: boolean;

  // drifterMode is for disabling permanent data reports
  public drifterMode: boolean;

  public org?: string;
  public externalId?: string;
  public state?: string;
  public lat?: number;
  public lon?: number;
  public busy: boolean = false;
  public sg?: SensorGraph;
  
  public dataBlock?: DataBlock;

  constructor(data: any = {}) {
    this.id = data.id;
    this.slug = data.slug;
    this.gid = data.gid;
    this.label = data.label || data.slug;
    this.template = data.template || "";
    this.rawData = data;
    this.project = data.project;
    this.drifterMode = data.drifter_mode || false;
    this.isModified = false;
    this.active = data.active || true;
    this.state = data.state || undefined;
    this.externalId = data.external_id || undefined;
    this.sensorGraphSlug = data.sg;

    this.properties = [];
    this.propertyMap = {};

    if ('busy' in data) {
      this.busy = data.busy;
    }

    if ('org' in data){
      this.org = data.org;
    }

    if ('lat' in data && data.lat !== null){
      this.lat = parseFloat(data.lat);
    }

    if ('lon' in data && data.lon !== null){
      this.lon = parseFloat(data.lon);
    }
  }

  public toJson(): any {
    let result: any = this.rawData;

    result.label = this.label;
    result.drifter_mode = this.drifterMode;
    result.lat = this.lat;
    result.lon = this.lon;

    return result
  }

  public getPatchPayload(): any {
    let payload: any = {
      label: this.label
    };
    if (this.lat) {
      payload.lat = this.lat;
    }
    if (this.lon) {
      payload.lon = this.lon;
    }
    payload.active = this.active;

    if (this.state) {
      payload.state = this.state;
    }

    return payload;
  }

  public addProperties(properties: Array<Property>): void {
    this.properties = properties;
    this.properties.forEach(property => {
      this.propertyMap[property.name] = property;
    });
  }

  public getProperty(name: string): Property {
    return this.propertyMap[name];
  }

  public isDataBlock(): boolean {
    return (this.dataBlock != null);
  }

  public getStateDisplay(): string {
    if (this.state){
      let factory: any = {
        'N0': 'Available',
        'N1': 'Active',
        'B0': 'Resetting',
        'B1': 'Archiving'
      };
      return factory[this.state];
    } else {
      return "";
    }
  }
}

export abstract class DeviceDelta extends ModelDelta<Device> {

}

export class DeviceLocationDelta extends DeviceDelta {
  private oldLat: number;
  private oldLng: number;
  private newLat: number;
  private newLng: number;

  public static ClassName: string = "DeviceLocationDelta";

  constructor(oldLat: number, oldLng: number, newLat: number, newLng: number, slug: string, guid?: string) {
    super(DeviceLocationDelta.ClassName, slug, guid);

    this.oldLat = oldLat;
    this.oldLng = oldLng;
    this.newLat = newLat;
    this.newLng = newLng;
  }

  public check(device: Device) : DeltaStatus {
    if (device.lat === this.newLat && device.lon === this.newLng) {
      return DeltaStatus.Outdated;
    } else if (
      (device.lat === this.oldLat && device.lon === this.oldLng) ||
      (isNaN(device.lat as number) &&
        isNaN(this.oldLat) &&
        isNaN(device.lon as number) &&
        isNaN(this.oldLng))
    ) {
      return DeltaStatus.Applies;
    } else {
      return DeltaStatus.Conflicted;
    }
  }

  public apply(device: Device) {
    device.lat = this.newLat;
    device.lon = this.newLng;
  }

  public getPatch() {
    return {
      lat: this.newLat,
      lon: this.newLng
    }
  }

  public serializeArguments(): {} {
    return {
      oldLat: this.oldLat,
      oldLng: this.oldLng,
      newLat: this.newLat,
      newLng: this.newLng
    }
  }

  public static Deserialize(guid: string, slug: string, serializedArgs: any) : DeviceLocationDelta {
    return new DeviceLocationDelta(serializedArgs.oldLat, serializedArgs.oldLng, serializedArgs.newLat, serializedArgs.newLng, slug, guid);
  }
}

export class DeviceDrifterDelta extends DeviceDelta {
  private oldDrifter: boolean;
  private newDrifter: boolean;

  public static ClassName: string = "DeviceDrifterDelta";

  constructor(oldDrifter: boolean, newDrifter: boolean, slug: string, guid?: string) {
    super(DeviceDrifterDelta.ClassName, slug, guid);

    this.oldDrifter = oldDrifter;
    this.newDrifter = newDrifter;
  }

  public check(device: Device): DeltaStatus {
    if (device.drifterMode === this.newDrifter) {
      return DeltaStatus.Outdated;
    } else {
      return DeltaStatus.Applies;
    }
  }

  public apply(device: Device) {
    device.drifterMode = this.newDrifter;
  }

  public getPatch() {
    return {};
  }

  public serializeArguments(): {} {
    return {
      oldDrifter: this.oldDrifter,
      newDrifter: this.newDrifter
    }
  }

  public static Deserialize(guid: string, slug: string, serializedArgs: any) : DeviceDrifterDelta {
    return new DeviceDrifterDelta(serializedArgs.oldDrifter, serializedArgs.newDrifter, slug, guid);
  }
}

export class DeviceLabelDelta extends DeviceDelta {
  private oldLabel: string;
  private newLabel: string;

  public static ClassName: string = "DeviceLabelDelta";

  constructor(oldLabel: string, newLabel: string, slug: string, guid?: string) {
    super(DeviceLabelDelta.ClassName, slug, guid);

    this.oldLabel = oldLabel;
    this.newLabel = newLabel;
  }

  public check(device: Device) : DeltaStatus {
    if (device.label == this.newLabel) {
      return DeltaStatus.Outdated;
    } else if (device.label !== this.oldLabel) {
      return DeltaStatus.Conflicted;
    } 
    
    return DeltaStatus.Applies;
  }

  public apply(device: Device) {
    device.label = this.newLabel;
  }

  public getPatch(): {} {
    return {
      label: this.newLabel
    }
  }

  public serializeArguments(): {} {
    return {
      oldLabel: this.oldLabel,
      newLabel: this.newLabel
    }
  }

  public static Deserialize(guid: string, slug: string, serializedArgs: any) : DeviceLabelDelta {
    return new DeviceLabelDelta(serializedArgs.oldLabel, serializedArgs.newLabel, slug, guid);
  }
}
