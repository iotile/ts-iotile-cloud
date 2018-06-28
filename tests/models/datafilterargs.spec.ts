import * as IOTileCloudModule from "ng-iotile-cloud";

describe('DataFilterArgsTest', () => {

  it('check buildFilterString() for dates', () => {
    let args: IOTileCloudModule.DataFilterArgs = new IOTileCloudModule.DataFilterArgs();
    expect(args).toBeTruthy();
    expect(args.buildFilterString()).toEqual("?");
    args.startDate = new Date("2016-09-13T20:29:13.825000Z");
    expect(args.buildFilterString()).toEqual("?&start=2016-09-13T20:29:13.825Z");
    args = new IOTileCloudModule.DataFilterArgs();
    args.endDate = new Date("2016-10-13T20:29:13.825000Z");
    expect(args.buildFilterString()).toEqual("?&end=2016-10-13T20:29:13.825Z");
    args.startDate = new Date("2016-09-13T20:29:13.825000Z");
    expect(args.buildFilterString()).toEqual("?&start=2016-09-13T20:29:13.825Z&end=2016-10-13T20:29:13.825Z");
  });

  it('check buildFilterLabel() or dates', () => {
    let args: IOTileCloudModule.DataFilterArgs = new IOTileCloudModule.DataFilterArgs();
    expect(args).toBeTruthy();
    expect(args.buildFilterLabel()).toEqual(null);
    args.startDate = new Date("2016-09-13T20:29:13.825000Z");
    expect(args.buildFilterLabel()).toEqual(" from 9/13/2016");
    args = new IOTileCloudModule.DataFilterArgs();
    args.endDate = new Date("2016-10-13T20:29:13.825000Z");
    expect(args.buildFilterLabel()).toEqual(" to 10/13/2016");
    args.startDate = new Date("2016-09-13T20:29:13.825000Z");
    expect(args.buildFilterLabel()).toEqual(" from 9/13/2016 to 10/13/2016");
  });

  it('check lastN', () => {
    let args: IOTileCloudModule.DataFilterArgs = new IOTileCloudModule.DataFilterArgs();
    expect(args).toBeTruthy();
    args.lastN = 10;
    expect(args.buildFilterString()).toEqual("?&lastn=10");
    expect(args.buildFilterLabel()).toEqual(" last 10 entries");
  });
});
