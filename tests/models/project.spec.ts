import {Project} from "../../src/models/project";
import {Device} from "../../src/models/device";
import {Stream} from "../../src/models/stream";
import {Variable} from "../../src/models/variable";
import {Property} from "../../src/models/property";

describe('ProjectTest', () => {
  const dummyProject0: Project = new Project({
    "id": "84e3869d-1fdb-4203-9b69-18b417e2b0e0",
    "name": "My Project",
    "slug": "p--0000-0012",
    "gid": "0000-0012",
    "org": "my-org",
    "about": "",
    "pages": [
      2
    ],
    "page": {
      "slug": "water-meter",
      "label": "Water Meter",
      "id": 2
    },
    "created_on": "2016-11-16T19:32:13.412718Z",
    "created_by": "david"
  });
  
  it('check project fields', () => {
    let proj: Project = dummyProject0;
    expect(proj.id).toEqual('84e3869d-1fdb-4203-9b69-18b417e2b0e0');
    expect(proj.gid).toEqual('0000-0012');
    expect(proj.name).toEqual('My Project');
    expect(proj.orgSlug).toEqual('my-org');
  });

  it('check project counts', () => {
    let proj: Project = new Project({
      "id": "84e3869d-1fdb-4203-9b69-18b417e2b0e0",
      "counts": {
        "active_devices": 1,
        "inactive_devices": 2,
        "variables": 4,
        "streams": 6
      }
    });
    expect(proj.counts['active_devices']).toEqual(1);
    expect(proj.counts['inactive_devices']).toEqual(2);
    expect(proj.counts.variables).toEqual(4);
    expect(proj.counts.streams).toEqual(6);
  });

  it('check default page template', () => {
    let proj: Project = new Project({
      "id": "84e3869d-1fdb-4203-9b69-18b417e2b0e0",
      "pages": [],
      "page_templates": []
    });
    expect(proj.id).toEqual('84e3869d-1fdb-4203-9b69-18b417e2b0e0');
  });

  it('check project devices', () => {
    let proj: Project = dummyProject0;
    let devices: Array<Device> = [];
    let device: Device = new Device({
      "id": 129,
      "slug": "d--0000-0000-0000-0081",
      "gid": "0000-0000-0000-0081"
    });
    devices.push(device);
    device = new Device({
      "id": 130,
      "slug": "d--0000-0000-0000-0082",
      "gid": "0000-0000-0000-0082"
    });
    devices.push(device);
    proj.addDevices(devices);
    expect(proj['devices'].length).toBe(2);
    expect(proj['devices'][0].id).toBe(129);
    expect(proj['devices'][1].id).toBe(130);
  });

  it('check project remove device', () => {
    let proj: Project = dummyProject0;
    let devices: Array<Device> = [];
    let device: Device = new Device({
      "id": 129,
      "slug": "d--0000-0000-0000-0081",
      "gid": "0000-0000-0000-0081"
    });
    devices.push(device);
    device = new Device({
      "id": 130,
      "slug": "d--0000-0000-0000-0082",
      "gid": "0000-0000-0000-0082"
    });
    devices.push(device);
    proj.addDevices(devices);
    expect(proj['devices'].length).toBe(2);
    expect(proj['devices'][0].id).toBe(129);
    expect(proj['devices'][1].id).toBe(130);
    expect(proj.hasDevice('d--0000-0000-0000-0082')).toBe(true)
    proj.removeDevice('d--0000-0000-0000-0082');
    expect(proj['devices'].length).toBe(1);
    expect(proj['devices'][0].id).toBe(129);
    expect(proj.hasDevice('d--0000-0000-0000-0082')).toBe(false)
  });

  it('check project streams', () => {
    let proj: Project = dummyProject0;
    let streams: Array<Stream> = [];
    let stream: Stream = new Stream({
      "project": "p--0000-0001",
      "device": "d--0000-0000-0000-0081",
      "variable": "v--0000-0000--5c00",
      "mdo_type": "V",
      "multiplication_factor": null,
      "division_factor": null,
      "offset": null,
      "org": "foo",
      "created_on": "2016-12-05T21:20:53.572357Z",
      "slug": "s--0000-0001--0000-0000-0000-0081--5c00",
      "old_id": "0000-0000040D-5c00"
    });
    streams.push(stream);
    stream = new Stream({
      "project": "p--0000-0001",
      "device": "d--0000-0000-0000-0081",
      "variable": "v--0000-0000--5800",
      "mdo_type": "V",
      "multiplication_factor": null,
      "division_factor": null,
      "offset": null,
      "org": "netafim",
      "created_on": "2016-12-05T21:20:53.624559Z",
      "slug": "s--0000-0001--0000-0000-0000-0081--5800",
      "old_id": "0000-0000040D-5800"
    });
    streams.push(stream);
    proj.addStreams(streams);
    expect(proj['streams'].length).toBe(2);
    expect(proj['streams'][0].slug).toBe('s--0000-0001--0000-0000-0000-0081--5c00');
    expect(proj['streams'][1].slug).toBe('s--0000-0001--0000-0000-0000-0081--5800');
  });

  it('check project variables', () => {
    let proj: Project = dummyProject0;
    let variables: Array<Variable> = [];
    let v: Variable = new Variable({
      "id": '5001',
      "slug": "v--0000-0001--5001"
    });
    variables.push(v);
    v = new Variable({
      "id": '5002',
      "slug": "v--0000-0001--5002"
    });
    variables.push(v);
    proj.addVariables(variables);
    expect(proj.variables.length).toBe(2);
    expect(proj.variables[0].slug).toBe('v--0000-0001--5001');
    expect(proj.variables[1].slug).toBe('v--0000-0001--5002');
    v = proj.getVariable('v--0000-0001--5001');
    expect(v.getHexLid()).toBe('5001');
  });

  it('it check project properties', () => {
    let proj: Project = dummyProject0;
    let properties: Array<Property> = [];

    let dummyProperty1: Property = new Property({
      "id": 7,
      "name": "transportType",
      "value": "Air"
    });
    properties.push(dummyProperty1);

    let dummyProperty2 = new Property({
      "id": 8,
      "name": "cargoDescription",
      "value": "Statement or description of the cargo."
    });
    properties.push(dummyProperty2);

    proj.addProperties(properties);
    expect(proj.getProperty('transportType')).toBe(dummyProperty1);
    expect(proj.getProperty('cargoDescription')).toBe(dummyProperty2);
  });
});
