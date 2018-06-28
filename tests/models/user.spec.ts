import * as IOTileCloudModule from "ng-iotile-cloud";

describe('UserTest', () => {

  it('check user fields', () => {
    let proj: IOTileCloudModule.User = new IOTileCloudModule.User({
      username: 'test1',
      email: 'test1@example.com',
      name: 'Test One',
      is_staff: false
    });
    expect(proj.getFullName()).toEqual('Test One');
    expect(proj.getUsername()).toEqual('@test1');
    expect(proj.getAvatar()).toEqual('');
    expect(proj.isStaff).toBeFalsy()
  });
});
