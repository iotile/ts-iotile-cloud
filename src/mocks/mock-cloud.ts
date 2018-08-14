/*
 * Mock data for two projects that can be used to test the IOTile Companion App.
 */

import {Stream, Device, Project, Variable, SensorGraph, VarType, ProjectTemplate }
    from "../models";
import {IOTileCloud} from "../cloud/iotile-cloud-serv";
import {ArgumentError, delay} from "iotile-common";
let clonedeep = require("lodash.clonedeep");
let MockAdapter = require("axios-mock-adapter");
let axios = require("axios");

export enum Response {
    Success = 200,
    Fail401 = 401,
    Fail402 = 402
}

export class MockCloud 
{
    public MockAdapter: any;
    public cloud: IOTileCloud;
    public projects: Project[];
    public devices: Device[];
    public variables:  Variable[];
    public streams: Stream[];
    public sensorGraphs: SensorGraph[];
    public varTypes: VarType[];
    public projTemplates: ProjectTemplate[];
    
    constructor(cloud: IOTileCloud) {
        this.cloud = cloud;
        this.cloud['Config'].ENV.SERVER_URLS = [{
            "shortName": "PRODUCTION",
            "longName": "Production Server",
            "url": "https://iotile.cloud/api/v1",
            "default": true
          }];
        this.cloud.server = {
            "shortName": "PRODUCTION",
            "longName": "Production Server",
            "url": "https://iotile.cloud/api/v1",
            "default": true
          };

        this.projects = [new Project(soil_proj), new Project(water_proj)];
        
        let deviceList: Array<Device> = [];
        devices.forEach(element => {
            deviceList.push(new Device(element));
        });

        this.devices = deviceList;

        let varList : Array<Variable> = [];
        variables.forEach(element => {
            varList.push(new Variable(element));
        })
        this.variables = varList;

        let streamList : Array<Stream> = [];
        streams.forEach(element => {
            streamList.push(new Stream(element));
        })
        this.streams = streamList;

        let sgList : Array<SensorGraph> = [];
        sg.forEach(element => {
            sgList.push(new SensorGraph(element));
        })
        this.sensorGraphs = sgList;

        let vartypeList : Array<VarType> = [];
        vartypes.forEach(element => {
            vartypeList.push(new VarType(element));
        })
        this.varTypes = vartypeList;

        let pts : Array<ProjectTemplate> = [];
        project_templates.forEach(element => {
            pts.push(new ProjectTemplate(element));
        })
        this.projTemplates = pts;
    }

    private buildListResponse(objects: {}[]) {
        let obj = {
            "count": objects.length,
            "next": null,
            "prev": null,
            "results": objects
        }

        return clonedeep(obj);
    }

    private buildParamResponse(getType: string, paramType: string, param: string) {
        let retrieved = [];
        switch(getType){
            case 'project':
            for (let p of this.projects){
                if (p[paramType] == param){
                    retrieved.push(p.serialize());
                }
            }
            break;

            case 'device':
            for (let d of this.devices){
                if (d[paramType] == param){
                    retrieved.push(d.toJson());
                }
            }
            break;

            case 'sensorgraph':
            for (let sg of this.sensorGraphs){
                if (sg[paramType] == param){
                    retrieved.push(sg.toJson());
                }
            }
            break;

            case 'variable':
            for (let v of this.variables){
                if (v[paramType] == param){
                    retrieved.push(v.toJson());
                }
            }
            break;

            case 'stream':
            for (let s of this.streams){
                if (s[paramType] == param){
                    retrieved.push(s.toJson());
                }
            }
            break;

            case 'vartype':
            for (let vt of this.varTypes){
                if (vt[paramType] == param){
                    retrieved.push(vt.toJson());
                }
            }
            break;

            case 'pt':
            for (let pt of this.projTemplates){
                if (pt[paramType] == param){
                    retrieved.push(pt.toJson());
                }
            }
            break;
        }

        let obj = this.buildListResponse(retrieved);

        return clonedeep(obj);
    }

    public getStream(slug: string) : Stream {
        for (let stream of this.streams) {
            if (stream.slug == slug) {
                return new Stream(stream);
            }
        }
        
        throw new ArgumentError("Unknown stream slug: " + slug);
    }

    public getDevice(slug: string): Device {
        for (let device of this.devices) {
            if (device.slug == slug) {
                return new Device(device);
            }
        }

        throw new ArgumentError("Unknown device slug: " + slug);
    }

    public expectStreamPatch(slug: string, data: {}, responseType: Response, responseData?: {}) {
        if (responseData == null) {
            responseData = {};
        }

        let url = '/stream/'+ slug +'/';
        this.MockAdapter.onPatch(url, data).reply(Response, responseData);
    }

    public defaultSetup() {
        this.MockAdapter = new MockAdapter(axios);

        let that = this;
        this.MockAdapter.onGet(/https:\/\/iotile\.cloud\/api\/v1\/project\/(\?([\w-]+(=[\w-]*)?(&[\w-]+(=[\w-]*)?)*))?$/).reply(200, that.buildListResponse([water_proj, soil_proj]));
        this.MockAdapter.onGet(/https:\/\/iotile\.cloud\/api\/v1\/org\/(\?([\w-]+(=[\w-]*)?(&[\w-]+(=[\w-]*)?)*))?$/).reply(200, that.buildListResponse([arch_internal_org, arch_systems_org]));
        this.MockAdapter.onGet(/https:\/\/iotile\.cloud\/api\/v1\/device\/(\?([\w-]+(=[\w-]*)?(&[\w-]+(=[\w-]*)?)*))?$/).reply(200, that.buildListResponse(devices));
        this.MockAdapter.onGet(/https:\/\/iotile\.cloud\/api\/v1\/stream\/(\?([\w-]+(=[\w-]*)?(&[\w-]+(=[\w-]*)?)*))?$/).reply(200, that.buildListResponse(streams));
        this.MockAdapter.onGet(/https:\/\/iotile\.cloud\/api\/v1\/variable\/(\?([\w-]+(=[\w-]*)?(&[\w-]+(=[\w-]*)?)*))?$/).reply(200, that.buildListResponse(variables));
        this.MockAdapter.onGet(/https:\/\/iotile\.cloud\/api\/v1\/vartype\/(\?([\w-]+(=[\w-]*)?(&[\w-]+(=[\w-]*)?)*))?$/).reply(200, that.buildListResponse(vartypes));
        this.MockAdapter.onGet(/https:\/\/iotile\.cloud\/api\/v1\/sg\/(\?([\w-]+(=[\w-]*)?(&[\w-]+(=[\w-]*)?)*))?$/).reply(200, that.buildListResponse(sg));
        this.MockAdapter.onGet(/https:\/\/iotile\.cloud\/api\/v1\/pt\/(\?([\w-]+(=[\w-]*)?(&[\w-]+(=[\w-]*)?)*))?$/).reply(200, that.buildListResponse(project_templates));

        this.MockAdapter.onGet(`https://iotile.cloud/api/v1/org/${arch_internal_org.slug}/membership/`).reply(200, arch_internal_membership);
        this.MockAdapter.onGet(`https://iotile.cloud/api/v1/org/${arch_systems_org.slug}/membership/`).reply(200, arch_systems_membership);

        // this.MockAdapter.onGet(`https://iotile.cloud/api/v1/project/(.+)/`, undefined, ['id']).reply(this.buildParamResponse('project', 'project', params['id']));
        // this.MockAdapter.onGet(`https://iotile.cloud/api/v1/device/?project=(.+)`, undefined, ['id']).reply(this.buildParamResponse('device', 'project', params['id']));
        // this.MockAdapter.onGet(`https://iotile.cloud/api/v1/stream/?project=(.+)`, undefined, ['id']).reply(this.buildParamResponse('stream', 'project', params['id']));
        // this.MockAdapter.onGet(`https://iotile.cloud/api/v1/variable/(.+)`, undefined, ['id']).reply(this.buildParamResponse('variable', 'project', params['id']));
    }
}

var project_templates = [
    {
        "id": 2,
        "name": "Default Template",
        "slug": "default-template-v1-0-0",
        "org": "arch-systems",
        "version": "v1.0.0",
        "extra_data": {
            "web": {
                "projectTemplateSlug": "default"
            }
        },
        "created_on": "2017-01-22T22:50:24.512275Z"
    },
    {
        "id": 8,
        "name": "Shipping Template",
        "slug": "shipping-template-v1-0-0",
        "org": "arch-systems",
        "version": "v1.0.0",
        "extra_data": {
            "web": {
                "projectTemplateSlug": "shipping"
            }
        },
        "created_on": "2017-08-31T01:52:39.851213Z"
    },
    {
        "id": 9,
        "name": "Simple Template",
        "slug": "simple-template-v1-0-0",
        "org": "arch-systems",
        "version": "v1.0.0",
        "extra_data": {
            "web": {
                "projectTemplateSlug": "simple"
            }
        },
        "created_on": "2017-09-04T23:45:16.642470Z"
    },
    {
        "id": 7,
        "name": "Water Meter",
        "slug": "water-meter-v1-1-0",
        "org": "arch-systems",
        "version": "v1.1.0",
        "extra_data": {
            "web": {
                "projectTemplateSlug": "default"
            }
        },
        "created_on": "2017-03-17T06:15:44.410131Z"
    }
];

var arch_internal_org = {
    "id": "564c54b5-19df-4fe0-9655-92542a2d0932",
    "name": "Arch - Internal",
    "slug": "arch-internal",
    "about": "Internal Projects for Testing",
    "created_on": "2016-11-04T00:48:13.033551Z",
    "created_by": "david",
    "avatar": {
        "thumbnail": "https://media.iotile.cloud/prod/images/3e5554ff-0e4d-4a10-b299-415e143c6931/thumbnail.jpg",
        "tiny": "https://media.iotile.cloud/prod/images/3e5554ff-0e4d-4a10-b299-415e143c6931/tiny.jpg"
    }
};

var arch_systems_org = {
    "id": "0e1031ba-b4b1-48e1-873c-73155b30c038",
    "name": "Arch Systems",
    "slug": "arch-systems",
    "about": "",
    "created_on": "2016-11-04T00:42:34.151136Z",
    "created_by": "david",
    "avatar": {
        "thumbnail": "https://media.iotile.cloud/prod/images/09592eb4-0a84-4394-bcc6-e2205235a8b8/thumbnail.jpg",
        "tiny": "https://media.iotile.cloud/prod/images/09592eb4-0a84-4394-bcc6-e2205235a8b8/tiny.jpg"
    }
};

var arch_internal_membership = {
    "user": "kaylie",
    "user_details": {
        "email": "kaylie@arch-iot.com",
        "username": "kaylie",
        "name": "Kaylie DeHart",
        "tagline": "Software Engineer [Mobile] @Arch",
        "avatar": {
            "tiny": "https://secure.gravatar.com/avatar/59dfdaa43783adc9adebdaa55a768c27?s=28&d=identicon",
            "thumbnail": "https://secure.gravatar.com/avatar/59dfdaa43783adc9adebdaa55a768c27?s=80&d=identicon"
        }
    },
    "created_on": "2017-04-17T23:00:06Z",
    "is_active": true,
    "is_org_admin": true
}

