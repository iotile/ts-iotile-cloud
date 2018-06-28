import {StreamDelta, DeviceDelta, Device, Stream, Project, StreamOutputUnitsDelta, DeviceLocationDelta,
        StreamInputUnitsDelta, StreamLabelDelta, DeviceLabelDelta, StreamMDODelta, DeviceDrifterDelta} 
        from "../models";
import {DeltaStatus, SerializedDelta} from "../base/model-delta";
import {DataConflictError, streamInDevice} from "./cloud-utils";
import {endsWith} from "iotile-common";
var merge = require('lodash.merge');

/*
 * Project overlays store local modifications to the project (project, stream, device) settings
 * that are retrieved from the cloud.  These local modifications are always stored in the form
 * of delta classes that know how to check if they apply to a model and to apply themselves.
 */
type SubMap = {[key: string]: {[key: string]: StreamDelta}} | {[key: string]: {[key: string]: DeviceDelta}};

interface DeltaMap {
    stream: {[key: string]: {[key: string]: StreamDelta}};
    device: {[key: string]: {[key: string]: DeviceDelta}};
}

export interface SerializedOverlay {
    [key: string]: {[key: string]: SerializedDelta};
}

export class ProjectOverlay {
    private deltaMap: DeltaMap;
    private deserializerMap: {[key: string]: (guid: string, slug: string, obj: {}) => StreamDelta|DeviceDelta};

    constructor(deltas: (StreamDelta|DeviceDelta)[] = []) {
        this.deltaMap = {stream: {}, device: {}};

        for (let delta of deltas) {
            this.addDelta(delta);
        }

        this.loadDeserializers();
    }

    public isEmpty(): boolean {
        let streamKeys = Object.keys(this.deltaMap.stream);
        let deviceKeys = Object.keys(this.deltaMap.device);

        return (streamKeys.length === 0 && deviceKeys.length === 0);
    }

    public toList(): (StreamDelta|DeviceDelta)[] {
        let deltas = [];

        for (let slug in this.deltaMap.device) {
            for (let id in this.deltaMap.device[slug]) {
                deltas.push(this.deltaMap.device[slug][id]);
            }
        }

        for (let slug in this.deltaMap.stream) {
            for (let id in this.deltaMap.stream[slug]) {
                deltas.push(this.deltaMap.stream[slug][id]);
            }
        }

        return deltas;
    }

    public merge(overlay: ProjectOverlay) {
        this.addDeltas(overlay.toList());
    }

    public affectedStreamModels(): string[] {
        return Object.keys(this.deltaMap.stream);
    }
    
    public affectedDeviceModels(): string[] {
        return Object.keys(this.deltaMap.device);
    }

    public patchForDevice(device: Device): {} {
        if (!(device.slug in this.deltaMap.device)) {
            return {};
        }

        let patch = {};
        for (let deltaSlug in this.deltaMap.device[device.slug]) {
            let delta:DeviceDelta = this.deltaMap.device[device.slug][deltaSlug];

            if (delta.check(device) === DeltaStatus.Conflicted) {
                throw new DataConflictError("The same setting has also been modified in the cloud, please resync before trying to update.", "Conflict in slug: " + delta.slug + " guid: " + delta.id);
            }

            merge(patch, delta.getPatch(device));
        }

        return patch;
    }

    public patchForStream(stream: Stream): {} {
        if (!(stream.slug in this.deltaMap.stream)) {
            return {};
        }

        let patch = {};
        for (let deltaSlug in this.deltaMap.stream[stream.slug]) {
            let delta = this.deltaMap.stream[stream.slug][deltaSlug];

            if (delta.check(stream) === DeltaStatus.Conflicted) {
                throw new DataConflictError("The same setting has also been modified in the cloud, please resync before trying to update.", "Conflict in slug: " + delta.slug + " guid: " + delta.id);
            }

            merge(patch, delta.getPatch(stream));
        }

        return patch;
    }

    /*
        * Return true if a device is directly modified or if one of its streams is modified
        */
    public deviceModified(deviceSlug: string): boolean {
        if (deviceSlug in this.deltaMap.device) {
            return true;
        }

        for (let streamSlug in this.deltaMap.stream) {
            let delta = this.deltaMap.stream[streamSlug];
            if (streamInDevice(streamSlug, deviceSlug)) {
                return true;
            }
        }

        return false;
    }

    public deviceHasDelta(deviceSlug: string, deltaName: string) {
        if (!(deviceSlug in this.deltaMap.device)) {
            return false;
        }

        return deltaName in this.deltaMap.device[deviceSlug];
    }

    public variableModified(variableLid: string) {
        for (let slug in this.deltaMap.stream) {
            if (endsWith(slug, variableLid)) {
                return true;
            }
        }

        return false;
    }

