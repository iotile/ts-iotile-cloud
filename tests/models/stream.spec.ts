import {Stream} from "../../src/models/stream";

describe('StreamTest', () => {
  const dummyStream0 = new Stream({
    project: "p--0000-0010",
    device: "d--0000-0000-0000-00ae",
    variable: "v--0000-0010--5001",
    raw_value_format: "<L",
    mdo_type: "S",
    input_unit: {
      "slug": "in--water-meter-volume--gallons",
      "unit_full": "Gallons",
      "unit_short": "g",
      "m": 378541,
      "d": 100,
      "o": 0.0
    },
    multiplication_factor: 1,
    division_factor: 10,
    offset: 5.0,
    data_label: 'foo',
    org: "arch-internal",
    created_on: "2016-11-16T16:42:54.312425Z",
    slug: "s--0000-0010--0000-0000-0000-00ae--5001"
  });

  const dummyStream1 = new Stream({
    project: "p--0000-0010",
    device: "d--0000-0000-0000-00ae",
    raw_value_format: "<L",
    mdo_type: "S",
    input_unit: {
      "slug": "in--water-meter-volume--gallons",
      "unit_full": "Gallons",
      "unit_short": "g",
      "m": 378541,
      "d": 100,
      "o": 0.0
    },
    multiplication_factor: 1,
    division_factor: 10,
    offset: 5.0,
    data_label: 'foo',
    org: "arch-internal",
    created_on: "2016-11-16T16:42:54.312425Z",
    slug: "s--0000-0010--0000-0000-0000-00ae--5001"
  });
  
  it('check Stream construction', () => {
    let stream: Stream = dummyStream0; 
    
    expect(stream).toBeTruthy();
    expect(stream.variable).toEqual('v--0000-0010--5001');
    expect(stream.device).toEqual('d--0000-0000-0000-00ae');
    expect(stream.project).toEqual('p--0000-0010');
    expect(stream.dataLabel).toEqual('foo');
    expect(stream.rawValueFormat).toEqual('<L');
    expect(stream.mdoType).toEqual('S');
    expect(stream.mdo.d).toEqual(10);
    expect(stream.mdo.computeValue(200)).toBe(25.0);

    expect(stream.template).toBeUndefined();
  });

  it('check getLocalVarId()', () => {
    let stream: Stream = dummyStream0;
    expect(stream.getLocalVarId()).toEqual('5001');

    expect(dummyStream1.getLocalVarId()).toEqual('');
  });

  it('should patch json object with changes', () => {
    let stream = new Stream(dummyStream0.toJson());

    stream.dataLabel = 'test label';
    stream.mdoType = 'X';
    expect(stream.dataLabel).toEqual('test label');
    expect(stream.mdoType).toEqual('X')
    
    let blob = stream.toJson();
    expect(blob.data_label).toEqual('test label');
    expect(blob.mdo_type).toEqual('X');
  })
});