var arch_systems_membership = {
    "user": "kaylie",
    "user_details": {
        "email": "kaylie@arch-iot.com",
        "username": "kaylie",
        "name": "Kaylie DeHart",
        "tagline": "Software Engineer [Mobile] @Arch",
        "avatar": {
            "tiny": "https://secure.gravatar.com/avatar/59dfdaa43783adc9adebdaa55a768c27?s=28&d=identicon",
            "thumbnail": "https://secure.gravatar.com/avatar/59dfdaa43783adc9adebdaa55a768c27?s=80&d=identicon"
        }
    },
    "created_on": "2017-04-17T23:00:06Z",
    "is_active": true,
    "is_org_admin": false
}

var soil_proj = {
    "id": "5311e938-1150-4d40-bc66-e2319d112655",
    "name": "Mobile App Testing Project - Soil",
    "slug": "p--0000-006d",
    "gid": "0000-006d",
    "org": "arch-internal",
    "about": "",
    "project_template": null,
    "page": {
        "label": "Water Meter",
        "id": 2,
        "slug": "water-meter"
    },
    "created_on": "2017-03-20T01:02:56.295859Z",
    "created_by": "david"
};

var water_proj = {
    "id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
    "name": "Mobile App Testing Project - Water",
    "slug": "p--0000-006e",
    "gid": "0000-006e",
    "org": "arch-internal",
    "about": "",
    "project_template": null,
    "page": {
        "label": "Water Meter",
        "id": 2,
        "slug": "water-meter"
    },
    "created_on": "2017-03-20T01:02:56.314521Z",
    "created_by": "david"
};

