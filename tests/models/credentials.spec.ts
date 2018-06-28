import * as IOTileCloudModule from "ng-iotile-cloud";

describe('CredentialsTest', function () {
  it('get credentials payload', function () {
    let cred: IOTileCloudModule.Credentials = new IOTileCloudModule.Credentials('joe', 'joe.123');
    expect(cred.getPayload()).toEqual({
        username: 'joe',
        password: 'joe.123'
    });
  });

  it('check credentials token', function () {
    let cred: IOTileCloudModule.Credentials = new IOTileCloudModule.Credentials('joe', 'joe.123');
    cred.setToken('1234567890');
    expect(cred.getToken()).toEqual('1234567890');
    cred.clearToken();
    expect(cred.getToken()).toBe(null);
  });
});
