import {ModelDelta, DeltaStatus} from "../base/model-delta";

export class Device {
  public id: number;
  public slug: string;
  public gid: string;
  public label: string;
  public lat: string;
  public lng: string;
  public template: string;
  public rawData: any;
  public project: string;
  public sg: string;

  public isModified: boolean;
  public active: boolean;

  // drifterMode is for disabling permanent data reports
  public drifterMode: boolean;

  constructor(data: any = {}) {
    this.id = data.id;
    this.slug = data.slug;
    this.gid = data.gid;
    this.label = data.label || data.slug;
    this.lat = data.lat || null;
    this.lng = data.lon || null;
    this.template = data.template || "";
    this.sg = data.sg;
    this.rawData = data;
    this.project = data.project;
    this.drifterMode = data.drifter_mode || false;
    this.isModified = false;
    this.active = data.active || true;
  }

  public toJson(): any {
    let result: any = this.rawData;

    result.label = this.label;
    result.drifter_mode = this.drifterMode;
    result.lat = this.lat;
    result.lon = this.lng;

    return result
  }
}

export abstract class DeviceDelta extends ModelDelta<Device> {

}

export class DeviceLocationDelta extends DeviceDelta {
  private oldLat: string;
  private oldLng: string;
  private newLat: string;
  private newLng: string;

  public static ClassName: string = "DeviceLocationDelta";

  constructor(oldLat: string, oldLng: string, newLat: string, newLng: string, slug: string, guid?: string) {
    super(DeviceLocationDelta.ClassName, slug, guid);

    this.oldLat = oldLat;
    this.oldLng = oldLng;
    this.newLat = newLat;
    this.newLng = newLng;
  }

  public check(device: Device) : DeltaStatus {
    if (device.lat === this.newLat && device.lng === this.newLng) {
      return DeltaStatus.Outdated;
    } else if (device.lat === this.oldLat && device.lng === this.oldLng) {
      return DeltaStatus.Applies;
    } else {
      return DeltaStatus.Conflicted;
    }
  }

  public apply(device: Device) {
    device.lat = this.newLat;
    device.lng = this.newLng;
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
