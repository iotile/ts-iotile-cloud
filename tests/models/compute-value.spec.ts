import {Project} from "../../src/models/project";
import {Variable} from "../../src/models/variable";
import {Stream} from "../../src/models/stream";
import {DataPoint} from "../../src/models/datapoint";

describe('ComputeValue', () => {

  const dummyProject: Project = new Project({
    "id": "84e3869d-1fdb-4203-9b69-18b417e2b0e0",
    "name": "My Project",
    "slug": "p--0000-0012",
    "gid": "0000-0012",
    "org": "my-org",
    "about": "",
    "pages": [
      2
    ],
    "page": {
      "slug": "water-meter",
      "label": "Water Meter",
      "id": 2
    },
    "created_on": "2016-11-16T19:32:13.412718Z",
    "created_by": "david"
  });

  const dummyVariable0: Variable = new Variable({
    "id": "e83cdfaf-144e-478a-92b2-b05a52bea2ae",
    "name": "IO 1",
    "lid": 20481,
    "var_type": "water-meter-volume",
    "input_unit": null,
    "output_unit": null,
    "project": "1b5bfb6c-333b-4a57-9c7e-cb9dc4bc1b7f",
    "org": "arch-systems",
    "about": "Water flow rate (every 10min)",
    "created_on": "2017-01-22T23:29:45.813720Z",
    "units": "Gallons",
    "multiplication_factor": 1,
    "division_factor": 10,
    "offset": 5.0,
    "decimal_places": 2,
    "mdo_label": "",
    "type": "Num",
    "app_only": false,
    "slug": "v--0000-0010--5001"
  });


  const dummyStream = new Stream({
    project: "p--0000-0010",
    device: "d--0000-0000-0000-00ae",
    variable: "v--0000-0010--5001",
    mdo_type: "S",
    input_unit: null,
    output_unit: null,
    multiplication_factor: 1,
    division_factor: 10,
    offset: 5.5,
    org: "arch-internal",
    created_on: "2016-11-16T16:42:54.312425Z",
    slug: "s--0000-0010--0000-0000-0000-00ae--5001"
  });

  const dummyStream1 = new Stream({
    project: "p--0000-0010",
    device: "d--0000-0000-0000-00ae",
    variable: "v--0000-0010--5002",
    mdo_type: "S",
    input_unit: {
      "id": 10,
      "unit_full": "Gallons",
      "unit_short": "g",
      "m": 5,
      "d": 1,
      "o": 0.0
    },
    output_unit: {
      "id": 10,
      "unit_full": "Gallons",
      "unit_short": "g",
      "decimal_places": 2,
      "m": 1,
      "d": 5,
      "o": 0.0
    },
    multiplication_factor: 1,
    division_factor: 10,
    offset: 5.0,
    org: "arch-internal",
    created_on: "2016-11-16T16:42:54.312425Z",
    slug: "s--0000-0010--0000-0000-0000-00ae--5002"
  });


  it('check Old Scheme', () => {
    let proj: Project = dummyProject;
    let variable: Variable = dummyVariable0;
    proj.addVariable(variable);
    let stream: Stream = dummyStream;
    let point: DataPoint = new DataPoint({
      "type": "Num",
      "timestamp": "2016-09-13T20:29:13.825000Z",
      "int_value": 20,
    });
    point = proj.processDataPoint(stream, point);
    expect(point.value).toBe(7.5);
    expect(point.outValue).toBe(7.5);
    expect(point.displayValue).toBe('7.50');
  });

  it('check New Scheme', () => {
    let proj: Project = dummyProject;
    let stream: Stream = dummyStream1;
    let streams: Array<Stream> = [stream];
    proj.addStreams(streams);
    let point: DataPoint = new DataPoint({
      "type": "ITR",
      "timestamp": "2016-09-13T20:29:13.825000Z",
      "int_value": 20,
      "value": 10.0,
      "display_value": "4"
    });
    point = proj.processDataPoint(stream, point);
    expect(point.value).toBe(35);
    expect(point.outValue).toBe(7);
    expect(point.displayValue).toBe('7.00');

    expect(proj.computeValue(stream, point)).toBe(7.0);
  });
});