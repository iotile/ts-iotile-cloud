export class RPCArgs {
  public addr?: number;
  public rpcId?: number | null;
  public callFmt?: string;
  public respFmt?: string;
  public args?: (string|number)[];
  public timeout?: number;

  constructor(data: any = {}){
    if (data) {
      this.addr = data.addr || null;
      this.rpcId = Number(data.rpc_id) || null;
      this.callFmt = data.call_fmt || "";
      this.respFmt = data.resp_fmt || "";
      this.args = data.args || [];
      this.timeout = data.timeout || null;
    }
  }
}

export class StatefulRPCArgs extends RPCArgs {
  public currentState: boolean;
  public transitionStates: string[];
  public auto: boolean;

  constructor(data: any = {}){
    super(data);

    this.currentState = data.cur_state || false;
    this.transitionStates = data.trans_states || [];
    this.auto = data.auto || false;
  }
}

export class StatefulSwitchArgs {
  public currentState: boolean = false;
  public transitionStates: string[] = [];
  public rpcs: RPCArgs[] = [];

  constructor(data: any = {}){
    if (data){
      for (let rpc in data.rpcs){
        this.rpcs.push(new StatefulRPCArgs(rpc));
      }

      this.currentState = data.cur_state || false;
      this.transitionStates = data.trans_states || [];
    }
  }
}

export class DisplayWidget {
  public label: string;
  public lid: string;
  public type: string;
  public args: RPCArgs | StatefulRPCArgs| StatefulSwitchArgs | null;
  public varType: string;
  public derivedType: string;
  public showInApp: boolean;
  public showInWeb: boolean;

  constructor(data: any = {}) {
    this.label = data.label;
    this.lid = data.lid_hex;
    this.type = data.type;
    this.varType = data.var_type;
    this.derivedType = data.derived_unit_type;
    this.showInApp = data.show_in_app || false;
    this.showInWeb = data.show_in_web || false;

    if (!data.args) {
      this.args = null;
    }
    else if ('auto' in data.args){
      this.args = new StatefulRPCArgs(data.args);
    } else if ('rpcs' in data.args){
      this.args = new StatefulSwitchArgs(data.args);
    } else {
      this.args = new RPCArgs(data.args);
    }
  }
}
