import { Project, Org, Stream, Streamer, Device, Variable, SensorGraph, VarType, 
    HttpError, User, ProjectTemplate, PropertyTemplate, Property, Membership } 
    from "../models";
import { startsWith, ArgumentError, BlockingEvent, UserNotLoggedInError} 
    from "iotile-common";
import {catCloud} from "../config";
let axios = require("axios");
let lodash = require('lodash');


/**
 * @ngdoc overview
 * @name iotile.cloud
 * @description
 *
 * # Introduction
 * The `iotile.cloud` module contains all services and classes needed for interacting
 * with the IOTile Cloud. It is designed to be dropped into an otherwise IOTile
 * unaware application and provide a small API that encapsulates
 * all necessary interactions with IOTile Devices.
 *
 * The main point of entry in the `iotile.cloud` module is the `IOTileCloud` service, which
 * is the only public service provided by `iotile.cloud`.
 *
 */

export interface StreamerAck {
    deviceSlug: string;
    index: number;
    highestAck: number;
}

export interface ProjectMetaData {
    name: string;
    id: string;
}

export interface OrgMetaData {
    name: string;
    slug: string;
    projects: ProjectMetaData[];
}

export interface ServerInformation {
  shortName: string,
  longName: string,
  url: string,
  default?: boolean
}
  

export class IOTileCloud {
  private Config: any;
  private _server: ServerInformation;
  private event: BlockingEvent;
  public initialized: Promise<void>;

  public inProgressConnections: number;

  constructor (Config: any) {
    this.Config = Config;

    this.inProgressConnections = 0;
    this.event = new BlockingEvent();
    this.initialized = this.event.wait();
  }

  public serverList(): ServerInformation[] {
    return this.Config.ENV.SERVER_URLS;
  }

  public defaultServer(): ServerInformation {
    for (let server of this.serverList()){
      if ("default" in server) {
        return server;
      }
    }
  }

  public isDefault(): boolean {
    return (this.server.url == this.defaultServer().url);
  }

  public set server(server: ServerInformation) {
    this._server = server;
    this.event.set();
  }

  public get server(): ServerInformation {
    if (this._server) {
      return this._server;
    } else {
      throw new ArgumentError("No Server has been set.");
    }
  }

  public Project (item) {
    return new Project(item);
  };

  public Org (item) {
    return new Org(item);
  };

  /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchProject
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches a single project from the IOTile Cloud.
   *
   * **This is an async method!**
   *
   * Returns a Project object
   *
   * @example
   * <pre>
   * // Get an array of all projects available
   * var projects = await IOTileCloud.fetchProjects();
   * console.log("Found " + projects.length + " IOTile Projects!");
   * </pre>
   *
   * @returns {Project[]} A list of the IOTile projects.
   */
  public async fetchProject(projectID: string) {
    let that = this;

    let projData = await that.fetchFromServer('/project/' + projectID + '/');
    return new Project(projData);
  }

