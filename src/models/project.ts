import {Variable, VariableDictionary} from "./variable";
import {Stream, StreamDictionary} from "./stream";
import {Device, DeviceDictionary} from "./device";
import {SensorGraph, SensorGraphDictionary} from "./sensorgraph";
import {Property, PropertyDictionary} from "./property";
import {ProjectOverlay} from "../cloud/project-overlay";
import {DataPoint} from "./datapoint";
import {Unit} from "./unit";
import {Org} from "./org";
import {Mdo} from "./mdo";
import {ArgumentError, DataCorruptedError, InvalidDataError} from "iotile-common";
import { ProjectTemplate, ProjectTemplateDictionary } from "./projecttemplate";

export class Project {
  [key: string]: any;
  
  public id: string;
  public gid: string;
  public name: string;
  public createdBy: string;
  public createdOn: Date;
  public orgSlug: string;
  public slug: string;
  public rawData: any;

  public org?: Org;
  public template: string;
  public projectTemplate?: string;
  public projTemplateMap: ProjectTemplateDictionary;
  public variables: Array<Variable>;
  public variableMap: VariableDictionary;
  public sensorGraphs: Array<SensorGraph>;
  public sensorGraphMap: SensorGraphDictionary;
  public devices: Array<Device>;
  private deviceMap: DeviceDictionary;
  public streams: Array<Stream>;
  private streamMap: StreamDictionary;
  public overlay: ProjectOverlay;
  public properties: Array<Property>;
  public propertyMap: PropertyDictionary;
  public counts: { [index: string]: number };

  constructor(data: any = {}) {
    this.id = data.id;
    this.gid = data.gid;
    this.name = data.name;
    this.orgSlug = data.org;
    this.template = data.project_template;

    this.slug = data.slug;
    this.rawData = data;

    this.devices = [];
    this.variables = [];
    this.streams = [];
    this.sensorGraphs = [];
    this.deviceMap = {}
    this.variableMap = {};
    this.projTemplateMap = {};
    this.streamMap = {};
    this.sensorGraphMap = {};
    this.overlay = new ProjectOverlay();
    this.properties = [];
    this.createdBy = data.created_by;
    this.createdOn = new Date(data.created_on);
    if ('project_template' in data) {
      this.projectTemplate = data.project_template;
    }

    if (data.counts) {
      this.counts = data.counts;
    } else {
      this.counts = {};
    }

    this.deviceMap = {};
    this.streamMap = {};
    this.variableMap = {};
    this.propertyMap = {};
  }

  private toJson(): any {
    return this.rawData;
  }

  public serialize(): any {
    let proj = this.toJson();

    //Now add in any added linked objects
    proj.devices = this.devices.map((dev) => dev.toJson());
    proj.variables = this.variables.map((variable) => variable.toJson());
    proj.streams = this.streams.map((stream) => stream.toJson());
    proj.sensorGraphs = this.sensorGraphs.map((sg) => sg.toJson());

    return proj;
  }

  public static Unserialize(obj: {[key: string]: any}) : Project {
    //Extract the org first since the slug is used above 
    let org = obj['org'];
    obj['orgSlug'] = (<Org>org).slug;
    let proj = new Project(obj);

    if (obj['devices'] && obj['devices'].length > 0) {
      proj.addDevices(obj['devices'].map((data: any) => new Device(data)));
    } 

    if(obj['variables'] && obj['variables'].length > 0) {
      proj.addVariables(obj['variables'].map((variable: any) => new Variable(variable)));
    }

    if(obj['streams'] && obj['streams'].length > 0) {
      proj.addStreams(obj['streams'].map((stream: any) => new Stream(stream)));
    }

    if(obj['sensorGraphs'] && obj['sensorGraphs'].length > 0) {
      proj.addSensorGraphs(obj['sensorGraphs'].map((sg: any) => new SensorGraph(sg)));
    }

    return proj;
  }

  public addDevices(devices: Array<Device>): void {
    this.devices = devices;
    this.deviceMap = {};
    this.devices.forEach(d => {
      this.deviceMap[d.slug] = d;
    });
  }

  public addStreams(streams: Array<Stream>): void {
    this.streams = streams;
    this.streamMap = {};
    this.streams.forEach(s => {
      this.streamMap[s.slug] = s;
    });
  }

  public addStream(stream: Stream): void {
    this.streams.push(stream);
    this.streamMap[stream.slug] = stream;
  }

