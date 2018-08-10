import {IOTileCloud} from "../src/cloud/iotile-cloud-serv";

describe('module: iotile.cloud, service: IOTileCloudService', function () {
  let Cloud: IOTileCloud;

  beforeEach(function () {
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
    });

  it('should do something', function () {
    expect(!!Cloud).toBe(true);
  });
});
