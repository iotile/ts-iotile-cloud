import * as IOTileCloudModule from "ng-iotile-cloud";

describe('ProjectTest', () => {
  const dummyProject: IOTileCloudModule.Project = new IOTileCloudModule.Project({
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
    let proj: IOTileCloudModule.Project = dummyProject;
    expect(proj.id).toEqual('84e3869d-1fdb-4203-9b69-18b417e2b0e0');
    expect(proj.gid).toEqual('0000-0012');
    expect(proj.name).toEqual('My Project');
    expect(proj.orgSlug).toEqual('my-org');
  });

  it('check default page template', () => {
    let proj: IOTileCloudModule.Project = new IOTileCloudModule.Project({
      "id": "84e3869d-1fdb-4203-9b69-18b417e2b0e0",
      "pages": [],
      "page_templates": []
    });
    expect(proj.id).toEqual('84e3869d-1fdb-4203-9b69-18b417e2b0e0');
  });

  it('check project devices', () => {
    let proj: IOTileCloudModule.Project = dummyProject;
    let devices: Array<IOTileCloudModule.Device> = [];
    let device: IOTileCloudModule.Device = new IOTileCloudModule.Device({
      "id": 129,
      "slug": "d--0000-0000-0000-0081",
      "gid": "0000-0000-0000-0081"
    });
    devices.push(device);
    device = new IOTileCloudModule.Device({
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

  it('check project streams', () => {
    let proj: IOTileCloudModule.Project = dummyProject;
    let streams: Array<IOTileCloudModule.Stream> = [];
    let stream: IOTileCloudModule.Stream = new IOTileCloudModule.Stream({
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
    stream = new IOTileCloudModule.Stream({
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
    let proj: IOTileCloudModule.Project = dummyProject;
    let variables: Array<IOTileCloudModule.Variable> = [];
    let v: IOTileCloudModule.Variable = new IOTileCloudModule.Variable({
      "id": '5001',
      "slug": "v--0000-0001--5001"
    });
    variables.push(v);
    v = new IOTileCloudModule.Variable({
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
});
