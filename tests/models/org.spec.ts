import * as IOTileCloudModule from "ng-iotile-cloud";

describe('OrgTest', () => {

  it('check basic device', () => {
    let org: IOTileCloudModule.Org = new IOTileCloudModule.Org({
        "id": "9e46d50b-53b3-43ad-9725-06994e1086a3",
        "name": "My Org",
        "slug": "my-org",
        "about": "",
        "created_on": "2016-11-04T00:48:07.566567Z",
        "created_by": "david",
        "avatar": {
          "thumbnail": "https://image.com/thumbnail.jpg",
          "tiny": "https://image.com/tiny.jpg"
        }
    });
    expect(org.slug).toEqual('my-org');
    expect(org.name).toEqual('My Org');
    expect(org.tinyUrl).toEqual('https://image.com/tiny.jpg');
    expect(org.thumbnailUrl).toEqual('https://image.com/thumbnail.jpg');
  });

});
