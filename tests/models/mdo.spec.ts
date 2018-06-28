import * as IOTileCloudModule from "ng-iotile-cloud";

describe('MdoTest', () => {

  it('check MDO construction from data', () => {
    let mdo: IOTileCloudModule.Mdo = new IOTileCloudModule.Mdo({
      "multiplication_factor": 100,
      "division_factor": 2,
      "offset": 10.0,
      "mdo_label": "UPP"
    });
    expect(mdo.m).toEqual(100);
    expect(mdo.d).toEqual(2);
    expect(mdo.o).toEqual(10.0);
    expect(mdo.label).toEqual('UPP');
  });

  it('check MDO construction', () => {
    let mdo: IOTileCloudModule.Mdo = new IOTileCloudModule.Mdo();
    mdo.m = 100
    mdo.d = 2
    mdo.o = 10.0
    mdo.label = 'UPP'
    expect(mdo.m).toEqual(100);
    expect(mdo.d).toEqual(2);
    expect(mdo.o).toEqual(10.0);
    expect(mdo.label).toEqual('UPP');
    expect(mdo.computeValue(5)).toBe(260);
  });

  it('check limits to num decimals', () => {
    let mdo: IOTileCloudModule.Mdo = new IOTileCloudModule.Mdo();
    // Passing a 0.333... should limit to ten decimal points
    mdo.setFromFactor(0.33333333333333, true); 
    expect(mdo.m).toEqual(100000000);
    expect(mdo.d).toEqual(33333333);
  });

  it('check mdo.setFromMdo', () => {
    let src: IOTileCloudModule.Mdo = new IOTileCloudModule.Mdo();
    src.m = 100
    src.d = 2
    src.o = 10.0
    expect(src.m).toEqual(100);

    let dst: IOTileCloudModule.Mdo = new IOTileCloudModule.Mdo();
    dst.setFromMdo(src);
    expect(dst.m).toEqual(100);
    expect(dst.d).toEqual(2);
    expect(dst.o).toEqual(10.0);
    expect(dst.label).toBeUndefined();

    src.label = 'UPP';
    dst = new IOTileCloudModule.Mdo();
    dst.setFromMdo(src);
    expect(dst.m).toEqual(100);
    expect(dst.d).toEqual(2);
    expect(dst.o).toEqual(10.0);
    expect(dst.label).toEqual('UPP');
  });

  it('check mdo.setFromFactor', () => {
    let mdo: IOTileCloudModule.Mdo = new IOTileCloudModule.Mdo();
    mdo.setFromFactor(.001, false);
    expect(mdo.m).toEqual(1);
    expect(mdo.d).toEqual(1000);
    expect(mdo.o).toEqual(0.0);

    mdo.setFromFactor(.001, true);
    expect(mdo.m).toEqual(1000);
    expect(mdo.d).toEqual(1);
    expect(mdo.o).toEqual(0.0);

    mdo.setFromFactor(0.0053, false);
    expect(mdo.m).toEqual(53);
    expect(mdo.d).toEqual(10000);

    mdo.setFromFactor(5, false);
    expect(mdo.m).toEqual(5);
    expect(mdo.d).toEqual(1);

    mdo.setFromFactor(5.0, false);
    expect(mdo.m).toEqual(5);
    expect(mdo.d).toEqual(1);

    mdo.setFromFactor(5.01, false);
    expect(mdo.m).toEqual(501);
    expect(mdo.d).toEqual(100);
  });

  it('should have a function equal operator', () => {
    let src: IOTileCloudModule.Mdo = new IOTileCloudModule.Mdo();
    src.m = 100
    src.d = 2
    src.o = 10.0

    let other = new IOTileCloudModule.Mdo();
    expect(src.equal(other)).toBe(false);
    expect(other.equal(src)).toBe(false);
    
    other.setFromMdo(src);
    expect(src.equal(other)).toBe(true);
    expect(other.equal(src)).toBe(true);

    //Check label equality
    other.setFromMdo(src);
    other.label = "Hello World";
    expect(src.equal(other)).toBe(false);
    expect(other.equal(src)).toBe(false);

    //Check m equality
    other.setFromMdo(src);
    other.m = 1;
    expect(src.equal(other)).toBe(false);
    expect(other.equal(src)).toBe(false);

    //Check d equality
    other.setFromMdo(src);
    other.d = 1;
    expect(src.equal(other)).toBe(false);
    expect(other.equal(src)).toBe(false);

    //Check o equality
    other.setFromMdo(src);
    other.o = 15.0;
    expect(src.equal(other)).toBe(false);
    expect(other.equal(src)).toBe(false);
  })
});