  /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchProjects
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches all available projects from the IOTile Cloud.
   *
   * **This is an async method!**
   *
   * Returns an array of Project objects with all projects retrieved.
   *
   * @example
   * <pre>
   * // Get an array of all projects available
   * var projects = await IOTileCloud.fetchProjects();
   * console.log("Found " + projects.length + " IOTile Projects!");
   * </pre>
   *
   * @returns {Project[]} A list of the IOTile projects.
   */
  public async fetchProjects () {
    let that = this;
    return new Promise<Project[]>(function(resolve, reject) {
      that.fetchFromServer('/project/')
      .then(function (result) {
        let list: Array<Project> = [];
        lodash.forEach(result, function (item) {
          let newProject = new Project(item);
          list.push(newProject);
        });
        resolve(list);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  //Create a new org
  public async createOrg(name: string, about: string) : Promise<any> {
    let data = {
      'name': name,
      'about': about
    };

    let response = await this.postToServer('/org/', data);
    return response;
  }

  //Create a new project in an org and return the project id
  public async createProject(orgSlug: string, name: string) : Promise<string> {
    let data = {
      name: name,
      org: orgSlug
    }

    let response = await this.postToServer('/project/new/', data);
    return response['id'];
  }

  public async checkClaimable(data: any) {
    let response = await this.postToServer('/device/claimable/', data);
    return response;
  }

  //FIXME: Verify that we use the project id here and not the slug
  public async claimDevice(deviceSlug: string, projectID: string) {
    let data = {
      device: deviceSlug,
      project: projectID
    };

    await this.postToServer('/device/claim/', data);
  }

  /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchOrgs
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches all available organizations from the IOTile Cloud.
   *
   * **This is an async method!**
   *
   * Returns an array of Org objects with all organizations retrieved.
   *
   * @example
   * <pre>
   * // Get an array of all orgs available
   * var orgs = await IOTileCloud.fetchOrgs();
   * console.log("Found " + orgs.length + " IOTile Orgs!");
   * </pre>
   *
   * @returns {Org[]} A list of the IOTile organizations.
   */
  public async fetchOrgs() {
    let that = this;
    return new Promise<Org[]>(function(resolve, reject) {
      that.fetchFromServer('/org/')
      .then(function (result) {
        let list: Array<Org> = [];
        lodash.forEach(result, function (item) {
          let newOrg = new Org(item);
          list.push(newOrg);
        });
        resolve(list);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchOrgMembership
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches user membership information from a given Org
   *
   * **This is an async method!**
   *
   * Returns a Membership object: the user's membership information for the given Org
   *
   * @example
   * <pre>
   * // Get membership information for org
   * var membership = await IOTileCloud.fetchOrgMembership(org.slug);
   * </pre>
   *
   * @returns {Membership} The membership information of the User in the given Org
   */
  public async fetchOrgMembership(org: Org): Promise<Membership>{
    let that = this;
    return new Promise<Membership>(function(resolve, reject) {
      that.fetchFromServer('/org/' + org.slug + '/membership/')
      .then(function (result) {
        let membership = new Membership(result);
        resolve(membership);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchOrgList
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches a list of OrgMetaData objects with the names and ids
   * of all projects in all orgs.
   *
   * **This is an async method!**
   *
   * Returns an array of OrgMetaData objects with all organizations retrieved.
   */
  public async fetchOrgMetaData() : Promise<OrgMetaData[]>{
    let orgs = await this.fetchOrgs();
    let projects = await this.fetchProjects();

    let projectMap: {[key: string]: Project} = {};
    let orgMap : {[key: string]: OrgMetaData} = {};

    for (let project of projects) {
      projectMap[project.id] = project
    }

    for (let org of orgs) {
      orgMap[org.slug] = {
        name: org.name,
        slug: org.slug,
        projects: []
      }
    }

    for (let projectID in projectMap) {
      let project = projectMap[projectID];
      let orgSlug = project.orgSlug;

      if (!(orgSlug in orgMap)) {
        catCloud.debug(`Received a project from IOTile.cloud that did not have an org: ${project} ${orgSlug}`);
        continue;
      }

      orgMap[orgSlug].projects.push({
        name: project.name,
        id: project.id
      });
    }

    let orgList = [];
    for (let orgSlug in orgMap) {
      orgList.push(orgMap[orgSlug]);
    }

    return orgList;
  }

  /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchAllDevices
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches all available devices from the IOTile Cloud.
   *
   * **This is an async method!**
   *
   * Returns an array of Device objects with all devices retrieved.
   *
   * @example
   * <pre>
   * // Get an array of all devices available
   * var devices = await IOTileCloud.fetchAllDevices();
   * console.log("Found " + devices.length + " IOTile Devices!");
   * </pre>
   *
   * @returns {Device[]} A list of the IOTile devices.
   */
  public async fetchAllDevices() {
    let that = this;
    return new Promise<Device[]>(function(resolve, reject) {
      that.fetchFromServer('/device/?page_size=1000') //The default limit of devices returned per page is apparently 100
      .then(function (result: any) {
        let list: Array<Device> = [];
        lodash.forEach(result, function (item) {
          let newDevice = new Device(item);
          list.push(newDevice);
        });
        resolve(list);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchProjectDevices
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches all devices for a given project from the IOTile Cloud.
   *
   * **This is an async method!**
   *
   * Returns an array of Device objects with all devices retrieved.
   *
   * @example
   * <pre>
   * // Get an array of all devices available for project with ID: projId
   * var projDevices = await IOTileCloud.fetchProjectDevices(projId);
   * console.log("Found " + projDevices.length + " IOTile Devices!");
   * </pre>
   *
   * @param {string} projectId The id property of the project object that
   *                           devices will be fetched from.
   *
   * @returns {Device[]} A list of the IOTile devices.
   */
  public async fetchProjectDevices(projectId) {
    let that = this;
    return new Promise<Device[]>(function(resolve, reject) {
      that.fetchFromServer('/device/?project=' + projectId)
      .then(function (result: any) {
        let list: Array<Device> = [];
        lodash.forEach(result, function (item) {
          let newDevice = new Device(item);
          list.push(newDevice);
        });
        resolve(list);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchDevice
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches a specific device from the IOTile Cloud.
   *
   * **This is an async method!**
   *
   * Returns a Device object with the device requested.
   *
   * @example
   * <pre>
   * // Get a device object for device with slug: devSlug
   * var device = await IOTileCloud.fetchDevice(devSlug);
   * console.log("Found device with label: " + device.label);
   * </pre>
   *
   * @param {string} deviceSlug The slug property of the device that will
   *                            be fetched.
   *
   * @returns {Device} An IOTile Device.
   */
  public async fetchDevice(deviceSlug) {
    let that = this;
    return new Promise<Device>(function(resolve, reject) {
      that.fetchFromServer('/device/' + deviceSlug + '/')
      .then(function (item: any) {
        let newDevice = new Device(item);
        resolve(newDevice);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchAllStreams
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches all available streams from the IOTile Cloud.
   *
   * **This is an async method!**
   *
   * Returns an array of Stream objects with all streams retrieved.
   *
   * @example
   * <pre>
   * // Get an array of all streams available
   * var streams = await IOTileCloud.fetchAllStreams();
   * console.log("Found " + streams.length + " IOTile Streams!");
   * </pre>
   *
   * @returns {Stream[]} A list of the IOTile streams.
   */
  public async fetchAllStreams() {
    let that = this;
    return new Promise<Stream[]>(function(resolve, reject) {
      that.fetchFromServer('/stream/?page_size=3000')
      .then(function (result: any) {
        let list: Array<Stream> = [];
        lodash.forEach(result, function (item) {
          let newStream = new Stream(item);
          list.push(newStream);
        });
        resolve(list);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchProjectStreams
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches all streams for a given project from the IOTile Cloud.
   *
   * **This is an async method!**
   *
   * Returns an array of Stream objects with all streams retrieved.
   *
   * @example
   * <pre>
   * // Get an array of all streams available for project with ID: projId
   * var projStreams = await IOTileCloud.fetchProjectStreams(projId);
   * console.log("Found " + projStreams.length + " IOTile Streams!");
   * </pre>
   *
   * @param {string} projectId The id property of the project object that
   *                           streams will be fetched from.
   *
   * @returns {Stream[]} A list of the IOTile streams.
   */
  public async fetchProjectStreams(projectId) {
    let that = this;
    return new Promise<Stream[]>(function(resolve, reject) {
      that.fetchFromServer('/stream/?project=' + projectId)
      .then(function (result: any) {
        let list: Array<Stream> = [];
        lodash.forEach(result, function (item) {
          let newStream = new Stream(item);
          list.push(newStream);
        });
        resolve(list);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchStream
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches a specific stream from the IOTile Cloud.
   *
   * **This is an async method!**
   *
   * Returns a Stream object with the stream requested.
   *
   * @example
   * <pre>
   * // Get a stream object for stream with slug: streamSlug
   * var stream = await IOTileCloud.fetchStream(streamSlug);
   * console.log("Found stream with slug: " + stream.slug);
   * </pre>
   *
   * @param {string} streamSlug The slug property of the stream that will
   *                            be fetched.
   *
   * @returns {Stream} An IOTile Stream.
   */
  public async fetchStream(streamSlug) {
    let that = this;
    return new Promise<Stream>(function(resolve, reject) {
      that.fetchFromServer('/stream/' + streamSlug + '/')
      .then(function (item: any) {
        let newStream = new Stream(item);
        resolve(newStream);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchAllVariables
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches all available variables from the IOTile Cloud.
   *
   * **This is an async method!**
   *
   * Returns an array of Variable objects with all variables retrieved.
   *
   * @example
   * <pre>
   * // Get an array of all variables available
   * var variables = await IOTileCloud.fetchAllVariables();
   * console.log("Found " + variables.length + " IOTile Variables!");
   * </pre>
   *
   * @returns {Variable[]} A list of the IOTile variables.
   */
  public async fetchAllVariables() {
    let that = this;
    return new Promise<Variable[]>(function(resolve, reject) {
      that.fetchFromServer('/variable/')
      .then(function (result: any) {
        let list: Array<Variable> = [];
        lodash.forEach(result, function (item) {
          let newVariable = new Variable(item);
          list.push(newVariable);
        });
        resolve(list);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchProjectVariables
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches all variables for a given project from the IOTile Cloud.
   *
   * **This is an async method!**
   *
   * Returns an array of Variable objects with all variables retrieved.
   *
   * @example
   * <pre>
   * // Get an array of all variables available for project with ID: projId
   * var projVariables = await IOTileCloud.fetchProjectVariables(projId);
   * console.log("Found " + projVariables.length + " IOTile Variables!");
   * </pre>
   *
   * @param {string} projectId The id property of the project object that
   *                           variables will be fetched from.
   *
   * @returns {Variable[]} A list of the IOTile variables.
   */
  public async fetchProjectVariables(projectId) {
    let that = this;
    return new Promise<Variable[]>(function(resolve, reject) {
      that.fetchFromServer('/variable/?project=' + projectId)
      .then(function (result: any) {
        let list: Array<Variable> = [];
        lodash.forEach(result, function (item) {
          let newVariable = new Variable(item);
          list.push(newVariable);
        });
        resolve(list);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchVariable
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches a specific variable from the IOTile Cloud.
   *
   * **This is an async method!**
   *
   * Returns a Variable object with the variable requested.
   *
   * @example
   * <pre>
   * // Get a Variable object for variable with slug: variableSlug
   * var variable = await IOTileCloud.fetchVariable(variableSlug);
   * console.log("Found variable with slug: " + variable.slug);
   * </pre>
   *
   * @param {string} variableSlug The slug property of the variable that will
   *                            be fetched.
   *
   * @returns {Variable} An IOTile Variable.
   */
  public async fetchVariable(variableSlug) {
    let that = this;
    return new Promise<Variable>(function(resolve, reject) {
      that.fetchFromServer('/variable/' + variableSlug + '/')
      .then(function (item: any) {
        let newVariable = new Variable(item);
        resolve(newVariable);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchAllVarTypes
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches all available vartypes from the IOTile Cloud.
   *
   * **This is an async method!**
   *
   * Returns an array of VarType objects with all vartypes retrieved.
   *
   * @example
   * <pre>
   * // Get an array of all vartypes available
   * var vartypes = await IOTileCloud.fetchAllVarTypes();
   * console.log("Found " + vartypes.length + " IOTile VarTypes!");
   * </pre>
   *
   * @returns {VarType[]} A list of the IOTile vartypes.
   */
  public async fetchAllVarTypes() {
    let that = this;
    return new Promise<VarType[]>(function(resolve, reject) {
      that.fetchFromServer('/vartype/')
      .then(function (result: any) {
        let list: Array<VarType> = [];
        lodash.forEach(result, function (item) {
          let newVarType = new VarType(item);
          list.push(newVarType);
        });
        resolve(list);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchAllProjectTemplates
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches all available project templates from the IOTile Cloud.
   *
   * **This is an async method!**
   *
   * Returns an array of ProjectTemplate objects with all project templates retrieved.
   *
   * @example
   * <pre>
   * // Get an array of all project templates available
   * var project_templates = await IOTileCloud.fetchAllProjectTemplates();
   * console.log("Found " + project_templates.length + " IOTile ProjectTemplates!");
   * </pre>
   *
   * @returns {ProjectTemplate[]} A list of the IOTile project templates.
   */
  public async fetchAllProjectTemplates() {
    let that = this;
    return new Promise<ProjectTemplate[]>(function(resolve, reject) {
      that.fetchFromServer('/pt/')
      .then(function (result: any) {
        let list: Array<ProjectTemplate> = [];
        lodash.forEach(result, function (item) {
          let newProjectTemplate = new ProjectTemplate(item);
          list.push(newProjectTemplate);
        });
        resolve(list);
      }).catch(function (err) {
        reject(err);
      });
    });
  }


    /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchAllPropertyTemplates
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches all available property templates from the IOTile Cloud.
   *
   * **This is an async method!**
   *
   * Returns an array of PropertyTemplate objects with all property templates retrieved.
   *
   * @example
   * <pre>
   * // Get an array of all property templates available
   * var property_templates = await IOTileCloud.fetchAllPropertyTemplates();
   * console.log("Found " + property_templates.length + " IOTile PropertyTemplates!");
   * </pre>
   *
   * @returns {PropertyTemplate[]} A list of the IOTile property templates.
   */
  public async fetchAllPropertyTemplates() {
    let that = this;
    return new Promise<PropertyTemplate[]>(function(resolve, reject) {
      that.fetchFromServer('/propertytemplate/')
      .then(function (result: any) {
        let list: Array<PropertyTemplate> = [];
        lodash.forEach(result, function (item) {
          let newPropertyTemplate = new PropertyTemplate(item);
          list.push(newPropertyTemplate);
        });
        resolve(list);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

    /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchProperties
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches properties for a given target from the IOTile Cloud.
   *
   * **This is an async method!**
   *
   * Returns a Property object for the target requested.
   *
   * @example
   * <pre>
   * // Get the Properties for a target with slug: slug
   * var properties = await IOTileCloud.fetchProperties(slug);
   * </pre>
   *
   * @param {string} deviceSlug The slug property of the device for which
   *                              the property is associated.
   *
   * @returns {Property[]} An IOTile Property.
   */
  public async fetchProperties(deviceSlug) {
    let that = this;
    return new Promise<Property[]>(function(resolve, reject) {
      that.fetchFromServer('/property/?target=' + deviceSlug)
      .then(function (result: any) {
        let list: Array<Property> = [];
        lodash.forEach(result, function (item) {
          let newProperty = new Property(item);
          list.push(newProperty);
        });
        resolve(list);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchVarType
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches a specific variable type from the IOTile Cloud.
   *
   * **This is an async method!**
   *
   * Returns a VarType object with the variable type requested.
   *
   * @example
   * <pre>
   * // Get a VarType object for variable with slug: variableSlug
   * var vartype = await IOTileCloud.fetchVarType(variableSlug);
   * console.log("Found vartype with slug: " + vartype.slug);
   * </pre>
   *
   * @param {string} variableSlug The slug property of the variable for which
   *                              the vartype is associated.
   *
   * @returns {Variable} An IOTile Variable.
   */
  public async fetchVarType(variableSlug) {
    let that = this;
    return new Promise<VarType>(function(resolve, reject) {
      that.fetchFromServer('/variable/' + variableSlug + '/type/')
      .then(function (item: any) {
        let newVarType = new VarType(item);
        resolve(newVarType);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  public async fetchSensorGraphs() {
    let that = this;
    return new Promise<SensorGraph[]>(function(resolve, reject) {
      that.fetchFromServer('/sg/')
      .then(function (result: any) {
        let list: Array<SensorGraph> = [];
        lodash.forEach(result, function (item) {
          let newSG = new SensorGraph(item);
          list.push(newSG);
        });
        resolve(list);
      }).catch(function (err) {
        reject(err);
      });
    });
  }

  public async refreshToken(currentToken: string) : Promise<string> {
    let response = await this.postToServer('/auth/api-jwt-refresh/', {token: currentToken});
    return response['token'];
  }

  public async logout() {
    await this.postToServer('/auth/logout/', null); 
  }

  public async login(email: string, password: string) : Promise<User> {
    try {
      let response = await this.postToServer('/auth/api-jwt-auth/', {username: email, password: password});
      let user = await this.fetchUserData(response['token']);
      return user;
    } catch (err) {
      if (!(err instanceof HttpError)) {
        err = new HttpError(err);
      }

      throw err;
    }
  }

  public register(username: string, name: string, email: string, password1: string, password2: string) {
    try {
      return this.postToServer('/account/', {
        username: username,
        name: name,
        email: email,
        password: password1,
        confirm_password: password2
      });
    } catch (err) {
      if (!(err instanceof HttpError)) {
        err = new HttpError(err);
      }
      
      throw err;
    }
  }

  public async fetchUserData(token: string) : Promise<User> {
    let response = await this.fetchFromServer('/account/', {'Authorization': "JWT " + token});

    if (!response['length']) {
      throw new UserNotLoggedInError("No information for logged in user token");
    }

    let info = response[0];
    return new User(info, token);
  }

  public setToken(token: string){
    axios.defaults.headers.common['Authorization'] = token;
  }

  private async fetchFromServer(uri: string, headers?: {}) : Promise<{} | Array<{}>> {
    let request = {
      method: 'GET',
      url: this._server.url + uri,
      timeout: this.Config.ENV.HTTP_TIMEOUT
    };

    if (headers) {
      request['headers'] = headers;
    }
    catCloud.debug(`[IOTileCloud] Fetch request: ${request}`);
    let that = this;
    return new Promise<{} | Array<{}>>(function(resolve, reject) {
      that.inProgressConnections += 1;
      axios(request).then(function (response) {
        catCloud.debug(`[IOTileCloud] Response: ${response}`);
        that.inProgressConnections -= 1;
        if (response.data['results'] !== undefined) {
          resolve(response.data['results']);
        } else {
          resolve(response.data);
        }
      }, function (err) {
        that.inProgressConnections -= 1;
        reject(new HttpError(err));
      });
    });
  }

  private async postToServer(uri: string, data: {}) : Promise<{} | Array<{}>> {
    let request = {method: 'POST', 
                                      url: this._server.url + uri,
                                      timeout: this.Config.ENV.HTTP_TIMEOUT};

    if (data !== null) {
      request['data'] = data;
    }

    catCloud.debug(`[IOTileCloud] Post request: ${request}`);

    let that = this;
    return new Promise<{} | Array<{}>>(function(resolve, reject) {
      that.inProgressConnections += 1;

      axios(request).then(function (response) {
        catCloud.debug(`[IOTileCloud] Response: ${response}`);
        that.inProgressConnections -= 1;

        if (response.data['results'] !== undefined) {
          resolve(response.data['results']);
        } else {
          resolve(response.data);
        }
      }, function (err) {
        that.inProgressConnections -= 1;
        reject(new HttpError(err));
      });
    });
  }

  public async postFirmwareUpgrade(slug: string, version: string) {
    let payload = {
      firmware: version
    };

    await this.postToServer(`/device/${slug}/upgrade/`, payload);
  }

  public async postEvent(stream: string, extra_data: object){
    let payload = {
      "stream": stream,
      "timestamp": new Date(),
      //"streamer_local_id": 0,
      "extra_data": extra_data
    };
    await this.postToServer('/event/', payload);
  }

  public async postFileToNote(note_id: string, file: File){
    let url_payload = {
      "name": file.name
    };

    let resp = await this.postToServer(`/note/${note_id}/uploadurl/`, url_payload);
    if (resp){
      let formData = new FormData();
      let metaData = resp['fields'];

      for (let key in metaData){
        let value = metaData[key];
        formData.append(key, value);
      }

      formData.append('file', file, file.name);

     
      try {
        
        let s3Response = await axios({
          method: 'POST',
          url: resp['url'],
          data: formData,
          headers: {'Content-Type': undefined, 'Authorization': undefined}
        });
        
        if (s3Response.status == 204){
          await this.postToServer(`/note/${note_id}/uploadsuccess/`, {"name": file.name, "uuid": resp['uuid']});
        }
      } catch (err){
        catCloud.error(`S3 Upload failed on ${file.name}`, err);
      }
    }
  }

  public async postNote(target: string, timestamp: Date, note: string){
    let payload = {
      "target": target,
      "timestamp": timestamp || new Date(),
      "note": note
    };

    let resp = await this.postToServer('/note/', payload);
    return resp;
  }

  public async postLocation(target: string, timestamp: Date, lat: number, lon: number){
    let payload = {
      "target": target,
      "timestamp": timestamp || new Date(),
      "lat": lat,
      "lon": lon
    };

    await this.postToServer('/location/', payload);
  }

  /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#fetchStreamer
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Fetches a specific variable type from the IOTile Cloud.
   *
   * **This is an async method!**
   *
   * Returns a Streamer object with the slug requested.
   *
   * @example
   * <pre>
   * // Get a Streamer object for variable with slug: streamerSlug
   * var streamer = await IOTileCloud.fetchStreamer(streamerSlug);
   * console.log("Found streamer with slug: " + streamer.slug);
   * </pre>
   *
   * @param {string} streamerSlug The slug property of the streamer we're requesting.
   *
   * @returns {Streamer} An IOTile Streamer.
   */
  public async fetchStreamer(streamerSlug: string) {
    let that = this;

    return new Promise<Streamer>(function(resolve, reject) {
      that.fetchFromServer('/streamer/' + streamerSlug + '/')
      .then(function (item: any) {
        let newStreamer = new Streamer(item);
        resolve(newStreamer);
      }, function(err) {
        reject(err);
      });
    });
  }

  public async fetchAcknowledgements(deviceSlug?: string): Promise<StreamerAck[]> {
    let filter = "?";

    if (deviceSlug != null)
      filter = `?device=${deviceSlug}&`;
    
    filter += 'page_size=1000';
    
    let acks = <Array<any>>await this.fetchFromServer('/streamer/' + filter);

    return acks.map((val) => {return {
      deviceSlug: val['device'],
      index: val['index'],
      highestAck:val['last_id']
    }});
  }

  /**
   * @ngdoc method
   * @name iotile.cloud.service:IOTileCloud#patchStream
   * @methodOf iotile.cloud.service:IOTileCloud
   *
   * @description
   * Updates the IOTile Cloud with any changes made to a Stream object.
   *
   * **This is an async method!**
   *
   * Returns a promise that will resolve with the status of the http call.
   *
   * @example
   * <pre>
   * // Patch our changed Stream object (streamObj) up to the cloud
   * var status = await IOTileCloud.patchStream(streamObj);
   * console.log("Patched stream with status: " + status.status);
   * </pre>
   *
   * @param {Stream} streamObj The stream object that has been updated.
   *
   * @returns {Promise} A promise that will resolve with the http status.
   */
  public async patchModel(slug: string, patchPayload: {}) {
    let that = this;
    let modelType = null;

    if (startsWith(slug, 's--')) {
      modelType = '/stream/';
    } else if (startsWith(slug, 'd--')) {
      modelType = '/device/';
    } else {
      throw new ArgumentError("Unknown slug type in patchModel: " + slug);
    }

    let payload = {
      url: this._server.url + modelType + slug + '/',
      method: 'PATCH',
      data: patchPayload,
      timeout: this.Config.ENV.HTTP_TIMEOUT
    };

    return new Promise<any>(function(resolve, reject) {
      that.inProgressConnections += 1;
      axios(payload).then(function (result) {
        that.inProgressConnections -= 1;
        resolve(result);
      }, function (err) {
        that.inProgressConnections -= 1;
        reject(new HttpError(err));
      });
    });
  }
}

