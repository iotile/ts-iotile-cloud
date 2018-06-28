import {IOTileCloud} from "ng-iotile-cloud";

describe('module: iotile.cloud, service: IOTileCloudService', function () {
  let Cloud: IOTileCloud;

  beforeEach(function () {
    let config: any = {
          ENV: {
            "SERVER_URL": "https://iotile.cloud",
            "HTTP_TIMEOUT": 15000
          }
        }; 

    Cloud = new IOTileCloud(config);
    });

  it('should do something', function () {
    expect(!!Cloud).toBe(true);
  });
});
