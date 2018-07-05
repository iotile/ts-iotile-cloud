import {SerializedUnit, Unit} from "./unit";
import {DataPoint} from "./datapoint";
import {Mdo} from "./mdo";
import {Stats} from "./stats";
import {ModelDelta, DeltaStatus} from "../base/model-delta";
import {ArgumentError} from "iotile-common";

export interface StreamDictionary {
  [index: string]: Stream;
}

export interface SerializedStream {
    id: string,
    project_id: string,
    project: string,
    slug: string
    device: string,
    variable: string,
    raw_value_format: string,
    data_label: string,
    input_unit: SerializedUnit,
    output_unit: SerializedUnit,
    mdo_type: string,
    mdo_label: string,

    multiplication_factor: number,
    division_factor: number,
    offset: number,

    type: string,
    created_on: string,
    enabled: boolean
  }

  export class Stream {
    [key: string]: any;
    
    public id: string;
    public slug: string;
    public variable: string;
    public device: string;
    public project: string;
    public enabled: boolean = true;
    public createdOn: string;
    public type: string;
    public projectId: string;
    public data: Array<DataPoint>;
    public mdo: Mdo;
    public inputUnit: Unit | null = null;
    public outputUnit: Unit | null = null;

    public template?: string;
    public org?: string;
    public block?: string;
    public variableName?: string;
    public variableType?: string;
    public variableLocalId?: number;

    public mdoType?: string;
    public dataLabel?: string;
    public stats?: Stats;

    public isModified?: boolean;

    public rawValueFormat?: string;
    private _rawData: any;

    constructor(data: any = {}) {
      this.slug = data.slug;
      this.id = data.id;
      this.variable = data.variable;
      this.device = data.device;
      this.project = data.project;
      this.mdoType = data.mdo_type || null;
      this.mdo = new Mdo(data);
      this.stats = new Stats();
      this.rawValueFormat = data.raw_value_format || '<L';
      this._rawData = data;
      this.projectId = data.project_id;

      this.createdOn = data.created_on;
      this.type = data.data_type;
      this.enabled = data.enabled || true;

      //We always clear isModified since it will be set by the ProjectOverlay on an already built object
      this.isModified = false;
      
      this.data = [];

      this.dataLabel = data.data_label;
      if (data.block) {
        this.block = data.block;
      }
      if (data.var_name) {
        this.variableName = data.var_name;
      }
      if (data.var_type) {
        this.variableType = data.var_type;
      }
      this.variableLocalId = data.var_lid;

      if (data.input_unit) {
        this.inputUnit = new Unit(data.input_unit);
      }
      if (data.output_unit) {
        this.outputUnit = new Unit(data.output_unit);
      }
    }

    public loadData(data: any) {
      this.slug = data.slug;
      this.id = data.id;
      this.variable = data.variable;
      this.device = data.device;
      this.project = data.project;
      this.mdoType = data.mdo_type || null;
      this.mdo = new Mdo(data);
      this.stats = new Stats();
      this.rawValueFormat = data.raw_value_format || '<L';
      this._rawData = data;
      this.projectId = data.project_id;

      this.createdOn = data.created_on;
      this.type = data.data_type;
      this.enabled = data.enabled || true;

      //We always clear isModified since it will be set by the ProjectOverlay on an already built object
      this.isModified = false;
      
      this.data = [];

      this.dataLabel = data.data_label;
      if (data.block) {
        this.block = data.block;
      }
      if (data.var_name) {
        this.variableName = data.var_name;
      }
      if (data.var_type) {
        this.variableType = data.var_type;
      }
      this.variableLocalId = data.var_lid;

      if (data.input_unit) {
        this.inputUnit = new Unit(data.input_unit);
      }
      if (data.output_unit) {
        this.outputUnit = new Unit(data.output_unit);
      }
    }

    public toJson() : SerializedStream {
      let obj: {[key: string]: any} = {
        id: this.id,
        project_id: this.projectId,
        project: this.project,
        device: this.device,
        variable: this.variable,
        data_label: this.dataLabel,
        raw_value_format: this.rawValueFormat,
        mdo_type: this.mdoType,
        slug: this.slug,
        type: this.type,
        created_on: this.createdOn,
        enabled: this.enabled,
        input_unit: null,
        output_unit: null
      }

      if (this.inputUnit) {
        obj['input_unit'] = this.inputUnit.toJson();
      }

      if (this.outputUnit) {
        obj['output_unit'] = this.outputUnit.toJson();
      }

      this.mdo.addToObject(obj, true);
      return <SerializedStream>obj;
    }

    public addStats(stats: Stats): void {
      this.stats = stats;
    }

    public addData(data: Array<DataPoint>): void {
      this.data = data;
    }

    public getLocalVarId(): string {
      if (this.variable) {
        let elements: Array<string> = this.variable.split("--");
        if (elements.length === 3) {
            return elements[2];
        }
      }
      return "";
    }

    public resetData(): void {
      this.data = [];
    }
  
    public getPatchPayload(): any {
      let basic: any = {
        mdo_type: this.mdoType,
        enabled: this.enabled
      };
      let payload: any = Object.assign(basic, this.mdo.getPatchPayload());
      if (this.inputUnit) {
        payload['input_unit'] = this.inputUnit.slug;
      }
      if (this.outputUnit) {
        payload['output_unit'] = this.outputUnit.slug;
      }
      if (this.dataLabel) {
        payload['data_label'] = this.dataLabel;
      }
      return payload;
    }
  }

  export abstract class StreamDelta extends ModelDelta<Stream> {
  }

  export class StreamLabelDelta extends StreamDelta {
    private oldLabel: string;
    private newLabel: string;

    public static ClassName: string = "StreamLabelDelta";

    constructor(oldLabel: string, newLabel: string, slug: string, guid?: string) {
      super(StreamLabelDelta.ClassName, slug, guid);

      this.oldLabel = oldLabel;
      this.newLabel = newLabel;
    }

    public check(stream: Stream): DeltaStatus {
      if (stream.dataLabel == this.newLabel) {
        return DeltaStatus.Outdated;
      } else if (stream.dataLabel !== this.oldLabel) {
        return DeltaStatus.Conflicted;
      }

      return DeltaStatus.Applies;
    }

    public apply(stream: Stream) {
      stream.dataLabel = this.newLabel;
    }

    public getPatch(): {} {
      return {
        data_label: this.newLabel
      }
    }

    protected serializeArguments(): {} {
      return {
        oldLabel: this.oldLabel,
        newLabel: this.newLabel
      }
    }

    public static Deserialize(guid: string, slug: string, serializedArgs: any) : StreamLabelDelta {
      return new StreamLabelDelta(serializedArgs.oldLabel, serializedArgs.newLabel, slug, guid);
    }
  }

  export class StreamMDODelta extends StreamDelta {
    private oldMDO: Mdo;
    private oldType: string;

    private newMDO: Mdo;
    private newType: string;

    public static ClassName: string = "StreamMDODelta";

    constructor(oldMDO: Mdo, oldType: string, newMDO: Mdo, newType: string, slug: string, guid?: string) {
      super(StreamMDODelta.ClassName, slug, guid);

      this.oldMDO = oldMDO;
      this.oldType = oldType;
      this.newMDO = newMDO;
      this.newType = newType;
    }

    public check(stream: Stream): DeltaStatus {
      if (stream.mdo.equal(this.newMDO) && stream.mdoType == this.newType) {
        return DeltaStatus.Outdated;
      } else if (!stream.mdo.equal(this.oldMDO) || stream.mdoType !== this.oldType) {
        return DeltaStatus.Conflicted;
      } 

      return DeltaStatus.Applies;
    }

    public apply(stream: Stream) {
      stream.mdo.setFromMdo(this.newMDO);
      stream.mdoType = this.newType;
    }

    public getPatch(): {} {
      return {
        mdo_type: this.newType,
        mdo_label: this.newMDO.label,
        multiplication_factor: this.newMDO.m,
        division_factor: this.newMDO.d,
        offset: this.newMDO.o
      }
    }

    protected serializeArguments(): {} {
      return {
        oldMDO: this.oldMDO.toJson(false),
        oldType: this.oldType,
        newMDO: this.newMDO.toJson(false),
        newType: this.newType
      }
    }

    public static Deserialize(guid: string, slug: string, serializedArgs: any) : StreamMDODelta {
      let oldMDO = new Mdo(serializedArgs.oldMDO);
      let oldType = serializedArgs.oldType;
      let newMDO = new Mdo(serializedArgs.newMDO);
      let newType = serializedArgs.newType;

      return new StreamMDODelta(oldMDO, oldType, newMDO, newType, slug, guid);
    }
  }

  export enum UnitType {
    Input = 0,
    Output = 1
  }

  /*
   * A delta representing a change in units for a stream.  
   * This class has a slight complication in that the old units for a stream
   * may be null if they were never initialized.
   */
  export class StreamUnitsDelta extends StreamDelta {
    private oldUnit: Unit | null;
    private newUnit: Unit;
    private type: UnitType;

    constructor(oldUnits: Unit | null, newUnits: Unit, type: UnitType, slug: string, classname: string, guid?: string) {
      super(classname, slug, guid);

      this.oldUnit = oldUnits;
      this.newUnit = newUnits;
      this.type = type;

      if (this.newUnit == null) {
        throw new ArgumentError("You must always set a valid new unit in StreamUnitsDelta");
      }
    }

    private getSlug(unit: Unit | null) {
      if (unit == null) {
        return null;
      }

      return unit.slug;
    }

    public check(stream: Stream): DeltaStatus {
      let unitSlug = this.getSlug(stream.inputUnit);
      
      if (this.type == UnitType.Output) {
        unitSlug = this.getSlug(stream.outputUnit);
      }

      let oldSlug = this.getSlug(this.oldUnit);
      let newSlug = this.getSlug(this.newUnit);

      if (unitSlug === newSlug) {
        return DeltaStatus.Outdated;
      } else if (unitSlug === oldSlug) {
        return DeltaStatus.Applies;
      }else {
        return DeltaStatus.Conflicted;
      }
    }


    /*
     * If the old units are null we need to create them from scratch
     * otherwise we can just update them with our new data.
     */
    public apply(stream: Stream) {
      if (this.type == UnitType.Input && stream.inputUnit == null) {
        stream.inputUnit = new Unit(this.newUnit.toJson());
      } else if (this.type == UnitType.Output && stream.outputUnit == null) {
        stream.outputUnit = new Unit(this.newUnit.toJson());
      } else {
        let unit = stream.outputUnit;
        if (this.type == UnitType.Input) {
          unit = stream.inputUnit;
        }
        if (unit){
          unit.setFromUnit(this.newUnit);
        }
      }
    }

    public getPatch(): {} {
      let paramName = 'output_unit';
      if (this.type == UnitType.Input) {
        paramName = 'input_unit';
      }

      let patch: {[key: string]: any} = {};
      patch[paramName] = this.newUnit.slug;
      return patch;
    }

    protected serializeArguments(): {} {
      return {
        oldUnit: this.oldUnit? this.oldUnit.toJson(): null,
        newUnit: this.newUnit.toJson(),
        type: this.type
      }
    }
  }
  
  export class StreamInputUnitsDelta extends StreamUnitsDelta {
    public static ClassName: string = "StreamInputUnitsDelta";

    constructor(oldUnits: Unit|null, newUnits: Unit, slug: string, guid?: string) {
      super(oldUnits, newUnits, UnitType.Input, slug, StreamInputUnitsDelta.ClassName, guid);
    }

    public static Deserialize(guid: string, slug: string, serializedArgs: any) : StreamInputUnitsDelta {
      let oldUnit = null;
      if (serializedArgs.oldUnit) {
        oldUnit = new Unit(serializedArgs.oldUnit);
      }

      let newUnit = new Unit(serializedArgs.newUnit);

      return new StreamInputUnitsDelta(oldUnit, newUnit, slug, guid);
    }
  }

  export class StreamOutputUnitsDelta extends StreamUnitsDelta {
    public static ClassName: string = "StreamOutputUnitsDelta";

    constructor(oldUnits: Unit|null, newUnits: Unit, slug: string, guid?: string) {
      super(oldUnits, newUnits, UnitType.Output, slug, StreamOutputUnitsDelta.ClassName, guid);
    }

    public static Deserialize(guid: string, slug: string, serializedArgs: any) : StreamOutputUnitsDelta {
      let oldUnit = null;
      if (serializedArgs.oldUnit) {
        oldUnit = new Unit(serializedArgs.oldUnit);
      }

      let newUnit = new Unit(serializedArgs.newUnit);

      return new StreamOutputUnitsDelta(oldUnit, newUnit, slug, guid);
    }
  }
