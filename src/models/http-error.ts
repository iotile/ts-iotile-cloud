export interface FieldDictionary {
  [index: string]: string;
}

export class HttpError {
  private fieldErrors: FieldDictionary;
  private nonFieldErrors: Array<string>;
  public status: number;
  private statusText: string;
  private method?: string;
  private url?: string;
  private raw: any;

  constructor(resp: any) {
    this.raw = resp;

    let data = resp.response || resp;

    this.status = data.status || -1;
    this.statusText = data.statusText || 'Unknown Issue';
    this.nonFieldErrors = [];
    this.fieldErrors = {};

    if (data.data && (typeof data.data === "object")) {
      let fieldNames: Array<string> = Object.keys(data.data);
      fieldNames.forEach(name => {
        if (name === 'status') {
          // Ignore
        } else if (name === 'message' || name === 'detail') {
          this.nonFieldErrors.push(data.data[name]);
        } else if (name === 'non_field_errors') {
          let that = this;
          data.data[name].forEach(function (err: any) {
            if (!that.nonFieldErrors) { that.nonFieldErrors = []; }
            that.nonFieldErrors.push(err);
          });
        } else {
          let msg: string = '';
          if (data.data[name] instanceof Array) {
            data.data[name].forEach( function (err: any){
              msg += err;
            });
          } else {
            // It seems like in some cases, data.response shows arrays and in some cases, strings
            msg += data.data[name];
          }
          this.fieldErrors[name] = msg;
        }
      });
    } else if ((typeof data.data === "string") && data.data !== '') {          
        this.heuristicallyParseErrorData(data.data);
    } else if (this.status == -1) {
      this.nonFieldErrors.push("Could not reach iotile.cloud.  Check your internet connection.");
    }

    if (resp.config) {
      if (resp.config.method) {
        this.method = resp.config.method.toUpperCase();
      }
      if (resp.config.url) {
        this.url = resp.config.url;
      }
    }
  }

  /*
    * Do our best to extract a meaningful error message from a string message thrown
    * by some deep part of the network stack.
    */
  private heuristicallyParseErrorData(data: string) {
    if (data.indexOf('ENOTFOUND') !== -1) {
      this.nonFieldErrors.push("Could not reach iotile.cloud.  Check your internet connection.");
    } else {
      this.nonFieldErrors.push(data);
    }
  }

  private _formatFieldErrors(): string {
    let msg: string = '';
    if (this.nonFieldErrors && this.nonFieldErrors.length) {
      this.nonFieldErrors.forEach(err => {
        msg += ' ' + err;
      });
    } else {
      if (Object.keys(this.fieldErrors).length > 0) {
        msg += ' (';
        let fieldNames: Array<string> = Object.keys(this.fieldErrors);
        fieldNames.forEach(name => {
          msg += ' ' + name + ': ' + this.fieldErrors[name];
        });
        msg += ' )';
      }
    }
    return msg;
  }

  public shortUserErrorMsg(): string {
    let msg: string = 'Error!';

    let fieldErrors: string = this._formatFieldErrors();

    if (fieldErrors) {
      msg += fieldErrors;
    } else {
      // If no field or non-field errors were found, still give generic error
      msg += ' ' + this.statusText;
    }

    return msg;
  }

  public longUserErrorMsg(): string {
    let msg: string = 'Error ' + this.status + '! ';

    msg += this.statusText;
    let fieldErrors: string = this._formatFieldErrors();

    if (fieldErrors) {
      msg += ':' + fieldErrors;
    }

    return msg;
  }

  public extraInfo(): string {
    let msg: string = this.longUserErrorMsg();

    if (this.method && this.url) {
      msg += ' -> ' + this.method + ':' + this.url;
    } else {
      if (this.status === -1) {
        msg += ' -> ' + JSON.stringify(this.raw);
      }
    }

    return msg;
  }

  public get message(): string {
    return this.shortUserErrorMsg();
  }

  public get userMessage(): string {
    return this.shortUserErrorMsg();
  }
}
