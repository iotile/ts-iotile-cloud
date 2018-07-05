import {Stream} from "../../src/models/stream";

describe('StreamTest', () => {
  const dummyStream0 = new Stream({
    id: "b0c03d58-47db-4a74-afe2-bb06a3bed083",
    project_id: "ece4441c-b17a-4e3c-94dc-8380caaab6ab",
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
    var_type: null,
    multiplication_factor: 1,
    division_factor: 10,
    offset: 5.0,
    data_label: 'foo',
    data_type: "00",
    org: "arch-internal",
    created_on: "2016-11-16T16:42:54.312425Z",
    slug: "s--0000-0010--0000-0000-0000-00ae--5001"
  });

  const dummyStream01 = new Stream({
    id: "b0c03d58-47db-4a74-afe2-bb06a3bed083",
    project_id: "ece4441c-b17a-4e3c-94dc-8380caaab6ab",
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
    data_type: "00",
    org: "arch-internal",
    created_on: "2016-11-16T16:42:54.312425Z",
    slug: "s--0000-0010--0000-0000-0000-00ae--5001"
  });

  const dummyStream2 = new Stream({
    "id": "13671f1f-e2cb-49f8-82bd-a05d5f66371d",
    "project_id": null,
    "project": "p--0000-0006",
    "device": "d--0000-0000-0000-0084",
    "block": "b--0001-0000-0000-0084",
    "data_label": "My Data",
    "variable": "v--0000-0006--5003",
    "var_type": "soil-moisture-percent",
    "var_name": "IO 1",
    "var_lid": 20483,
    "input_unit": {
        "m": 100,
        "d": 4095,
        "unit_short": "%",
        "o": 0.0,
        "slug": "in--soil-moisture-percent--percent",
        "unit_full": "Percent"
    },
    "output_unit": {
        "slug": "out--soil-moisture-percent--percent",
        "unit_short": "%",
        "decimal_places": 1,
        "m": 1,
        "d": 1,
        "unit_full": "Percent",
        "o": 0.0,
        "derived_units": {}
    },
    "derived_stream": null,
    "raw_value_format": "<L",
    "mdo_type": "S",
    "mdo_label": "",
    "multiplication_factor": 1,
    "division_factor": 10,
    "offset": 0.0,
    "org": "arch-grow",
    "created_on": "2017-08-24T21:50:49.658026Z",
    "slug": "s--0000-0006--0001-0000-0000-0084--5003",
    "enabled": true
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

    expect(dummyStream01.getLocalVarId()).toEqual('');
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
  });

  it('check stream.getPatchPayload()', () => {
    let stream: Stream = dummyStream2;
    let payload: any = stream.getPatchPayload();
    expect(payload.mdo_type).toEqual('S');
    expect(payload.input_unit).toEqual('in--soil-moisture-percent--percent');
    expect(payload.output_unit).toEqual('out--soil-moisture-percent--percent');
    expect(payload.multiplication_factor).toEqual(1);
    expect(payload.division_factor).toEqual(10);
    expect(payload.enabled).toBeTruthy();
  });
});