var sg = [
    {
        "id": 18,
        "name": "4-420-1-flow ProtoPod",
        "slug": "4-420-1-flow-protopod-v1-0-0",
        "org": "arch-systems",
        "project_template": "default-template-v1-0-0",
        "variable_templates": [
            {
                "id": 49,
                "label": "IO 1",
                "lid_hex": "5001",
                "derived_lid_hex": "",
                "var_type": "water-meter-volume",
                "default_input_unit": "in--water-meter-volume--gallons",
                "default_output_unit": "out--water-meter-volume--gallons",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 50,
                "label": "IO 2",
                "lid_hex": "5005",
                "derived_lid_hex": "",
                "var_type": "420-milliamps",
                "default_input_unit": "in--420-milliamps--milliamps",
                "default_output_unit": "out--420-milliamps--milliamps",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 51,
                "label": "IO 3",
                "lid_hex": "500c",
                "derived_lid_hex": "",
                "var_type": "420-milliamps",
                "default_input_unit": "in--420-milliamps--milliamps",
                "default_output_unit": "out--420-milliamps--milliamps",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 52,
                "label": "IO 4",
                "lid_hex": "500d",
                "derived_lid_hex": "",
                "var_type": "420-milliamps",
                "default_input_unit": "in--420-milliamps--milliamps",
                "default_output_unit": "out--420-milliamps--milliamps",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 53,
                "label": "IO 5",
                "lid_hex": "500e",
                "derived_lid_hex": "",
                "var_type": "420-milliamps",
                "default_input_unit": "in--420-milliamps--milliamps",
                "default_output_unit": "out--420-milliamps--milliamps",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 54,
                "label": "Pulse 1",
                "lid_hex": "100b",
                "derived_lid_hex": "",
                "var_type": "water-meter-flow",
                "default_input_unit": "in--water-meter-flow--gallons",
                "default_output_unit": "out--water-meter-flow--gallons-per-min",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            },
            {
                "id": 55,
                "label": "RT 2",
                "lid_hex": "1011",
                "derived_lid_hex": "",
                "var_type": "420-milliamps",
                "default_input_unit": "in--420-milliamps--milliamps",
                "default_output_unit": "out--420-milliamps--milliamps",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            },
            {
                "id": 56,
                "label": "RT 3",
                "lid_hex": "1016",
                "derived_lid_hex": "",
                "var_type": "420-milliamps",
                "default_input_unit": "in--420-milliamps--milliamps",
                "default_output_unit": "out--420-milliamps--milliamps",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            },
            {
                "id": 57,
                "label": "RT 4",
                "lid_hex": "1017",
                "derived_lid_hex": "",
                "var_type": "420-milliamps",
                "default_input_unit": "in--420-milliamps--milliamps",
                "default_output_unit": "out--420-milliamps--milliamps",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            },
            {
                "id": 58,
                "label": "RT 5",
                "lid_hex": "1018",
                "derived_lid_hex": "",
                "var_type": "420-milliamps",
                "default_input_unit": "in--420-milliamps--milliamps",
                "default_output_unit": "out--420-milliamps--milliamps",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            }
        ],
        "display_widget_templates": [
            {
                "id": 41,
                "label": "IO 1",
                "lid_hex": "5001",
                "var_type": "water-meter-volume",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 42,
                "label": "IO 2",
                "lid_hex": "5005",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 43,
                "label": "IO 3",
                "lid_hex": "500c",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 44,
                "label": "IO 4",
                "lid_hex": "500d",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 45,
                "label": "IO 5",
                "lid_hex": "500e",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 46,
                "label": "RT 1",
                "lid_hex": "100b",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            },
            {
                "id": 47,
                "label": "RT 2",
                "lid_hex": "1011",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            },
            {
                "id": 48,
                "label": "RT 3",
                "lid_hex": "1016",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            },
            {
                "id": 49,
                "label": "RT 4",
                "lid_hex": "1017",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            },
            {
                "id": 50,
                "label": "RT 5",
                "lid_hex": "1018",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            }
        ],
        "ui_extra": {
            "mobile": {
                "controller": "defaultCtrl",
                "template": "default",
                "ioInfo": {
                    "map": {
                        "5001": {
                            "label": "IO 1",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "Flow 1",
                                    "lid": "100b"
                                }
                            }
                        },
                        "500d": {
                            "label": "IO 4",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "IO 4",
                                    "lid": "1017"
                                }
                            }
                        },
                        "500e": {
                            "label": "IO 5",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "IO 5",
                                    "lid": "1018"
                                }
                            }
                        },
                        "5005": {
                            "label": "IO 2",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "IO 2",
                                    "lid": "1011"
                                }
                            }
                        },
                        "500c": {
                            "label": "IO 3",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "IO 3",
                                    "lid": "1016"
                                }
                            }
                        }
                    },
                    "order": [
                        "5001",
                        "5005",
                        "500c",
                        "500d",
                        "500e"
                    ]
                },
                "other": null
            },
            "web": {
                "pageTemplateSlug": "default"
            }
        },
        "major_version": 1,
        "minor_version": 0,
        "patch_version": 0,
        "created_on": "2017-06-15T22:16:25.050506Z"
    },
    {
        "id": 12,
        "name": "Accelerometer",
        "slug": "accelerometer-v0-1-0",
        "org": "arch-systems",
        "project_template": "default-template-v1-0-0",
        "variable_templates": [
            {
                "id": 32,
                "label": "RT X",
                "lid_hex": "1012",
                "derived_lid_hex": "",
                "var_type": "default",
                "default_input_unit": "in--default--unit",
                "default_output_unit": "out--default--unit",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 33,
                "label": "RT Y",
                "lid_hex": "1013",
                "derived_lid_hex": "",
                "var_type": "default",
                "default_input_unit": "in--default--unit",
                "default_output_unit": "out--default--unit",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 34,
                "label": "RT Z",
                "lid_hex": "1014",
                "derived_lid_hex": "",
                "var_type": "default",
                "default_input_unit": "in--default--unit",
                "default_output_unit": "out--default--unit",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 27,
                "label": "ACC ST",
                "lid_hex": "5006",
                "derived_lid_hex": "",
                "var_type": "default",
                "default_input_unit": "in--default--unit",
                "default_output_unit": "out--default--unit",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 28,
                "label": "ACC X",
                "lid_hex": "5007",
                "derived_lid_hex": "",
                "var_type": "default",
                "default_input_unit": "in--default--unit",
                "default_output_unit": "out--default--unit",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 29,
                "label": "ACC Y",
                "lid_hex": "5008",
                "derived_lid_hex": "",
                "var_type": "default",
                "default_input_unit": "in--default--unit",
                "default_output_unit": "out--default--unit",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 30,
                "label": "ACC Z",
                "lid_hex": "5009",
                "derived_lid_hex": "",
                "var_type": "default",
                "default_input_unit": "in--default--unit",
                "default_output_unit": "out--default--unit",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 31,
                "label": "ACC SLEEP",
                "lid_hex": "500a",
                "derived_lid_hex": "",
                "var_type": "default",
                "default_input_unit": "in--default--unit",
                "default_output_unit": "out--default--unit",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            }
        ],
        "display_widget_templates": [
            {
                "id": 19,
                "label": "Status",
                "lid_hex": "5006",
                "var_type": "default",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 20,
                "label": "X",
                "lid_hex": "5007",
                "var_type": "default",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 21,
                "label": "Y",
                "lid_hex": "5008",
                "var_type": "default",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 22,
                "label": "Z",
                "lid_hex": "5009",
                "var_type": "default",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 23,
                "label": "Sleep",
                "lid_hex": "500a",
                "var_type": "default",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 24,
                "label": "RT X",
                "lid_hex": "1012",
                "var_type": "default",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            },
            {
                "id": 25,
                "label": "RT Y",
                "lid_hex": "1013",
                "var_type": "default",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            },
            {
                "id": 26,
                "label": "RT Z",
                "lid_hex": "1014",
                "var_type": "default",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            }
        ],
        "ui_extra": {
            "mobile": {
                "controller": "defaultCtrl",
                "template": "default",
                "ioInfo": {
                    "map": {
                        "5008": {
                            "label": "Y",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "RT Y",
                                    "lid": "1013"
                                }
                            }
                        },
                        "5009": {
                            "label": "Z",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "RT Z",
                                    "lid": "1014"
                                }
                            }
                        },
                        "5007": {
                            "label": "X",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "RT X",
                                    "lid": "1012"
                                }
                            }
                        }
                    },
                    "order": [
                        "5007",
                        "5008",
                        "5009"
                    ]
                },
                "other": null
            },
            "web": {
                "pageTemplateSlug": "default"
            }
        },
        "major_version": 0,
        "minor_version": 1,
        "patch_version": 0,
        "created_on": "2017-03-28T00:15:01.377573Z"
    },
    {
        "id": 19,
        "name": "Development",
        "slug": "development-v1-0-0",
        "org": "arch-systems",
        "project_template": "default-template-v1-0-0",
        "variable_templates": [],
        "display_widget_templates": [],
        "ui_extra": {
            "mobile": {
                "controller": "defaultCtrl",
                "template": "default",
                "ioInfo": null,
                "other": null
            },
            "web": {
                "pageTemplateSlug": "proto"
            }
        },
        "major_version": 1,
        "minor_version": 0,
        "patch_version": 0,
        "created_on": "2017-06-23T05:40:38.385443Z"
    },
    {
        "id": 3,
        "name": "Double Soil Moisture",
        "slug": "double-soil-moisture-v1-0-0",
        "org": "arch-systems",
        "project_template": null,
        "variable_templates": [],
        "display_widget_templates": [],
        "ui_extra": {
            "mobile": {
                "controller": "defaultCtrl",
                "template": "default",
                "ioInfo": {
                    "map": {
                        "5001": {
                            "label": "IO 1",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings"
                        },
                        "5002": {
                            "label": "IO 2",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings"
                        }
                    },
                    "order": [
                        "5001",
                        "5002"
                    ]
                },
                "other": null
            }
        },
        "major_version": 1,
        "minor_version": 0,
        "patch_version": 0,
        "created_on": "2017-01-26T06:26:21.206491Z"
    },
    {
        "id": 7,
        "name": "Double Soil Moisture",
        "slug": "double-soil-moisture-v1-1-0",
        "org": "arch-systems",
        "project_template": "default-template-v1-0-0",
        "variable_templates": [
            {
                "id": 7,
                "label": "IO 1",
                "lid_hex": "5001",
                "derived_lid_hex": "",
                "var_type": "soil-moisture-percent",
                "default_input_unit": "in--soil-moisture-percent--percent",
                "default_output_unit": "out--soil-moisture-percent--percent",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 8,
                "label": "IO 2",
                "lid_hex": "5002",
                "derived_lid_hex": "",
                "var_type": "soil-moisture-percent",
                "default_input_unit": "in--soil-moisture-percent--percent",
                "default_output_unit": "out--soil-moisture-percent--percent",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 9,
                "label": "Sensor 1",
                "lid_hex": "100a",
                "derived_lid_hex": "",
                "var_type": "soil-moisture-percent",
                "default_input_unit": "in--soil-moisture-percent--percent",
                "default_output_unit": "out--soil-moisture-percent--percent",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            },
            {
                "id": 10,
                "label": "Sensor 2",
                "lid_hex": "100b",
                "derived_lid_hex": "",
                "var_type": "soil-moisture-percent",
                "default_input_unit": "in--soil-moisture-percent--percent",
                "default_output_unit": "out--soil-moisture-percent--percent",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            }
        ],
        "display_widget_templates": [
            {
                "id": 1,
                "label": "IO 1",
                "lid_hex": "5001",
                "var_type": "soil-moisture-percent",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 8,
                "label": "IO Realtime 1",
                "lid_hex": "100a",
                "var_type": "soil-moisture-percent",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            },
            {
                "id": 2,
                "label": "IO 2",
                "lid_hex": "5002",
                "var_type": "soil-moisture-percent",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 9,
                "label": "IO Realtime 2",
                "lid_hex": "100b",
                "var_type": "soil-moisture-percent",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            }
        ],
        "ui_extra": {
            "mobile": {
                "controller": "defaultCtrl",
                "template": "default",
                "ioInfo": {
                    "map": {
                        "5001": {
                            "label": "IO 1",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "Realtime IO 1",
                                    "lid": "100a"
                                }
                            }
                        },
                        "5002": {
                            "label": "IO 2",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "Realtime IO 2",
                                    "lid": "100b"
                                }
                            }
                        }
                    },
                    "order": [
                        "5001",
                        "5002"
                    ]
                },
                "other": null
            }
        },
        "major_version": 1,
        "minor_version": 1,
        "patch_version": 0,
        "created_on": "2017-03-17T06:27:58.682673Z"
    },
    {
        "id": 10,
        "name": "Double Soil Moisture",
        "slug": "double-soil-moisture-v2-0-0",
        "org": "arch-systems",
        "project_template": "default-template-v1-0-0",
        "variable_templates": [
            {
                "id": 19,
                "label": "IO 1",
                "lid_hex": "5003",
                "derived_lid_hex": "",
                "var_type": "soil-moisture-percent",
                "default_input_unit": "in--soil-moisture-percent--percent",
                "default_output_unit": "out--soil-moisture-percent--percent",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 20,
                "label": "IO 2",
                "lid_hex": "5004",
                "derived_lid_hex": "",
                "var_type": "soil-moisture-percent",
                "default_input_unit": "in--soil-moisture-percent--percent",
                "default_output_unit": "out--soil-moisture-percent--percent",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 21,
                "label": "Sensor 1",
                "lid_hex": "100f",
                "derived_lid_hex": "",
                "var_type": "soil-moisture-percent",
                "default_input_unit": "in--soil-moisture-percent--percent",
                "default_output_unit": "out--soil-moisture-percent--percent",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            },
            {
                "id": 22,
                "label": "Sensor 2",
                "lid_hex": "1010",
                "derived_lid_hex": "",
                "var_type": "soil-moisture-percent",
                "default_input_unit": "in--soil-moisture-percent--percent",
                "default_output_unit": "out--soil-moisture-percent--percent",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            }
        ],
        "display_widget_templates": [
            {
                "id": 11,
                "label": "IO 1",
                "lid_hex": "5003",
                "var_type": "soil-moisture-percent",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 12,
                "label": "IO Realtime 1",
                "lid_hex": "100f",
                "var_type": "soil-moisture-percent",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            },
            {
                "id": 13,
                "label": "IO 2",
                "lid_hex": "5004",
                "var_type": "soil-moisture-percent",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 14,
                "label": "IO Realtime 2",
                "lid_hex": "1010",
                "var_type": "soil-moisture-percent",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            }
        ],
        "ui_extra": {
            "mobile": {
                "controller": "defaultCtrl",
                "template": "default",
                "ioInfo": {
                    "map": {
                        "5004": {
                            "label": "IO 2",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "Realtime IO 2",
                                    "lid": "1010"
                                }
                            }
                        },
                        "5003": {
                            "label": "IO 1",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "Realtime IO 1",
                                    "lid": "100f"
                                }
                            }
                        }
                    },
                    "order": [
                        "5003",
                        "5004"
                    ]
                },
                "other": null
            },
            "web": {
                "pageTemplateSlug": "default"
            }
        },
        "major_version": 2,
        "minor_version": 0,
        "patch_version": 0,
        "created_on": "2017-03-22T02:36:28.932715Z"
    },
    {
        "id": 14,
        "name": "Dust Sensor",
        "slug": "dust-sensor-v1-0-0",
        "org": "arch-systems",
        "project_template": "default-template-v1-0-0",
        "variable_templates": [
            {
                "id": 35,
                "label": "IO 1",
                "lid_hex": "500b",
                "derived_lid_hex": "",
                "var_type": "dust-density",
                "default_input_unit": "in--dust-density--mgm3",
                "default_output_unit": "out--dust-density--mgm3",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 36,
                "label": "Fast Density 1",
                "lid_hex": "1015",
                "derived_lid_hex": "",
                "var_type": "dust-density",
                "default_input_unit": "in--dust-density--mgm3",
                "default_output_unit": "out--dust-density--mgm3",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            }
        ],
        "display_widget_templates": [
            {
                "id": 27,
                "label": "IO 1",
                "lid_hex": "500b",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 28,
                "label": "Fast Density 1",
                "lid_hex": "1015",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            }
        ],
        "ui_extra": {
            "mobile": {
                "controller": "defaultCtrl",
                "template": "default",
                "ioInfo": {
                    "map": {
                        "500b": {
                            "label": "IO 1",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "IO 1",
                                    "lid": "1015"
                                }
                            }
                        }
                    },
                    "order": [
                        "500b"
                    ]
                },
                "other": null
            },
            "web": {
                "pageTemplateSlug": "default"
            }
        },
        "major_version": 1,
        "minor_version": 0,
        "patch_version": 0,
        "created_on": "2017-04-14T06:07:18.184517Z"
    },
    {
        "id": 15,
        "name": "Dust Sensor",
        "slug": "dust-sensor-v1-1-0",
        "org": "arch-systems",
        "project_template": "default-template-v1-0-0",
        "variable_templates": [
            {
                "id": 37,
                "label": "IO 1",
                "lid_hex": "500b",
                "derived_lid_hex": "",
                "var_type": "default",
                "default_input_unit": "in--default--unit",
                "default_output_unit": "out--default--unit",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 38,
                "label": "Fast Density 1",
                "lid_hex": "1015",
                "derived_lid_hex": "",
                "var_type": "default",
                "default_input_unit": "in--default--unit",
                "default_output_unit": "out--default--unit",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            }
        ],
        "display_widget_templates": [
            {
                "id": 29,
                "label": "IO 1",
                "lid_hex": "500b",
                "var_type": "default",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 30,
                "label": "Fast Density 1",
                "lid_hex": "1015",
                "var_type": "default",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            }
        ],
        "ui_extra": {
            "mobile": {
                "controller": "defaultCtrl",
                "template": "default",
                "ioInfo": {
                    "map": {
                        "500b": {
                            "label": "IO 1",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "IO 1",
                                    "lid": "1015"
                                }
                            }
                        }
                    },
                    "order": [
                        "500b"
                    ]
                },
                "other": null
            },
            "web": {
                "pageTemplateSlug": "default"
            }
        },
        "major_version": 1,
        "minor_version": 1,
        "patch_version": 0,
        "created_on": "2017-04-30T04:55:44.092678Z"
    },
    {
        "id": 13,
        "name": "Gateway",
        "slug": "gateway-v1-0-0",
        "org": "arch-systems",
        "project_template": "default-template-v1-0-0",
        "variable_templates": [],
        "display_widget_templates": [],
        "ui_extra": {
            "mobile": {
                "controller": "gatewayCtrl",
                "template": "gateway",
                "ioInfo": null,
                "other": null
            },
            "web": {
                "pageTemplateSlug": "gateway"
            }
        },
        "major_version": 1,
        "minor_version": 0,
        "patch_version": 0,
        "created_on": "2017-03-31T00:59:23.570953Z"
    },
    {
        "id": 16,
        "name": "RedTrac ProtoPod",
        "slug": "redtrac-protopod-v1-0-0",
        "org": "arch-systems",
        "project_template": "default-template-v1-0-0",
        "variable_templates": [
            {
                "id": 39,
                "label": "IO 1",
                "lid_hex": "5001",
                "derived_lid_hex": "",
                "var_type": "water-meter-volume",
                "default_input_unit": "in--water-meter-volume--gallons",
                "default_output_unit": "out--water-meter-volume--gallons",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 40,
                "label": "IO 2",
                "lid_hex": "5005",
                "derived_lid_hex": "",
                "var_type": "420-milliamps",
                "default_input_unit": "in--420-milliamps--milliamps",
                "default_output_unit": "out--420-milliamps--milliamps",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 41,
                "label": "IO 3",
                "lid_hex": "500c",
                "derived_lid_hex": "",
                "var_type": "420-milliamps",
                "default_input_unit": "in--420-milliamps--milliamps",
                "default_output_unit": "out--420-milliamps--milliamps",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 42,
                "label": "IO 4",
                "lid_hex": "500d",
                "derived_lid_hex": "",
                "var_type": "420-milliamps",
                "default_input_unit": "in--420-milliamps--milliamps",
                "default_output_unit": "out--420-milliamps--milliamps",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 43,
                "label": "IO 5",
                "lid_hex": "500e",
                "derived_lid_hex": "",
                "var_type": "420-milliamps",
                "default_input_unit": "in--420-milliamps--milliamps",
                "default_output_unit": "out--420-milliamps--milliamps",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 44,
                "label": "Pulse 1",
                "lid_hex": "100b",
                "derived_lid_hex": "",
                "var_type": "water-meter-flow",
                "default_input_unit": "in--water-meter-flow--gallons",
                "default_output_unit": "out--water-meter-flow--gallons-per-min",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            },
            {
                "id": 45,
                "label": "RT 2",
                "lid_hex": "1011",
                "derived_lid_hex": "",
                "var_type": "420-milliamps",
                "default_input_unit": "in--420-milliamps--milliamps",
                "default_output_unit": "out--420-milliamps--milliamps",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            },
            {
                "id": 46,
                "label": "RT 3",
                "lid_hex": "1016",
                "derived_lid_hex": "",
                "var_type": "420-milliamps",
                "default_input_unit": "in--420-milliamps--milliamps",
                "default_output_unit": "out--420-milliamps--milliamps",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            },
            {
                "id": 47,
                "label": "RT 4",
                "lid_hex": "1017",
                "derived_lid_hex": "",
                "var_type": "420-milliamps",
                "default_input_unit": "in--420-milliamps--milliamps",
                "default_output_unit": "out--420-milliamps--milliamps",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            },
            {
                "id": 48,
                "label": "RT 5",
                "lid_hex": "1018",
                "derived_lid_hex": "",
                "var_type": "420-milliamps",
                "default_input_unit": "in--420-milliamps--milliamps",
                "default_output_unit": "out--420-milliamps--milliamps",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            }
        ],
        "display_widget_templates": [
            {
                "id": 31,
                "label": "IO 1",
                "lid_hex": "5001",
                "var_type": "water-meter-volume",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 32,
                "label": "IO 2",
                "lid_hex": "5005",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 33,
                "label": "IO 3",
                "lid_hex": "500c",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 34,
                "label": "IO 4",
                "lid_hex": "500d",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 35,
                "label": "IO 5",
                "lid_hex": "500e",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 36,
                "label": "RT 1",
                "lid_hex": "100b",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            },
            {
                "id": 37,
                "label": "RT 2",
                "lid_hex": "1011",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            },
            {
                "id": 38,
                "label": "RT 3",
                "lid_hex": "1016",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            },
            {
                "id": 39,
                "label": "RT 4",
                "lid_hex": "1017",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            },
            {
                "id": 40,
                "label": "RT 5",
                "lid_hex": "1018",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            }
        ],
        "ui_extra": {
            "mobile": {
                "controller": "defaultCtrl",
                "template": "default",
                "ioInfo": {
                    "map": {
                        "5001": {
                            "label": "IO 1",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "Flow 1",
                                    "lid": "100b"
                                }
                            }
                        },
                        "500d": {
                            "label": "IO 4",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "IO 4",
                                    "lid": "1017"
                                }
                            }
                        },
                        "500e": {
                            "label": "IO 5",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "IO 5",
                                    "lid": "1018"
                                }
                            }
                        },
                        "5005": {
                            "label": "IO 2",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "IO 2",
                                    "lid": "1011"
                                }
                            }
                        },
                        "500c": {
                            "label": "IO 3",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "IO 3",
                                    "lid": "1016"
                                }
                            }
                        }
                    },
                    "order": [
                        "5001",
                        "5005",
                        "500c",
                        "500d",
                        "500e"
                    ]
                },
                "other": null
            },
            "web": {
                "pageTemplateSlug": "default"
            }
        },
        "major_version": 1,
        "minor_version": 0,
        "patch_version": 0,
        "created_on": "2017-05-16T19:20:40.272561Z"
    },
    {
        "id": 21,
        "name": "Saver",
        "slug": "saver-v1-0-0",
        "org": "arch-systems",
        "project_template": "default-template-v1-0-0",
        "variable_templates": [
            {
                "id": 65,
                "label": "Accelerometer",
                "lid_hex": "5020",
                "derived_lid_hex": "",
                "var_type": "default",
                "default_input_unit": "in--default--unit",
                "default_output_unit": "out--default--unit",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": true
            },
            {
                "id": 66,
                "label": "Pressure",
                "lid_hex": "5021",
                "derived_lid_hex": "",
                "var_type": "pressure",
                "default_input_unit": "in--pressure--lansmont-saver",
                "default_output_unit": "out--pressure--millibar",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": true
            },
            {
                "id": 67,
                "label": "Relative Humidity",
                "lid_hex": "5022",
                "derived_lid_hex": "",
                "var_type": "relative-humidity",
                "default_input_unit": "in--relative-humidity--lansmont-saver",
                "default_output_unit": "out--relative-humidity--percent",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": true
            },
            {
                "id": 68,
                "label": "Temperature",
                "lid_hex": "5023",
                "derived_lid_hex": "",
                "var_type": "temp",
                "default_input_unit": "in--temp--lansmont-saver",
                "default_output_unit": "out--temp--celsius",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": true
            }
        ],
        "display_widget_templates": [
            {
                "id": 59,
                "label": "Pressure",
                "lid_hex": "5021",
                "var_type": "pressure",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 60,
                "label": "Relative Humidity",
                "lid_hex": "5022",
                "var_type": "relative-humidity",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 61,
                "label": "Temperature",
                "lid_hex": "5023",
                "var_type": "temp",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            }
        ],
        "ui_extra": {
            "mobile": {
                "controller": "defaultCtrl",
                "template": "default",
                "ioInfo": null,
                "other": null
            },
            "web": {
                "pageTemplateSlug": "shipping"
            }
        },
        "major_version": 1,
        "minor_version": 0,
        "patch_version": 0,
        "created_on": "2017-06-30T00:40:24.420694Z"
    },
    {
        "id": 5,
        "name": "Single 4-20 Sensor",
        "slug": "single-4-20-sensor-v1-0-0",
        "org": "arch-systems",
        "project_template": "default-template-v1-0-0",
        "variable_templates": [
            {
                "id": 26,
                "label": "Sensor 1",
                "lid_hex": "1011",
                "derived_lid_hex": "",
                "var_type": "420-milliamps",
                "default_input_unit": "in--420-milliamps--milliamps",
                "default_output_unit": "out--420-milliamps--milliamps",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            },
            {
                "id": 25,
                "label": "IO 1",
                "lid_hex": "5005",
                "derived_lid_hex": "",
                "var_type": "420-milliamps",
                "default_input_unit": "in--420-milliamps--milliamps",
                "default_output_unit": "out--420-milliamps--milliamps",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            }
        ],
        "display_widget_templates": [
            {
                "id": 17,
                "label": "IO 1",
                "lid_hex": "5005",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 18,
                "label": "IO Realtime 1",
                "lid_hex": "1011",
                "var_type": "420-milliamps",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            }
        ],
        "ui_extra": {
            "mobile": {
                "controller": "defaultCtrl",
                "template": "default",
                "ioInfo": {
                    "map": {
                        "5005": {
                            "label": "IO 1",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "IO 1",
                                    "lid": "1011"
                                }
                            }
                        }
                    },
                    "order": [
                        "5005"
                    ]
                },
                "other": null
            },
            "web": {
                "pageTemplateSlug": "default"
            }
        },
        "major_version": 1,
        "minor_version": 0,
        "patch_version": 0,
        "created_on": "2017-03-10T22:55:14.045385Z"
    },
    {
        "id": 2,
        "name": "Single Soil Moisture",
        "slug": "single-soil-moisture-v1-0-0",
        "org": "arch-systems",
        "project_template": null,
        "variable_templates": [],
        "display_widget_templates": [],
        "ui_extra": {
            "mobile": {
                "controller": "defaultCtrl",
                "template": "default",
                "ioInfo": {
                    "map": {
                        "5001": {
                            "label": "IO 1",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings"
                        }
                    },
                    "order": [
                        "5001"
                    ]
                },
                "other": null
            }
        },
        "major_version": 1,
        "minor_version": 0,
        "patch_version": 0,
        "created_on": "2017-01-26T06:25:58.502281Z"
    },
    {
        "id": 8,
        "name": "Single Soil Moisture",
        "slug": "single-soil-moisture-v1-1-0",
        "org": "arch-systems",
        "project_template": "default-template-v1-0-0",
        "variable_templates": [
            {
                "id": 17,
                "label": "IO 1",
                "lid_hex": "5001",
                "derived_lid_hex": "",
                "var_type": "soil-moisture-percent",
                "default_input_unit": "in--soil-moisture-percent--percent",
                "default_output_unit": "out--soil-moisture-percent--percent",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 18,
                "label": "Sensor 1",
                "lid_hex": "100a",
                "derived_lid_hex": "",
                "var_type": "soil-moisture-percent",
                "default_input_unit": "in--soil-moisture-percent--percent",
                "default_output_unit": "out--soil-moisture-percent--percent",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            }
        ],
        "display_widget_templates": [
            {
                "id": 7,
                "label": "IO 1",
                "lid_hex": "5001",
                "var_type": "soil-moisture-percent",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 10,
                "label": "IO Realtime 1",
                "lid_hex": "100a",
                "var_type": "soil-moisture-percent",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            }
        ],
        "ui_extra": {
            "mobile": {
                "controller": "defaultCtrl",
                "template": "default",
                "ioInfo": {
                    "map": {
                        "5001": {
                            "label": "IO 1",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "Realtime IO 1",
                                    "lid": "100a"
                                }
                            }
                        }
                    },
                    "order": [
                        "5001"
                    ]
                },
                "other": null
            }
        },
        "major_version": 1,
        "minor_version": 1,
        "patch_version": 0,
        "created_on": "2017-03-17T06:27:58.884875Z"
    },
    {
        "id": 11,
        "name": "Single Soil Moisture",
        "slug": "single-soil-moisture-v2-0-0",
        "org": "arch-systems",
        "project_template": "default-template-v1-0-0",
        "variable_templates": [
            {
                "id": 23,
                "label": "IO 1",
                "lid_hex": "5003",
                "derived_lid_hex": "",
                "var_type": "soil-moisture-percent",
                "default_input_unit": "in--soil-moisture-percent--percent",
                "default_output_unit": "out--soil-moisture-percent--percent",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 24,
                "label": "Sensor 1",
                "lid_hex": "100f",
                "derived_lid_hex": "",
                "var_type": "soil-moisture-percent",
                "default_input_unit": "in--soil-moisture-percent--percent",
                "default_output_unit": "out--soil-moisture-percent--percent",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            }
        ],
        "display_widget_templates": [
            {
                "id": 15,
                "label": "IO 1",
                "lid_hex": "5003",
                "var_type": "soil-moisture-percent",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 16,
                "label": "IO Realtime 1",
                "lid_hex": "100f",
                "var_type": "soil-moisture-percent",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            }
        ],
        "ui_extra": {
            "mobile": {
                "controller": "defaultCtrl",
                "template": "default",
                "ioInfo": {
                    "map": {
                        "5003": {
                            "label": "IO 1",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "Realtime IO 1",
                                    "lid": "100f"
                                }
                            }
                        }
                    },
                    "order": [
                        "5003"
                    ]
                },
                "other": null
            },
            "web": {
                "pageTemplateSlug": "default"
            }
        },
        "major_version": 2,
        "minor_version": 0,
        "patch_version": 0,
        "created_on": "2017-03-22T02:36:29.123923Z"
    },
    {
        "id": 20,
        "name": "Single Temp Sensor",
        "slug": "single-temp-sensor-v1-0-0",
        "org": "arch-systems",
        "project_template": "default-template-v1-0-0",
        "variable_templates": [
            {
                "id": 63,
                "label": "IO 1",
                "lid_hex": "500f",
                "derived_lid_hex": "",
                "var_type": "temp",
                "default_input_unit": "in--temp--lm35",
                "default_output_unit": "out--temp--celsius",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 64,
                "label": "Sensor 1",
                "lid_hex": "1019",
                "derived_lid_hex": "",
                "var_type": "temp",
                "default_input_unit": "in--temp--lm35",
                "default_output_unit": "out--temp--celsius",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            }
        ],
        "display_widget_templates": [
            {
                "id": 57,
                "label": "IO 1",
                "lid_hex": "500f",
                "var_type": "temp",
                "derived_unit_type": "",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 58,
                "label": "Sensor 1",
                "lid_hex": "1019",
                "var_type": "temp",
                "derived_unit_type": "",
                "show_in_app": true,
                "show_in_web": false
            }
        ],
        "ui_extra": {
            "mobile": {
                "controller": "defaultCtrl",
                "template": "default",
                "ioInfo": {
                    "map": {
                        "500f": {
                            "label": "IO 1",
                            "settingsController": "defaultSettingsCtrl",
                            "settingsTemplate": "default-settings",
                            "derived": {
                                "realtime": {
                                    "label": "Sensor 1",
                                    "lid": "1019"
                                }
                            }
                        }
                    },
                    "order": [
                        "500f"
                    ]
                },
                "other": null
            },
            "web": {
                "pageTemplateSlug": "default"
            }
        },
        "major_version": 1,
        "minor_version": 0,
        "patch_version": 0,
        "created_on": "2017-06-23T05:40:38.486601Z"
    },
    {
        "id": 1,
        "name": "Water Meter",
        "slug": "water-meter-v1-0-0",
        "org": "arch-systems",
        "project_template": "water-meter-permanent-v1-0-0",
        "variable_templates": [],
        "display_widget_templates": [],
        "ui_extra": {
            "mobile": {
                "controller": "waterMeterCtrl",
                "template": "water-meter",
                "ioInfo": {
                    "map": {
                        "5001": {
                            "label": "IO 1",
                            "settingsController": "waterMeterSettingsCtrl",
                            "settingsTemplate": "water-meter-settings",
                            "derived": {
                                "odometer": {
                                    "label": "Trip Computer",
                                    "lid": "100d"
                                },
                                "flow": {
                                    "label": "Flow",
                                    "lid": "100b",
                                    "type": "water-meter-flow"
                                }
                            }
                        },
                        "5002": {
                            "label": "IO 2",
                            "settingsController": "waterMeterSettingsCtrl",
                            "settingsTemplate": "water-meter-settings",
                            "derived": {
                                "odometer": {
                                    "label": "Trip Computer",
                                    "lid": "100e"
                                },
                                "flow": {
                                    "label": "Flow",
                                    "lid": "100c",
                                    "type": "water-meter-flow"
                                }
                            }
                        }
                    },
                    "order": [
                        "5001",
                        "5002"
                    ]
                },
                "other": {
                    "flowMdo": {
                        "d": 65536
                    }
                }
            }
        },
        "major_version": 1,
        "minor_version": 0,
        "patch_version": 0,
        "created_on": "2017-01-23T08:01:01.654057Z"
    },
    {
        "id": 6,
        "name": "Water Meter",
        "slug": "water-meter-v1-1-0",
        "org": "arch-systems",
        "project_template": "default-template-v1-0-0",
        "variable_templates": [
            {
                "id": 11,
                "label": "IO 1",
                "lid_hex": "5001",
                "derived_lid_hex": "",
                "var_type": "water-meter-volume",
                "default_input_unit": "in--water-meter-volume--gallons",
                "default_output_unit": "out--water-meter-volume--gallons",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 12,
                "label": "IO 2",
                "lid_hex": "5002",
                "derived_lid_hex": "",
                "var_type": "water-meter-volume",
                "default_input_unit": "in--water-meter-volume--gallons",
                "default_output_unit": "out--water-meter-volume--gallons",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": false,
                "web_only": false
            },
            {
                "id": 13,
                "label": "Pulse 1",
                "lid_hex": "100b",
                "derived_lid_hex": "",
                "var_type": "water-meter-flow",
                "default_input_unit": "in--water-meter-flow--gallons",
                "default_output_unit": "out--water-meter-flow--gallons-per-min",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            },
            {
                "id": 14,
                "label": "Pulse 2",
                "lid_hex": "100c",
                "derived_lid_hex": "",
                "var_type": "water-meter-flow",
                "default_input_unit": "in--water-meter-flow--gallons",
                "default_output_unit": "out--water-meter-flow--gallons-per-min",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            },
            {
                "id": 15,
                "label": "Odometer 1",
                "lid_hex": "100d",
                "derived_lid_hex": "",
                "var_type": "water-meter-volume",
                "default_input_unit": "in--water-meter-volume--gallons",
                "default_output_unit": "out--water-meter-volume--gallons",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            },
            {
                "id": 16,
                "label": "Odometer 2",
                "lid_hex": "100e",
                "derived_lid_hex": "",
                "var_type": "water-meter-volume",
                "default_input_unit": "in--water-meter-volume--gallons",
                "default_output_unit": "out--water-meter-volume--gallons",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "app_only": true,
                "web_only": false
            }
        ],
        "display_widget_templates": [
            {
                "id": 3,
                "label": "IO 1",
                "lid_hex": "5001",
                "var_type": "water-meter-volume",
                "derived_unit_type": "rate",
                "show_in_app": false,
                "show_in_web": true
            },
            {
                "id": 4,
                "label": "IO 2",
                "lid_hex": "5002",
                "var_type": "water-meter-volume",
                "derived_unit_type": "rate",
                "show_in_app": false,
                "show_in_web": true
            }
        ],
        "ui_extra": {
            "mobile": {
                "controller": "waterMeterCtrl",
                "template": "water-meter",
                "ioInfo": {
                    "map": {
                        "5001": {
                            "label": "IO 1",
                            "settingsController": "waterMeterSettingsCtrl",
                            "settingsTemplate": "water-meter-settings",
                            "derived": {
                                "odometer": {
                                    "label": "Trip Computer",
                                    "lid": "100d"
                                },
                                "flow": {
                                    "label": "Flow",
                                    "lid": "100b",
                                    "type": "water-meter-flow"
                                }
                            }
                        },
                        "5002": {
                            "label": "IO 2",
                            "settingsController": "waterMeterSettingsCtrl",
                            "settingsTemplate": "water-meter-settings",
                            "derived": {
                                "odometer": {
                                    "label": "Trip Computer",
                                    "lid": "100e"
                                },
                                "flow": {
                                    "label": "Flow",
                                    "lid": "100c",
                                    "type": "water-meter-flow"
                                }
                            }
                        }
                    },
                    "order": [
                        "5001",
                        "5002"
                    ]
                },
                "other": {
                    "flowMdo": {
                        "d": 65536
                    }
                }
            },
            "web": {
                "pageTemplateSlug": "water"
            }
        },
        "major_version": 1,
        "minor_version": 1,
        "patch_version": 0,
        "created_on": "2017-03-15T22:31:00.185099Z"
    }
]