  public addSensorGraphs(sg: Array<SensorGraph>): void {
    this.sensorGraphs = sg;
    this.sensorGraphs.forEach(sg => {
      this.sensorGraphMap[sg.slug] = sg;
    });
  }

  public addSensorGraph(sg: SensorGraph): void {
    this.sensorGraphs.push(sg);
    this.sensorGraphMap[sg.slug] = sg;
  }

  public getSensorGraph(slug: string): SensorGraph {
    return this.sensorGraphMap[slug];
  }

  public addProjectTemplates(templates: Array<ProjectTemplate>) {
    this.projTemplateMap = {};
    templates.forEach(pt => {
      this.projTemplateMap[pt.slug] = pt;
    })
  }

  public getProjectTemplate(): ProjectTemplate {
    if (this.projTemplateMap[this.template]){
      return this.projTemplateMap[this.template];
    } else {
      throw new ArgumentError(`Can't find Project Template for slug ${this.template}`)
    }
  }

  public addVariables(variables: Array<Variable>): void {
    this.variables = variables;
    this.variableMap = {};
    this.variables.forEach(v => {
      this.variableMap[v.slug] = v;
    });
  }

  public addVariable(variable: Variable): void {
    this.variables.push(variable);
    this.variableMap[variable.slug] = variable;
  }

  public getVariable(slug: string): Variable | undefined {
    return this.variableMap[slug];
  }

  public getVariableForStream(slug: string): Variable | undefined {
    if (slug) {
      let elements: Array<string> = slug.split("--");
      if (elements.length === 4) {
        let varSlug: string = "v--" + elements[1] + "--" + elements[3];
        return this.getVariable(varSlug);
      }
    }
    return;
  }

  public getDevice(slug: string, unmodified?: boolean): Device | null {
    let device = this.deviceMap[slug];
    if (!device) {
      return null;
    }
    
    device = new Device(device.toJson());
    
    if (unmodified || !this.overlay) {
      return device;
    }

    this.overlay.applyDevice(device, true);
    return device;
  }

  public deviceModified(slug: string): boolean {
    return this.overlay.deviceModified(slug);
  }

  public hasDevice(slug: string) {
    return (slug in this.deviceMap);
  }

  public getStream(slug: string, unmodified?: boolean): Stream | null {
    let stream = this.streamMap[slug];
    if (!stream) {
      return null;
    }

    stream = new Stream(stream.toJson());

    if (unmodified || !this.overlay) {
      return stream;
    }

    this.overlay.applyStream(stream, true);
    return stream;
  }

  public streamsForDevice(deviceSlug: string, filterByIOInfo: boolean = false): {[key:string]: Stream} {
    let streams: {[key:string]: Stream} = {};

    if (filterByIOInfo) {
      let device = this.getDevice(deviceSlug);
      if (device){
        let sg = this.getSensorGraph(device.sensorGraphSlug);
        let lids = sg.getStreamLids();
        let streamIDBase =  ['s', this.gid, device.gid].join('--');

        for (let lid of lids) {
          let streamSlug = streamIDBase + '--' + lid;
          let stream = this.getStream(streamSlug);
          if (stream == null) {
            throw new ArgumentError("Could not find stream specified in sensorgraph ioInfo: " + streamSlug);
          }

          streams[streamSlug] = stream;
        }
      }
    } else {
      for (let stream of this.streams) {
        if (stream.device == deviceSlug) {
          let stream_obj = this.getStream(stream.slug);
          if (stream_obj){
            streams[stream_obj.slug];
          }
        }
      }
    }

    return streams;
  }

  public getSensorGraphSlugs(): string[] {
    return this.devices.map(device => device.sensorGraphSlug);
  }

  /* 
    * Apply an overlay permanently to the devices and streams in this project.
    * This is distinct from updating our separate overlay object that is just
    * used on demand when streams and devices are requested rather than flattened
    * into the objects themselves.  This function is useful as an optimization for
    * simulating the effects of pulling cloud data after the contents of this overlay
    * were successfully patched to iotile.cloud.
    * 
    * We do not mark the device and stream modified here since this function is used
    * to reproduce synced data from the cloud, so the device is not modified with 
    * respect to what is stored in the cloud.
    */
  public applyOverlay(overlay: ProjectOverlay) {
    for (let device of this.devices) {
      overlay.applyDevice(device, false);
    }

    for (let stream of this.streams) {
      overlay.applyStream(stream, false);
    }

    //If these changes cause any of our internal overlay deltas to not longer apply, remove them
    this.overlay.prune(this);
  }