    private loadDeserializers() {
        this.deserializerMap = {};

        //Stream Deserializers
        this.deserializerMap[StreamOutputUnitsDelta.ClassName] = StreamOutputUnitsDelta.Deserialize;
        this.deserializerMap[StreamInputUnitsDelta.ClassName] = StreamInputUnitsDelta.Deserialize;
        this.deserializerMap[StreamLabelDelta.ClassName] = StreamLabelDelta.Deserialize;
        this.deserializerMap[StreamMDODelta.ClassName] = StreamMDODelta.Deserialize;

        //Device Deserializers
        this.deserializerMap[DeviceLabelDelta.ClassName] = DeviceLabelDelta.Deserialize;
        this.deserializerMap[DeviceLocationDelta.ClassName] = DeviceLocationDelta.Deserialize;
        this.deserializerMap[DeviceDrifterDelta.ClassName] = DeviceDrifterDelta.Deserialize;
    }

    public prune(project: Project) {
        for (let slug in this.deltaMap.stream) {
            let deltas = this.deltaMap.stream[slug];
            let stream = project.getStream(slug, true);

            //If the stream doesn't exist, all deltas are obsolete
            if (stream == null) {
                delete this.deltaMap.stream[slug];
                continue;
            }

            for (let guid in deltas) {
                let delta = deltas[guid];
                if (delta.check(stream) !== DeltaStatus.Applies) {
                    delete deltas[guid];
                }
            }

            //If we have removed all of the stream deltas, also remove the stream
            if (Object.keys(deltas).length == 0) {
                delete this.deltaMap.stream[slug];
            }
        }

        for (let slug in this.deltaMap.device) {
            let deltas = this.deltaMap.device[slug];
            let device = project.getDevice(slug, true);

            //If the device doesn't exist, all deltas are obsolete
            if (device == null) {
                delete this.deltaMap.device[slug];
                continue;
            }

            for (let guid in deltas) {
                let delta = deltas[guid];
                if (delta.check(device) !== DeltaStatus.Applies) {
                    delete deltas[guid];
                }
            }

            //If we have removed all of the device deltas, also remove the device
            if (Object.keys(deltas).length == 0) {
                delete this.deltaMap.device[slug];
            }
        }
    }

    public applyDevice(device: Device, markModified: boolean) {
        let deltas = this.deltaMap.device[device.slug];

        if (deltas == null) {
            return;
        }

        for (let guid in deltas) {
            let delta = deltas[guid];
            if (delta.check(device) === DeltaStatus.Applies) {
                delta.apply(device);

                if (markModified) {
                    device.isModified = true;
                }
            }
        }
    }

    public applyStream(stream: Stream, markModified: boolean) {
        let deltas = this.deltaMap.stream[stream.slug];

        if (deltas == null) {
            return;
        }

        for (let guid in deltas) {
            let delta = deltas[guid];
            if (delta.check(stream) === DeltaStatus.Applies) {
                delta.apply(stream);

                if (markModified) {
                    stream.isModified = true;
                }
            }
        }
    }

    public addDelta(delta: StreamDelta | DeviceDelta) {
        let subMap: SubMap = this.deltaMap.device;
        let slug = delta.slug;

        if (delta instanceof StreamDelta) {
            subMap = this.deltaMap.stream;
        }

        if (!(slug in subMap)) {
            subMap[slug] = {};
        }

        subMap[slug][delta.classname] = delta;
    }

    public addDeltas(deltas: (StreamDelta | DeviceDelta)[]) {
        for (let delta of deltas) {
            this.addDelta(delta);
        }
    }

    public serialize() : SerializedOverlay {
        let obj: SerializedOverlay = {};

        for(let slug in this.deltaMap.stream) {
            let streamDeltas = this.deltaMap.stream[slug];
            obj[slug] = {}

            for (let id in streamDeltas) {
                obj[slug][id] = streamDeltas[id].serialize();
            }
        }

        for(let slug in this.deltaMap.device) {
            let deviceDeltas = this.deltaMap.device[slug];
            obj[slug] = {}

            for (let id in deviceDeltas) {
                obj[slug][id] = deviceDeltas[id].serialize();
            }
        }

        return obj;
    }

    private deserialize(obj: SerializedOverlay, log?: ng.ILogService) {
        for (let slug in obj) {
            let deltas = obj[slug];

            for (let className in deltas) {
                let serializedDelta = deltas[className];
                let guid = serializedDelta.guid;
                let slug = serializedDelta.slug;

                if (!(className in this.deserializerMap)) {
                    if (log) {
                        log.warn("[ProjectOverlay] Skipping unknown delta type in overlay, type: " + className + ' slug: ' + slug);
                    }

                    continue;
                }

                let delta = this.deserializerMap[className](guid, slug, serializedDelta.args);
                this.addDelta(delta);
            }
        }
    }

    public static Deserialize(obj: SerializedOverlay, log?: ng.ILogService) : ProjectOverlay {
        let overlay = new ProjectOverlay();
        
        overlay.deserialize(obj, log);
        return overlay;
    }
}