var vartypes = [
    {
        "name": "420 Milliamps",
        "slug": "420-milliamps",
        "available_input_units": [
            {
                "slug": "in--420-milliamps--milliamps",
                "unit_full": "Milliamps",
                "unit_short": "mA",
                "m": 28,
                "d": 4095,
                "o": 0.0
            }
        ],
        "available_output_units": [
            {
                "slug": "out--420-milliamps--0-100-psi",
                "unit_full": "0-100 psi",
                "unit_short": "psi",
                "m": 100,
                "d": 16,
                "o": -25.0,
                "decimal_places": 0,
                "derived_units": {}
            },
            {
                "slug": "out--420-milliamps--0-200-psi",
                "unit_full": "0-200 psi",
                "unit_short": "psi",
                "m": 200,
                "d": 16,
                "o": -50.0,
                "decimal_places": 0,
                "derived_units": {}
            },
            {
                "slug": "out--420-milliamps--0-4000-gpm",
                "unit_full": "0-4000 GPM",
                "unit_short": "gpm",
                "m": 4000,
                "d": 16,
                "o": -1000.0,
                "decimal_places": 0,
                "derived_units": {}
            },
            {
                "slug": "out--420-milliamps--milliamps",
                "unit_full": "Milliamps",
                "unit_short": "mA",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "decimal_places": 1,
                "derived_units": {}
            }
        ],
        "storage_units_full": "Milliamps",
        "storage_units_short": "mA"
    },
    {
        "name": "Default",
        "slug": "default",
        "available_input_units": [
            {
                "slug": "in--default--unit",
                "unit_full": "Unit",
                "unit_short": "u",
                "m": 1,
                "d": 1,
                "o": 0.0
            }
        ],
        "available_output_units": [
            {
                "slug": "out--default--unit",
                "unit_full": "Unit",
                "unit_short": "u",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "decimal_places": 1,
                "derived_units": {}
            }
        ],
        "storage_units_full": "Unit",
        "storage_units_short": "u"
    },
    {
        "name": "Dust Density",
        "slug": "dust-density",
        "available_input_units": [
            {
                "slug": "in--dust-density--mgm3",
                "unit_full": "mg/m^3",
                "unit_short": "mg/m3",
                "m": 2000,
                "d": 14625,
                "o": -80.0
            }
        ],
        "available_output_units": [
            {
                "slug": "out--dust-density--mgm3",
                "unit_full": "mg/m^3",
                "unit_short": "mg/m3",
                "m": 1,
                "d": 1000,
                "o": 0.0,
                "decimal_places": 1,
                "derived_units": {}
            },
            {
                "slug": "out--dust-density--ugm3",
                "unit_full": "ug/m^3",
                "unit_short": "ug/m3",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "decimal_places": 1,
                "derived_units": {}
            }
        ],
        "storage_units_full": "ug/m^3",
        "storage_units_short": "ug/m3"
    },
    {
        "name": "Pressure",
        "slug": "pressure",
        "available_input_units": [
            {
                "slug": "in--pressure--lansmont-saver",
                "unit_full": "Lansmont Saver",
                "unit_short": "",
                "m": 100,
                "d": 1000000,
                "o": 0.0
            }
        ],
        "available_output_units": [
            {
                "slug": "out--pressure--millibar",
                "unit_full": "Millibar",
                "unit_short": "Mbar",
                "m": 1,
                "d": 100,
                "o": 0.0,
                "decimal_places": 4,
                "derived_units": {}
            },
            {
                "slug": "out--pressure--pascal",
                "unit_full": "Pascal",
                "unit_short": "Pa",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "decimal_places": 1,
                "derived_units": {}
            },
            {
                "slug": "out--pressure--psi",
                "unit_full": "PSI",
                "unit_short": "psi",
                "m": 145038,
                "d": 1000000000,
                "o": 0.0,
                "decimal_places": 4,
                "derived_units": {}
            }
        ],
        "storage_units_full": "Pascal",
        "storage_units_short": "Pa"
    },
    {
        "name": "Relative Humidity",
        "slug": "relative-humidity",
        "available_input_units": [
            {
                "slug": "in--relative-humidity--lansmont-saver",
                "unit_full": "Lansmont Saver",
                "unit_short": "% RH",
                "m": 1,
                "d": 1000000,
                "o": 0.0
            }
        ],
        "available_output_units": [
            {
                "slug": "out--relative-humidity--percent",
                "unit_full": "Percent",
                "unit_short": "% RH",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "decimal_places": 3,
                "derived_units": {}
            }
        ],
        "storage_units_full": "Percent RH",
        "storage_units_short": "%"
    },
    {
        "name": "Soil Moisture",
        "slug": "soil-moisture",
        "available_input_units": [
            {
                "slug": "in--soil-moisture--percent",
                "unit_full": "Percent",
                "unit_short": "%",
                "m": 1,
                "d": 1,
                "o": 0.0
            }
        ],
        "available_output_units": [
            {
                "slug": "out--soil-moisture--percent",
                "unit_full": "Percent",
                "unit_short": "%",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "decimal_places": 0,
                "derived_units": null
            }
        ],
        "storage_units_full": "Percent",
        "storage_units_short": "%"
    },
    {
        "name": "Soil Moisture Percent",
        "slug": "soil-moisture-percent",
        "available_input_units": [
            {
                "slug": "in--soil-moisture-percent--ec-5",
                "unit_full": "EC-5",
                "unit_short": "%",
                "m": 5908,
                "d": 40950,
                "o": -67.5
            },
            {
                "slug": "in--soil-moisture-percent--percent",
                "unit_full": "Percent",
                "unit_short": "%",
                "m": 100,
                "d": 4095,
                "o": 0.0
            }
        ],
        "available_output_units": [
            {
                "slug": "out--soil-moisture-percent--percent",
                "unit_full": "Percent",
                "unit_short": "%",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "decimal_places": 1,
                "derived_units": {}
            }
        ],
        "storage_units_full": "Percent",
        "storage_units_short": "%"
    },
    {
        "name": "Temp",
        "slug": "temp",
        "available_input_units": [
            {
                "slug": "in--temp--lansmont-saver",
                "unit_full": "Lansmont Saver",
                "unit_short": "C",
                "m": 1,
                "d": 1000000,
                "o": 273.15
            },
            {
                "slug": "in--temp--lm35",
                "unit_full": "LM35",
                "unit_short": "mA",
                "m": 280,
                "d": 4095,
                "o": 273.15
            },
            {
                "slug": "in--temp--tmp36",
                "unit_full": "TMP36",
                "unit_short": "mA",
                "m": 280,
                "d": 4095,
                "o": 223.15
            }
        ],
        "available_output_units": [
            {
                "slug": "out--temp--celsius",
                "unit_full": "Celsius",
                "unit_short": "C",
                "m": 1,
                "d": 1,
                "o": -273.15,
                "decimal_places": 1,
                "derived_units": {}
            },
            {
                "slug": "out--temp--fahrenheit",
                "unit_full": "Fahrenheit",
                "unit_short": "F",
                "m": 9,
                "d": 5,
                "o": -459.67,
                "decimal_places": 1,
                "derived_units": {}
            },
            {
                "slug": "out--temp--kelvin",
                "unit_full": "Kelvin",
                "unit_short": "K",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "decimal_places": 1,
                "derived_units": {}
            }
        ],
        "storage_units_full": "Kelvin",
        "storage_units_short": "K"
    },
    {
        "name": "Water Meter Flow",
        "slug": "water-meter-flow",
        "available_input_units": [
            {
                "slug": "in--water-meter-flow--acre-feet",
                "unit_full": "Acre Feet",
                "unit_short": "A.F.",
                "m": 123348185,
                "d": 6553600,
                "o": 0.0
            },
            {
                "slug": "in--water-meter-flow--cubic-meters",
                "unit_full": "Cubic Meters",
                "unit_short": "M^3",
                "m": 1000,
                "d": 65536,
                "o": 0.0
            },
            {
                "slug": "in--water-meter-flow--gallons",
                "unit_full": "Gallons",
                "unit_short": "G",
                "m": 3785,
                "d": 65536000,
                "o": 0.0
            },
            {
                "slug": "in--water-meter-flow--liters",
                "unit_full": "Liters",
                "unit_short": "L",
                "m": 1,
                "d": 65536,
                "o": 0.0
            }
        ],
        "available_output_units": [
            {
                "slug": "out--water-meter-flow--cubic-meters-per-hr",
                "unit_full": "Cubic Meters per Hr",
                "unit_short": "M^3/H",
                "m": 60,
                "d": 1000,
                "o": 0.0,
                "decimal_places": 1,
                "derived_units": {}
            },
            {
                "slug": "out--water-meter-flow--gallons-per-hr",
                "unit_full": "Gallons per Hr",
                "unit_short": "GPH",
                "m": 6000000,
                "d": 378541,
                "o": 0.0,
                "decimal_places": 1,
                "derived_units": {}
            },
            {
                "slug": "out--water-meter-flow--gallons-per-min",
                "unit_full": "Gallons per Min",
                "unit_short": "GPM",
                "m": 100000,
                "d": 378541,
                "o": 0.0,
                "decimal_places": 1,
                "derived_units": {}
            },
            {
                "slug": "out--water-meter-flow--liters-per-hr",
                "unit_full": "Liters per Hr",
                "unit_short": "LPH",
                "m": 60,
                "d": 1,
                "o": 0.0,
                "decimal_places": 1,
                "derived_units": {}
            },
            {
                "slug": "out--water-meter-flow--liters-per-min",
                "unit_full": "Liters per Min",
                "unit_short": "LPM",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "decimal_places": 1,
                "derived_units": {}
            }
        ],
        "storage_units_full": "LPM",
        "storage_units_short": "LPM"
    },
    {
        "name": "Water Meter Volume",
        "slug": "water-meter-volume",
        "available_input_units": [
            {
                "slug": "in--water-meter-volume--acre-feet",
                "unit_full": "Acre Feet",
                "unit_short": "A.F.",
                "m": 123348185,
                "d": 100,
                "o": 0.0
            },
            {
                "slug": "in--water-meter-volume--cubic-meters",
                "unit_full": "Cubic Meters",
                "unit_short": "M^3",
                "m": 1000,
                "d": 1,
                "o": 0.0
            },
            {
                "slug": "in--water-meter-volume--gallons",
                "unit_full": "Gallons",
                "unit_short": "G",
                "m": 378541,
                "d": 100000,
                "o": 0.0
            },
            {
                "slug": "in--water-meter-volume--liters",
                "unit_full": "Liters",
                "unit_short": "L",
                "m": 1,
                "d": 1,
                "o": 0.0
            }
        ],
        "available_output_units": [
            {
                "slug": "out--water-meter-volume--acre-feet",
                "unit_full": "Acre Feet",
                "unit_short": "A.F.",
                "m": 100,
                "d": 123348185,
                "o": 0.0,
                "decimal_places": 0,
                "derived_units": {}
            },
            {
                "slug": "out--water-meter-volume--cubic-meters",
                "unit_full": "Cubic Meters",
                "unit_short": "M^3",
                "m": 1,
                "d": 1000,
                "o": 0.0,
                "decimal_places": 0,
                "derived_units": {}
            },
            {
                "slug": "out--water-meter-volume--gallons",
                "unit_full": "Gallons",
                "unit_short": "G",
                "m": 100000,
                "d": 378541,
                "o": 0.0,
                "decimal_places": 0,
                "derived_units": {
                    "rate": {
                        "gph": {
                            "d": 1,
                            "m": 6
                        },
                        "gpm": {
                            "d": 10,
                            "m": 1
                        }
                    }
                }
            },
            {
                "slug": "out--water-meter-volume--liters",
                "unit_full": "Liters",
                "unit_short": "L",
                "m": 1,
                "d": 1,
                "o": 0.0,
                "decimal_places": 0,
                "derived_units": {
                    "rate": {
                        "lph": {
                            "d": 1,
                            "m": 6
                        },
                        "lpm": {
                            "d": 10,
                            "m": 1
                        }
                    }
                }
            }
        ],
        "storage_units_full": "Liter",
        "storage_units_short": "l"
    }
]