  public addProperties(properties: Array<Property>): void {
    this.properties = properties;
    this.propertyMap = {};
    this.properties.forEach(property => {
      this.propertyMap[property.name] = property;
    });
  }

  public getProperty(name: string): Property {
    return this.propertyMap[name];
  }

  public computeInputValue(stream: Stream, rawValue: number, mdo?: Mdo): number {
    let result: number;
    let varSlug: string = stream.variable;
    let varObj: Variable = this.variableMap[varSlug];

    // 1.- Compute Factor
    if (!mdo) {
      mdo = stream.mdo || varObj.mdo;
    }
    result = mdo.computeValue(rawValue);

    // 2.- Modify to internal storage units
    let inputUnit = stream.inputUnit;
    if (!inputUnit && varObj) {
      inputUnit = varObj.inputUnit;
    }
    if (inputUnit && inputUnit.mdo) {
      result = inputUnit.mdo.computeValue(result);
    }

    return result;
  }

  public getInputUnits(stream: Stream): Unit | null {
    if (stream.inputUnit) {
      return stream.inputUnit;
    }
    
    let variable = this.variableMap[stream.variable];
    if (!variable) {
      return null;
    }

    return variable.inputUnit;
  }

  public getOutputUnits(stream: Stream): Unit | null {
    if (stream.outputUnit) {
      return stream.outputUnit;
    }
    
    let variable = this.variableMap[stream.variable];
    if (!variable) {
      return null;
    }

    return variable.outputUnit;
  }

  public computeValue(stream: Stream, data: DataPoint): number | undefined {
    let result: number | undefined = undefined;
    let mdo: Mdo;
    if (data.value){
      if (!stream) {
        return result;
      }
      if (stream.outputUnit) {
        mdo = stream.outputUnit.mdo;
        if (mdo) {
          result = mdo.computeValue(data.value);
        }
      } else {
        result = data.outValue ? data.outValue : data.value;
      }
  
      return result;
    }
  }

  public computeOutputValue(stream: Stream, value: number): number {
    let result: number;
    let varSlug: string = stream.variable;
    let varObj: Variable = this.variableMap[varSlug];

    // Modify from internal storage units
    let outputUnit = stream.outputUnit;
    if (!outputUnit && varObj) {
      outputUnit = varObj.outputUnit;
    }
    if (outputUnit && outputUnit.mdo) {
      result = outputUnit.mdo.computeValue(value);
    } else {
      result = value;
    }

    return result;
  }

  /**
   *
   * @description
   * Given a DataPoint with a .rawValue, compute
   * value using the stream.mdo and stream.inputUnit
   * Then compute outValue using the stream.outputUnit
   * Finally, DisplayValue represents the string version of outValue
   *
   * @param {DataPoint} dataPoint should have rawValue defined
   * @param {Stream} stream is the stream to use to get input/output units
   *
   * @returns {DataPoint} Modified dataPoint
   */
  public processDataPoint(stream: Stream, dataPoint: DataPoint): DataPoint {
      if (dataPoint.rawValue){
        dataPoint.value = this.computeInputValue(stream, dataPoint.rawValue, undefined);
      } 
      if (dataPoint.value){
        dataPoint.outValue = this.computeOutputValue(stream, dataPoint.value);
      }
      // Figure out units for displayValue field
      let outUnit = stream.outputUnit;
      let variable: Variable | undefined;
      if (!outUnit) {
        // If stream has no OutputUnit, default to the Variable one.
        variable = this.getVariable(stream.variable);
        if (variable) {
          outUnit = variable.outputUnit;
        }
      }
      if (dataPoint.outValue && dataPoint.value){
        if (outUnit) {
          dataPoint.displayValue = dataPoint.outValue.toFixed(outUnit.decimalPlaces);
        } else {
          if (variable) {
            dataPoint.displayValue = dataPoint.outValue.toFixed(variable.decimalPlaces);
          } else {
            dataPoint.displayValue = dataPoint.value.toString();
          }
        }
  
        return dataPoint;
      } else {
      throw new InvalidDataError('Error processing data point', 'Data point is missing value');
    }
  };

}
