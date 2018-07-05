import {User} from "../../src/models/user";

describe('UserTest', () => {

  it('check user fields', () => {
    let proj: User = new User({
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

  it('check user without', () => {
    let user: User = new User({
      username: 'test1',
      email: 'test1@example.com',
      name: 'Test One',
      is_staff: false,
      tagline: ''
    });

    expect(user.tagline).toEqual('');
    expect('creationDate' in user).toBeTruthy();
  });
});
