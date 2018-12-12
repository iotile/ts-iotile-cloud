import {IOTileCloud} from "../src/cloud/iotile-cloud-serv";
import {MockCloud} from "../src/mocks/mock-cloud";
import { ApiFilter } from "../src/models";

describe('module: iotile.cloud, service: MockCloud', function () {
  let Cloud: IOTileCloud;
  let mockCloud: MockCloud;

  let config: any = {
    "ENV": { 
      "DEV_MODE": false,
      "HTTP_TIMEOUT": 30000,
      "NAME": "IOTile Companion",
      "ENABLE_SENTRY": true,
      "SERVER_URLS": [
        {
          "shortName": "STAGE",
          "longName": "Staging Server",
          "url":"https://cloud.corp.archsys.io/api/v1"
        },
        {
          "shortName": "PRODUCTION",
          "longName": "Production Server",
          "url": "https://iotile.cloud/api/v1",
          "default": true
        }
      ]
    }
  };

  Cloud = new IOTileCloud(config);

  beforeEach(function () {
    mockCloud = new MockCloud(Cloud);
    mockCloud.defaultSetup();
    });

  it('should do something', function () {
    expect(!!Cloud).toBe(true);
    expect(!!mockCloud).toBe(true);
  });

  it('should be able to get a device', function () {
    let dev1 = mockCloud.getDevice('d--0000-0000-0000-0003');
    expect(dev1).toBeDefined();
    expect(dev1.slug).toEqual('d--0000-0000-0000-0003');
    expect(dev1.project).toEqual('5311e938-1150-4d40-bc66-e2319d112655');
  });

  it('should be able to get a stream', function () {
    let stream1 = mockCloud.getStream('s--0000-006e--0000-0000-0000-0005--100b');
    expect(stream1).toBeDefined();
    expect(stream1.slug).toEqual('s--0000-006e--0000-0000-0000-0005--100b');
    expect(stream1.device).toEqual('d--0000-0000-0000-0005');
  });

  it('should mock endpoints correctly', async () => {
      spyOn(mockCloud.MockAdapter, 'onGet').and.callThrough();

      let devices = await mockCloud.cloud.fetchAllDevices();
      expect(devices.length).toBe(7);
  });

  it('should handle pagination', async () => {
      spyOn(mockCloud.MockAdapter, 'onGet').and.callThrough();

      let filter = new ApiFilter();
      filter.addFilter('page_size', '500');

      let devices = await mockCloud.cloud.fetchAllDevices();
      expect(devices.length).toBe(7);

      let devices_param = await mockCloud.cloud.fetchAllDevices(filter);
      expect(devices_param.length).toBe(7);

      let new_filter = new ApiFilter();
      new_filter.addFilter('page_size', '2');

      let devices_paginated = await mockCloud.cloud.fetchAllDevices(new_filter);
      // NB: since the mock endpoints are dumb, they resend all 7 devices on each call
      // so since 7 devices / page_size of 2 = 4 calls, we get 7 * 4 = 28 returned
      expect(devices_paginated.length).toBe(28);
  });
  

  it('should clear page filters between requests', async () => {
    mockCloud.defaultSetup();

      spyOn(mockCloud.MockAdapter, 'onGet').and.callThrough();

      let filter = new ApiFilter();
      filter.addFilter('page_size', '500');

      let devices = await mockCloud.cloud.fetchAllDevices();
      expect(devices.length).toBe(7);

      let devices_param = await mockCloud.cloud.fetchAllDevices(filter);
      expect(devices_param.length).toBe(7);

      let new_filter = new ApiFilter();
      new_filter.addFilter('page_size', '2');

      let devices_paginated = await mockCloud.cloud.fetchAllDevices(new_filter);
      // NB: since the mock endpoints are dumb, they resend all 7 devices on each call
      // so since 7 devices / page_size of 2 = 4 calls, we get 7 * 4 = 28 returned
      expect(devices_paginated.length).toBe(28);
      // filters passed in are not globally modified
      expect(new_filter.getFilter('page')).not.toBeDefined();

      devices_paginated = await mockCloud.cloud.fetchAllDevices(new_filter);
      expect(devices_paginated.length).toBe(28);
  });
  
});