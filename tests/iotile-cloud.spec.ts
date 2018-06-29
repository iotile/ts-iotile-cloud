import {IOTileCloud} from "../src/cloud/iotile-cloud-serv";

describe('module: iotile.cloud, service: IOTileCloudService', function () {
  let Cloud: IOTileCloud;

  it('Should be able to run', () => {
    expect(true).toBe(true);
  });

  // beforeEach(function () {
  //   let config: any = {
  //         ENV: {
  //           "SERVER_URL": "https://iotile.cloud",
  //           "HTTP_TIMEOUT": 15000
  //         }
  //       }; 

  //   Cloud = new IOTileCloud(config);
  //   });

  // it('should do something', function () {
  //   expect(!!Cloud).toBe(true);
  // });
});