var variables = [
    {
        "id": "591c99b7-7f1c-4ec0-9d70-ebab4c6f71c4",
        "name": "Sensor 1",
        "lid": 4106,
        "var_type": "soil-moisture-percent",
        "input_unit": {
            "slug": "in--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 100,
            "d": 4095,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 1,
            "d": 1,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "derived_variable": null,
        "project": "5311e938-1150-4d40-bc66-e2319d112655",
        "org": "arch-internal",
        "about": "",
        "created_on": "2017-03-20T01:02:56.420468Z",
        "type": "N/A",
        "units": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "decimal_places": 2,
        "mdo_label": "",
        "web_only": false,
        "app_only": true,
        "slug": "v--0000-006d--100a"
    },
    {
        "id": "b6cf0971-4ff3-4c6c-b5bf-da50dd3ef4be",
        "name": "Sensor 2",
        "lid": 4107,
        "var_type": "soil-moisture-percent",
        "input_unit": {
            "slug": "in--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 100,
            "d": 4095,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 1,
            "d": 1,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "derived_variable": null,
        "project": "5311e938-1150-4d40-bc66-e2319d112655",
        "org": "arch-internal",
        "about": "",
        "created_on": "2017-03-20T01:02:56.449726Z",
        "type": "N/A",
        "units": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "decimal_places": 2,
        "mdo_label": "",
        "web_only": false,
        "app_only": true,
        "slug": "v--0000-006d--100b"
    },
    {
        "id": "31e00e27-635e-4958-9d3d-b7bf2144b3a3",
        "name": "Sensor 1",
        "lid": 4111,
        "var_type": "soil-moisture-percent",
        "input_unit": {
            "slug": "in--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 100,
            "d": 4095,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 1,
            "d": 1,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "derived_variable": null,
        "project": "5311e938-1150-4d40-bc66-e2319d112655",
        "org": "arch-internal",
        "about": "",
        "created_on": "2017-06-22T20:10:10.519755Z",
        "type": "N/A",
        "units": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "decimal_places": 2,
        "mdo_label": "",
        "web_only": false,
        "app_only": true,
        "slug": "v--0000-006d--100f"
    },
    {
        "id": "6f00abdd-9077-4e7f-9c1f-94f00974e34f",
        "name": "Sensor 2",
        "lid": 4112,
        "var_type": "soil-moisture-percent",
        "input_unit": {
            "slug": "in--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 100,
            "d": 4095,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 1,
            "d": 1,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "derived_variable": null,
        "project": "5311e938-1150-4d40-bc66-e2319d112655",
        "org": "arch-internal",
        "about": "",
        "created_on": "2017-06-22T20:10:10.552029Z",
        "type": "N/A",
        "units": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "decimal_places": 2,
        "mdo_label": "",
        "web_only": false,
        "app_only": true,
        "slug": "v--0000-006d--1010"
    },
    {
        "id": "e98f511e-bc2d-4c0e-b3f5-4550ada9703b",
        "name": "IO 1",
        "lid": 20481,
        "var_type": "soil-moisture-percent",
        "input_unit": {
            "slug": "in--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 100,
            "d": 4095,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 1,
            "d": 1,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "derived_variable": null,
        "project": "5311e938-1150-4d40-bc66-e2319d112655",
        "org": "arch-internal",
        "about": "",
        "created_on": "2017-03-20T01:02:56.353617Z",
        "type": "N/A",
        "units": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "decimal_places": 2,
        "mdo_label": "",
        "web_only": false,
        "app_only": false,
        "slug": "v--0000-006d--5001"
    },
    {
        "id": "f3bf3ea0-f2c4-4a2c-beb7-c8aa881d20c0",
        "name": "IO 2",
        "lid": 20482,
        "var_type": "soil-moisture-percent",
        "input_unit": {
            "slug": "in--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 100,
            "d": 4095,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 1,
            "d": 1,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "derived_variable": null,
        "project": "5311e938-1150-4d40-bc66-e2319d112655",
        "org": "arch-internal",
        "about": "",
        "created_on": "2017-03-20T01:02:56.394323Z",
        "type": "N/A",
        "units": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "decimal_places": 2,
        "mdo_label": "",
        "web_only": false,
        "app_only": false,
        "slug": "v--0000-006d--5002"
    },
    {
        "id": "47fff3f5-a383-48fa-9a6e-b773e8d5f9df",
        "name": "IO 1",
        "lid": 20483,
        "var_type": "soil-moisture-percent",
        "input_unit": {
            "slug": "in--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 100,
            "d": 4095,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 1,
            "d": 1,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "derived_variable": null,
        "project": "5311e938-1150-4d40-bc66-e2319d112655",
        "org": "arch-internal",
        "about": "",
        "created_on": "2017-06-22T20:10:10.594428Z",
        "type": "N/A",
        "units": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "decimal_places": 2,
        "mdo_label": "",
        "web_only": false,
        "app_only": false,
        "slug": "v--0000-006d--5003"
    },
    {
        "id": "ef505cda-01d3-42a1-ab9e-e00a3d8518b5",
        "name": "IO 2",
        "lid": 20484,
        "var_type": "soil-moisture-percent",
        "input_unit": {
            "slug": "in--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 100,
            "d": 4095,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 1,
            "d": 1,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "derived_variable": null,
        "project": "5311e938-1150-4d40-bc66-e2319d112655",
        "org": "arch-internal",
        "about": "",
        "created_on": "2017-06-22T20:10:10.633701Z",
        "type": "N/A",
        "units": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "decimal_places": 2,
        "mdo_label": "",
        "web_only": false,
        "app_only": false,
        "slug": "v--0000-006d--5004"
    },
    {
        "id": "b34508e1-d794-459f-bf45-c63e4220ec27",
        "name": "Pulse 1",
        "lid": 4107,
        "var_type": "water-meter-flow",
        "input_unit": {
            "slug": "in--water-meter-flow--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 3785,
            "d": 65536000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-flow--gallons-per-min",
            "unit_full": "Gallons per Min",
            "unit_short": "GPM",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "derived_variable": null,
        "project": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "org": "arch-internal",
        "about": "",
        "created_on": "2017-03-20T01:02:56.639439Z",
        "type": "N/A",
        "units": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "decimal_places": 2,
        "mdo_label": "",
        "web_only": false,
        "app_only": true,
        "slug": "v--0000-006e--100b"
    },
    {
        "id": "244bffa1-93a6-45ae-af07-24b853e8aeb3",
        "name": "Pulse 2",
        "lid": 4108,
        "var_type": "water-meter-flow",
        "input_unit": {
            "slug": "in--water-meter-flow--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 3785,
            "d": 65536000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-flow--gallons-per-min",
            "unit_full": "Gallons per Min",
            "unit_short": "GPM",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "derived_variable": null,
        "project": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "org": "arch-internal",
        "about": "",
        "created_on": "2017-03-20T01:02:56.666780Z",
        "type": "N/A",
        "units": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "decimal_places": 2,
        "mdo_label": "",
        "web_only": false,
        "app_only": true,
        "slug": "v--0000-006e--100c"
    },
    {
        "id": "b4131dc8-7aac-41dd-b959-08af5f71cfe6",
        "name": "Odometer 1",
        "lid": 4109,
        "var_type": "water-meter-volume",
        "input_unit": {
            "slug": "in--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 378541,
            "d": 100000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "gph": {
                        "d": 1,
                        "m": 6
                    },
                    "gpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        },
        "derived_variable": null,
        "project": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "org": "arch-internal",
        "about": "",
        "created_on": "2017-03-20T01:02:56.693612Z",
        "type": "N/A",
        "units": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "decimal_places": 2,
        "mdo_label": "",
        "web_only": false,
        "app_only": true,
        "slug": "v--0000-006e--100d"
    },
    {
        "id": "69ce6bdf-7b13-40e6-97a8-2b69b2bd3ada",
        "name": "Odometer 2",
        "lid": 4110,
        "var_type": "water-meter-volume",
        "input_unit": {
            "slug": "in--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 378541,
            "d": 100000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "gph": {
                        "d": 1,
                        "m": 6
                    },
                    "gpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        },
        "derived_variable": null,
        "project": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "org": "arch-internal",
        "about": "",
        "created_on": "2017-03-20T01:02:56.719590Z",
        "type": "N/A",
        "units": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "decimal_places": 2,
        "mdo_label": "",
        "web_only": false,
        "app_only": true,
        "slug": "v--0000-006e--100e"
    },
    {
        "id": "d8f6a0ab-c695-42d3-8e96-d56cf4b723f7",
        "name": "IO 1",
        "lid": 20481,
        "var_type": "water-meter-volume",
        "input_unit": {
            "slug": "in--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 378541,
            "d": 100000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "gph": {
                        "d": 1,
                        "m": 6
                    },
                    "gpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        },
        "derived_variable": null,
        "project": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "org": "arch-internal",
        "about": "",
        "created_on": "2017-03-20T01:02:56.573129Z",
        "type": "N/A",
        "units": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "decimal_places": 2,
        "mdo_label": "",
        "web_only": false,
        "app_only": false,
        "slug": "v--0000-006e--5001"
    },
    {
        "id": "17049870-01a4-423a-80d1-f6e38362f13a",
        "name": "IO 2",
        "lid": 20482,
        "var_type": "water-meter-volume",
        "input_unit": {
            "slug": "in--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 378541,
            "d": 100000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "gph": {
                        "d": 1,
                        "m": 6
                    },
                    "gpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        },
        "derived_variable": null,
        "project": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "org": "arch-internal",
        "about": "",
        "created_on": "2017-03-20T01:02:56.599271Z",
        "type": "N/A",
        "units": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "decimal_places": 2,
        "mdo_label": "",
        "web_only": false,
        "app_only": false,
        "slug": "v--0000-006e--5002"
    }
]

var devices = [
    {
        "id": 3,
        "slug": "d--0000-0000-0000-0003",
        "gid": "0000-0000-0000-0003",
        "label": "Double Soil Moisture",
        "active": true,
        "firmware_versions": [],
        "sg": "double-soil-moisture-v2-0-0",
        "template": "1d1p2bt103-v3-0-0",
        "org": "arch-internal",
        "project": "5311e938-1150-4d40-bc66-e2319d112655",
        "lat": null,
        "lon": null,
        "created_on": "2016-11-04T00:42:34.188367Z"
    },
    {
        "id": 4,
        "slug": "d--0000-0000-0000-0004",
        "gid": "0000-0000-0000-0004",
        "label": "Single Soil Moisture",
        "active": true,
        "firmware_versions": [],
        "sg": "single-soil-moisture-v2-0-0",
        "template": "1d1p2bt103-v3-0-0",
        "org": "arch-internal",
        "project": "5311e938-1150-4d40-bc66-e2319d112655",
        "lat": null,
        "lon": null,
        "created_on": "2016-11-04T00:42:34.197512Z"
    },
        {
        "id": 5,
        "slug": "d--0000-0000-0000-0005",
        "gid": "0000-0000-0000-0005",
        "label": "ES1 Prod Firmware, Robust Reports",
        "active": true,
        "firmware_versions": [],
        "sg": "water-meter-v1-1-0",
        "template": "1d1p2bt103-v3-0-0",
        "org": "arch-internal",
        "project": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "lat": null,
        "lon": null,
        "created_on": "2016-11-04T00:42:34.206822Z"
    },
    {
        "id": 6,
        "slug": "d--0000-0000-0000-0006",
        "gid": "0000-0000-0000-0006",
        "label": "POD1 Robust Reports",
        "active": true,
        "firmware_versions": [],
        "sg": "water-meter-v1-1-0",
        "template": "1d1p2bt103-v3-0-0",
        "org": "arch-internal",
        "project": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "lat": null,
        "lon": null,
        "created_on": "2016-11-04T00:42:34.215840Z"
    },
    {
        "id": 7,
        "slug": "d--0000-0000-0000-0007",
        "gid": "0000-0000-0000-0007",
        "label": "POD1 Old Reports",
        "active": true,
        "firmware_versions": [],
        "sg": "water-meter-v1-1-0",
        "template": "1d1p2bt103-v3-0-0",
        "org": "arch-internal",
        "project": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "lat": null,
        "lon": null,
        "created_on": "2016-11-04T00:42:34.225173Z"
    },
    {
        "id": 8,
        "slug": "d--0000-0000-0000-0008",
        "gid": "0000-0000-0000-0008",
        "label": "POD1 (Someone Always Connected)",
        "active": true,
        "firmware_versions": [],
        "sg": "water-meter-v1-1-0",
        "template": "1d1p2bt103-v3-0-0",
        "org": "arch-internal",
        "project": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "lat": null,
        "lon": null,
        "created_on": "2016-11-04T00:42:34.234169Z"
    },
    {
        "id": 9,
        "slug": "d--0000-0000-0000-0009",
        "gid": "0000-0000-0000-0009",
        "label": "Test Gateway Device (0009)",
        "active": true,
        "firmware_versions": [],
        "sg": "gateway-v1-0-0",
        "template": "internaltestingtemplate-v0-1-0",
        "org": "arch-internal",
        "project": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "lat": null,
        "lon": null,
        "created_on": "2016-11-04T00:42:34.244473Z"
    }
];

var streams = [
    {
        "id": "58d49eee-2ec0-4077-af20-0cb44072e3c8",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0005",
        "variable": "v--0000-006e--100b",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-flow--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 3785,
            "d": 65536000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-flow--gallons-per-min",
            "unit_full": "Gallons per Min",
            "unit_short": "GPM",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:56.650159Z",
        "slug": "s--0000-006e--0000-0000-0000-0005--100b",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "ac29a58c-a292-4a13-9cb7-0a7fbc54c6f6",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0005",
        "variable": "v--0000-006e--100c",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-flow--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 3785,
            "d": 65536000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-flow--gallons-per-min",
            "unit_full": "Gallons per Min",
            "unit_short": "GPM",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:56.677923Z",
        "slug": "s--0000-006e--0000-0000-0000-0005--100c",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "b56137b4-4e5a-48f9-ab91-ea800bf92ec8",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0005",
        "variable": "v--0000-006e--100d",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 378541,
            "d": 100000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "gph": {
                        "d": 1,
                        "m": 6
                    },
                    "gpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        },    
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:56.704550Z",
        "slug": "s--0000-006e--0000-0000-0000-0005--100d",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "7a9c4f7c-8139-4d39-9028-a69d7dc2194b",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0005",
        "variable": "v--0000-006e--100e",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 378541,
            "d": 100000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "gph": {
                        "d": 1,
                        "m": 6
                    },
                    "gpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        },    
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:56.738294Z",
        "slug": "s--0000-006e--0000-0000-0000-0005--100e",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "7715c416-9177-4915-b9f5-d9c7e6f50c60",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0005",
        "variable": "v--0000-006e--5001",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 378541,
            "d": 100000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "gph": {
                        "d": 1,
                        "m": 6
                    },
                    "gpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        },  
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:56.584134Z",
        "slug": "s--0000-006e--0000-0000-0000-0005--5001",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "428631fc-55a9-422b-9a89-be7eeb1c7a27",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0005",
        "variable": "v--0000-006e--5002",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 378541,
            "d": 100000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "gph": {
                        "d": 1,
                        "m": 6
                    },
                    "gpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        }, 
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:56.624146Z",
        "slug": "s--0000-006e--0000-0000-0000-0005--5002",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "82345970-303a-432e-9c5d-6a27698f2586",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0006",
        "variable": "v--0000-006e--100b",
        "data_label": "Test",
        "input_unit": {
            "slug": "in--water-meter-flow--liters",
            "unit_full": "Liters",
            "unit_short": "L",
            "m": 1,
            "d": 65536,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-flow--liters-per-min",
            "unit_full": "Liters per Min",
            "unit_short": "LPM",
            "m": 1,
            "d": 1,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },    
        "mdo_type": "S",
        "mdo_label": "UPP",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:56.813585Z",
        "slug": "s--0000-006e--0000-0000-0000-0006--100b",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "eac042ee-eba9-4457-b478-40cd3edd62db",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0006",
        "variable": "v--0000-006e--100c",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-flow--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 3785,
            "d": 65536000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-flow--gallons-per-min",
            "unit_full": "Gallons per Min",
            "unit_short": "GPM",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },      
        "mdo_type": "S",
        "mdo_label": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:56.828623Z",
        "slug": "s--0000-006e--0000-0000-0000-0006--100c",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "1e40404b-4a2b-4a5f-a3f3-0d7ddb74b499",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0006",
        "variable": "v--0000-006e--100d",
        "data_label": "Test",
        "input_unit": {
            "slug": "in--water-meter-volume--liters",
            "unit_full": "Liters",
            "unit_short": "L",
            "m": 1,
            "d": 1,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--liters",
            "unit_full": "Liters",
            "unit_short": "L",
            "m": 1,
            "d": 1,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "lph": {
                        "d": 1,
                        "m": 6
                    },
                    "lpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        },       
        "mdo_type": "S",
        "mdo_label": "UPP",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:56.858347Z",
        "slug": "s--0000-006e--0000-0000-0000-0006--100d",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "3e7e020a-a3b5-4532-a35a-e6b184867f49",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0006",
        "variable": "v--0000-006e--100e",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 378541,
            "d": 100000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "gph": {
                        "d": 1,
                        "m": 6
                    },
                    "gpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        },   
        "mdo_type": "S",
        "mdo_label": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:56.877594Z",
        "slug": "s--0000-006e--0000-0000-0000-0006--100e",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "82a0f87e-7ef3-4938-9e37-9ec2483871eb",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0006",
        "variable": "v--0000-006e--5001",
        "data_label": "Test 15",
        "input_unit": {
            "slug": "in--water-meter-volume--liters",
            "unit_full": "Liters",
            "unit_short": "L",
            "m": 1,
            "d": 1,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--liters",
            "unit_full": "Liters",
            "unit_short": "L",
            "m": 1,
            "d": 1,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "lph": {
                        "d": 1,
                        "m": 6
                    },
                    "lpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        }, 
        "mdo_type": "S",
        "mdo_label": "UPP",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:56.784000Z",
        "slug": "s--0000-006e--0000-0000-0000-0006--5001",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "6027d8e3-46ad-4308-9afe-316a7d2bdde7",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0006",
        "variable": "v--0000-006e--5002",
        "data_label": "hello label",
        "input_unit": {
            "slug": "in--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 378541,
            "d": 100000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "gph": {
                        "d": 1,
                        "m": 6
                    },
                    "gpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        },
        "mdo_type": "S",
        "mdo_label": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:56.798885Z",
        "slug": "s--0000-006e--0000-0000-0000-0006--5002",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "c79cb44b-a2df-45e0-8617-d2abfc9e5e97",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0007",
        "variable": "v--0000-006e--100b",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-flow--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 3785,
            "d": 65536000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-flow--gallons-per-min",
            "unit_full": "Gallons per Min",
            "unit_short": "GPM",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },      
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:56.949821Z",
        "slug": "s--0000-006e--0000-0000-0000-0007--100b",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "0b2f7e91-a97a-4d1e-a3d7-84af954b7f34",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0007",
        "variable": "v--0000-006e--100c",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-flow--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 3785,
            "d": 65536000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-flow--gallons-per-min",
            "unit_full": "Gallons per Min",
            "unit_short": "GPM",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:56.976302Z",
        "slug": "s--0000-006e--0000-0000-0000-0007--100c",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "7f88753f-1944-495c-8dbb-90ce57355046",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0007",
        "variable": "v--0000-006e--100d",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 378541,
            "d": 100000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "gph": {
                        "d": 1,
                        "m": 6
                    },
                    "gpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        },
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:56.992066Z",
        "slug": "s--0000-006e--0000-0000-0000-0007--100d",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "2ebddea1-5d3c-4b73-85a4-c6b7211e3647",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0007",
        "variable": "v--0000-006e--100e",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 378541,
            "d": 100000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "gph": {
                        "d": 1,
                        "m": 6
                    },
                    "gpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        },
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:57.007105Z",
        "slug": "s--0000-006e--0000-0000-0000-0007--100e",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "93e736d3-1323-4c3d-b702-3792fadc0ed3",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0007",
        "variable": "v--0000-006e--5001",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 378541,
            "d": 100000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "gph": {
                        "d": 1,
                        "m": 6
                    },
                    "gpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        },
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:56.919917Z",
        "slug": "s--0000-006e--0000-0000-0000-0007--5001",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "e04bd92f-69f9-42d1-af86-34ec86065f0c",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0007",
        "variable": "v--0000-006e--5002",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 378541,
            "d": 100000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "gph": {
                        "d": 1,
                        "m": 6
                    },
                    "gpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        },
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:56.934767Z",
        "slug": "s--0000-006e--0000-0000-0000-0007--5002",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "c7cb8291-fbd6-46df-96e0-8f50b1da385c",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0008",
        "variable": "v--0000-006e--100b",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-flow--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 3785,
            "d": 65536000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-flow--gallons-per-min",
            "unit_full": "Gallons per Min",
            "unit_short": "GPM",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:57.091345Z",
        "slug": "s--0000-006e--0000-0000-0000-0008--100b",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "8c0b04a8-2b7e-4efc-94d4-58af7c742cf2",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0008",
        "variable": "v--0000-006e--100c",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-flow--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 3785,
            "d": 65536000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-flow--gallons-per-min",
            "unit_full": "Gallons per Min",
            "unit_short": "GPM",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:57.106543Z",
        "slug": "s--0000-006e--0000-0000-0000-0008--100c",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "43dbbeeb-9889-400c-afcc-25567957157f",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0008",
        "variable": "v--0000-006e--100d",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 378541,
            "d": 100000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "gph": {
                        "d": 1,
                        "m": 6
                    },
                    "gpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        },
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:57.121673Z",
        "slug": "s--0000-006e--0000-0000-0000-0008--100d",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "b3015202-2706-4efb-9016-aea548c28e21",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0008",
        "variable": "v--0000-006e--100e",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 378541,
            "d": 100000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "gph": {
                        "d": 1,
                        "m": 6
                    },
                    "gpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        },
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:57.136677Z",
        "slug": "s--0000-006e--0000-0000-0000-0008--100e",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "e46f138b-df7d-41c8-a383-f41d74597481",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0008",
        "variable": "v--0000-006e--5001",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 378541,
            "d": 100000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "gph": {
                        "d": 1,
                        "m": 6
                    },
                    "gpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        },
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:57.049497Z",
        "slug": "s--0000-006e--0000-0000-0000-0008--5001",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "619e5ee0-1d49-414e-b8b9-81adbdaa0213",
        "project_id": "04d10130-db9e-452e-a725-5cbb1a1e1ae4",
        "project": "p--0000-006e",
        "device": "d--0000-0000-0000-0008",
        "variable": "v--0000-006e--5002",
        "data_label": "",
        "input_unit": {
            "slug": "in--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 378541,
            "d": 100000,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--water-meter-volume--gallons",
            "unit_full": "Gallons",
            "unit_short": "G",
            "m": 100000,
            "d": 378541,
            "o": 0.0,
            "decimal_places": 0,
            "derived_units": {
                "rate": {
                    "gph": {
                        "d": 1,
                        "m": 6
                    },
                    "gpm": {
                        "d": 10,
                        "m": 1
                    }
                }
            }
        },
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:57.064687Z",
        "slug": "s--0000-006e--0000-0000-0000-0008--5002",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "ac083f6a-d3e4-4f93-b1d1-88cf3204b8af",
        "project_id": "5311e938-1150-4d40-bc66-e2319d112655",
        "project": "p--0000-006d",
        "device": "d--0000-0000-0000-0003",
        "variable": "v--0000-006d--100f",
        "data_label": "test label acbc",
        "input_unit": {
            "slug": "in--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 100,
            "d": 4095,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 1,
            "d": 1,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "mdo_type": "S",
        "mdo_label": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 1.0,
        "org": "arch-internal",
        "created_on": "2017-06-22T20:10:10.534164Z",
        "slug": "s--0000-006d--0000-0000-0000-0003--100f",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "b623c2a9-43ba-4da4-9a0d-e716d5617f12",
        "project_id": "5311e938-1150-4d40-bc66-e2319d112655",
        "project": "p--0000-006d",
        "device": "d--0000-0000-0000-0003",
        "variable": "v--0000-006d--1010",
        "data_label": "hello abdd",
        "input_unit": {
            "slug": "in--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 100,
            "d": 4095,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 1,
            "d": 1,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "mdo_type": "S",
        "mdo_label": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "org": "arch-internal",
        "created_on": "2017-06-22T20:10:10.578028Z",
        "slug": "s--0000-006d--0000-0000-0000-0003--1010",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "f80a9a86-4d18-4b27-8d95-154fd67f6018",
        "project_id": "5311e938-1150-4d40-bc66-e2319d112655",
        "project": "p--0000-006d",
        "device": "d--0000-0000-0000-0003",
        "variable": "v--0000-006d--5003",
        "data_label": "test label acbc",
        "input_unit": {
            "slug": "in--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 100,
            "d": 4095,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 1,
            "d": 1,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "mdo_type": "S",
        "mdo_label": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 1.0,
        "org": "arch-internal",
        "created_on": "2017-06-22T20:10:10.606357Z",
        "slug": "s--0000-006d--0000-0000-0000-0003--5003",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "dc765527-e8dd-48b4-9ac7-d3364321009e",
        "project_id": "5311e938-1150-4d40-bc66-e2319d112655",
        "project": "p--0000-006d",
        "device": "d--0000-0000-0000-0003",
        "variable": "v--0000-006d--5004",
        "data_label": "hello abdd",
        "input_unit": {
            "slug": "in--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 100,
            "d": 4095,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 1,
            "d": 1,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "mdo_type": "S",
        "mdo_label": "",
        "multiplication_factor": 1,
        "division_factor": 1,
        "offset": 0.0,
        "org": "arch-internal",
        "created_on": "2017-06-22T20:10:10.645839Z",
        "slug": "s--0000-006d--0000-0000-0000-0003--5004",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "a6597b54-a933-427e-b36e-2c4a80f957b2",
        "project_id": "5311e938-1150-4d40-bc66-e2319d112655",
        "project": "p--0000-006d",
        "device": "d--0000-0000-0000-0004",
        "variable": "v--0000-006d--100a",
        "data_label": "",
        "input_unit": {
            "slug": "in--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 100,
            "d": 4095,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 1,
            "d": 1,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:56.530804Z",
        "slug": "s--0000-006d--0000-0000-0000-0004--100a",
        "type": "Num",
        "enabled": true
    },
    {
        "id": "622e9c8d-5dc7-416b-8df2-a39b58b90d89",
        "project_id": "5311e938-1150-4d40-bc66-e2319d112655",
        "project": "p--0000-006d",
        "device": "d--0000-0000-0000-0004",
        "variable": "v--0000-006d--5001",
        "data_label": "",
        "input_unit": {
            "slug": "in--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 100,
            "d": 4095,
            "o": 0.0
        },
        "output_unit": {
            "slug": "out--soil-moisture-percent--percent",
            "unit_full": "Percent",
            "unit_short": "%",
            "m": 1,
            "d": 1,
            "o": 0.0,
            "decimal_places": 1,
            "derived_units": {}
        },
        "mdo_type": "V",
        "mdo_label": "",
        "multiplication_factor": null,
        "division_factor": null,
        "offset": null,
        "org": "arch-internal",
        "created_on": "2017-03-20T01:02:56.515509Z",
        "slug": "s--0000-006d--0000-0000-0000-0004--5001",
        "type": "Num",
        "enabled": true
    }
]
