import {Device} from "../../src/models/device";

describe('DeviceTest', () => {

  it('check basic device', () => {
    let dev = new Device({
      "id": 1,
      "slug": "d--0000-0000-0000-0001",
      "gid": "0000-0000-0000-0001",
      "label": "IOTile Device (0001)",
      "active": true,
      "external_id": "",
      "sg": "water-meter-v1-1-0",
      "template": "internaltestingtemplate-v0-1-0",
      "org": "arch-internal",
      "project": "5a035efd-043f-4da6-9382-c7dbb000631f",
      "lat": null,
      "lon": null,
      "state": "N1",
      "busy": false,
      "created_on": "2016-11-03T17:42:34.169045-07:00",
      "claimed_by": "tuyet",
      "claimed_on": "2017-06-07T15:13:40.085722-07:00"
  });

    expect(dev.id).toEqual(1);
    expect(dev.slug).toEqual('d--0000-0000-0000-0001');
  });

});
