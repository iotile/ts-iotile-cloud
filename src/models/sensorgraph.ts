import {DisplayWidget} from "./displaywidget";

export interface VariableTemplate {
  id: number,
  label: string,
  lid_hex: string,
  derived_lid_hex: string,
  var_type: string,
  default_input_unit: string,
  default_output_unit: string,
  ctype: string,
  m: number,
  d: number,
  o: number,
  app_only: boolean,
  web_only: boolean
};

export class SensorGraph {
  public id: number;
  public name: string;
  public slug: string;
  public org: string;
  public projectTemplate: any;
  public variableTemplates: Array<VariableTemplate>;
  public displayWidgetTemplates: Array<DisplayWidget>;
  public uiExtra: any;
  public version: string;
  public createdOn: string;
  public rawData: string;

  constructor(data: any = {}) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.org = data.org;
    this.projectTemplate = data.project_template;
    this.variableTemplates = data.variable_templates;
    this.uiExtra = data.ui_extra;
    this.version = data.version;
    this.createdOn = data.created_on;
    this.rawData = data;
    this.displayWidgetTemplates = [];

    if (!this.uiExtra) {
      this.uiExtra = {
        mobile: {
          controller: 'defaultCtrl',
          directory: null,
          settingsController: 'defaultSettingsCtrl',
          settingsTemplate: 'default-settings',
          template: 'default',
          settings: {
            template: "device-settings",
            controller: "DeviceSettingsCtrl"
          },
          ioInfo: null
        },
      };
    }
    if ("display_widget_templates" in data) {
      let that = this;
      data["display_widget_templates"].forEach(function (d: any) {
        let widget: DisplayWidget = new DisplayWidget(d);
        that.displayWidgetTemplates.push(widget);
      });
    }
  }

  public getUiExtra (): any {
    if (this.uiExtra && this.uiExtra.mobile) {
      return this.uiExtra.mobile;
    }
    return null;
  };

  public getIoInfo (): any {
    if (this.getUiExtra()) {
      let uiExtra: any = this.getUiExtra();
      if (uiExtra.ioInfo && uiExtra.ioInfo.order && uiExtra.ioInfo.map) {
        return uiExtra.ioInfo;
      }
    }
    return null;
  };

  public getStreamLids(): string[] {
    let ioInfo = this.getIoInfo();
    if (ioInfo == null) {
      return [];
    }

    let streams: string[] = [];

    for (let lid in ioInfo.map) {
      streams.push(lid);

      if (ioInfo.map[lid].derived) {
        let derivedStreams = ioInfo.map[lid].derived;
        for (let derivedType in derivedStreams) {
          if (derivedStreams[derivedType].lid) {
            streams.push(derivedStreams[derivedType].lid);
          }
        }
      }
    }

    return streams;
  }

  private getIoInfoParameter(lid: string, name: string): string {

    let ioInfo: any = this.getIoInfo();
    // 1. Check if there is an ioInfo.map and if so, if there is
    //    data for the given LID
    if (ioInfo) {
      if (ioInfo.map[lid][name]) {
        return ioInfo.map[lid][name];
      }
    } else {
      // 2. Look for a global value for that parameter name
      let uiExtra: any = this.getUiExtra();
      if (uiExtra[name]) {
        return uiExtra[name];
      }
    }  
    return '';
  }

  public getSettingsController(lid: string): string {

    let controller = this.getIoInfoParameter(lid, 'settingsController');
    if (controller !== '') {
      return controller;
    }
    return 'defaultSettingsCtrl';
  }

  public getSettingsTemplate(lid: string): string {

    let template = this.getIoInfoParameter(lid, 'settingsTemplate');
    if (template !== '') {
      return template;
    }
    return 'default-settings';
  }

  public toJson(): any {
    return this.rawData;
  }
}

