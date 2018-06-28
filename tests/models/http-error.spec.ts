import * as IOTileCloudModule from "ng-iotile-cloud";

describe('HttpErrorTest', () => {

  it('check Bad Request Error', () => {
    let err: IOTileCloudModule.HttpError = new IOTileCloudModule.HttpError({
    "config":
        {"transformRequest":{}, 
        "transformResponse":{},
        "xsrfCookieName":"XSRF-TOKEN",
        "xsrfHeaderName":"X-XSRF-TOKEN",
        "maxContentLength":-1,
        "headers":
          {"Accept":"application/json, text/plain, */*",
          "Authorization":"JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRhbGxpc0BhcmNoLWlvdC5jb20iLCJ1c2VyX2lkIjoyOCwiZXhwIjoxNDkwODA2MTk5LCJvcmlnX2lhdCI6MTQ5MDEyODczNCwidXNlcm5hbWUiOiJ0YWxsaXMifQ.KE62O0Ne9DjyPDlFfqihLig1WzIpigryVOisB9rLF3c"},
      "method":"patch",
      "url":"https://iotile.cloud/api/v1/stream/s--0000-0073--0000-0000-0000-00d2--5001/"},
    "request":
        {"__raven_xhr":
            {"method":"PATCH",
            "url": "https://iotile.cloud/api/v1/stream/s--0000-0073--0000-0000-0000-00d2--5001/",
            "status_code": 400,
            "data": {
              "label": "Seametrics Well Meter (00d1)",
              "lat": "35.389587",
              "lon": "-119.460091"
            }}
        },
    "response":
        {"data": 
            {"data_label":"Ensure this field has no more than 30 characters."},
          "status":400,
          "statusText":"Bad Request",
          "headers":
              {"content-type":"application/json, text/plain, */*",
              "Authorization":"JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRhbGxpc0BhcmNoLWlvdC5jb20iLCJ1c2VyX2lkIjoyOCwiZXhwIjoxNDkwODA2MTk5LCJvcmlnX2lhdCI6MTQ5MDEyODczNCwidXNlcm5hbWUiOiJ0YWxsaXMifQ.KE62O0Ne9DjyPDlFfqihLig1WzIpigryVOisB9rLF3c"},
          "config":
                {"transformRequest":{},
                "transformResponse":{},
                "xsrfCookieName":"XSRF-TOKEN",
                "xsrfHeaderName":"X-XSRF-TOKEN",
                "maxContentLength":-1,
                "headers":
                    {"Accept":"application/json, text/plain, */*",
                    "Authorization":"JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRhbGxpc0BhcmNoLWlvdC5jb20iLCJ1c2VyX2lkIjoyOCwiZXhwIjoxNDkwODA2MTk5LCJvcmlnX2lhdCI6MTQ5MDEyODczNCwidXNlcm5hbWUiOiJ0YWxsaXMifQ.KE62O0Ne9DjyPDlFfqihLig1WzIpigryVOisB9rLF3c"},
                "method":"patch",
                "url":"https://iotile.cloud/api/v1/stream/s--0000-0073--0000-0000-0000-00d2--5001/"},
                "request":
                    {"__raven_xhr": 
                        {"method":"PATCH",
                        "url":"https://iotile.cloud/api/v1/stream/s--0000-0073--0000-0000-0000-00d2--5001/",
                        "status_code":400}
                    }
                }
            });
    expect(err.status).toEqual(400);
    expect(err.shortUserErrorMsg()).toEqual('Error! ( data_label: Ensure this field has no more than 30 characters. )');
    expect(err.longUserErrorMsg()).toEqual('Error 400! Bad Request: ( data_label: Ensure this field has no more than 30 characters. )');
  });

  it('Check Timeout Error', () => {
    let raw: any = {
    "config":
        {"transformRequest":{}, 
        "transformResponse":{},
        "xsrfCookieName":"XSRF-TOKEN",
        "xsrfHeaderName":"X-XSRF-TOKEN",
        "maxContentLength":-1,
        "headers":
            {"Accept":"application/json, text/plain, */*",
            "Authorization":"JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRhbGxpc0BhcmNoLWlvdC5jb20iLCJ1c2VyX2lkIjoyOCwiZXhwIjoxNDkwODA2MTk5LCJvcmlnX2lhdCI6MTQ5MDEyODczNCwidXNlcm5hbWUiOiJ0YWxsaXMifQ.KE62O0Ne9DjyPDlFfqihLig1WzIpigryVOisB9rLF3c"},
        "method":"patch",
        "url":"https://iotile.cloud/api/v1/device/d--0000-0000-0000-00d1/"},
    "request":
          {"__raven_xhr":
              {"method":"PATCH",
              "url": "https://iotile.cloud/api/v1/device/d--0000-0000-0000-00d1/",
              "status_code": 504
              }
          },
    "response":
          { "data": {},
            "status":504,
            "statusText":"GATEWAY_TIMEOUT",
            "headers":
                {"content-type":"application/json, text/plain, */*",
                "Authorization":"JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRhbGxpc0BhcmNoLWlvdC5jb20iLCJ1c2VyX2lkIjoyOCwiZXhwIjoxNDkwODA2MTk5LCJvcmlnX2lhdCI6MTQ5MDEyODczNCwidXNlcm5hbWUiOiJ0YWxsaXMifQ.KE62O0Ne9DjyPDlFfqihLig1WzIpigryVOisB9rLF3c"},
              "config":
                  {"transformRequest":{},
                  "transformResponse":{},
                  "xsrfCookieName":"XSRF-TOKEN",
                  "xsrfHeaderName":"X-XSRF-TOKEN",
                  "maxContentLength":-1,
                  "headers":
                      {"Accept":"application/json, text/plain, */*",
                      "Authorization":"JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRhbGxpc0BhcmNoLWlvdC5jb20iLCJ1c2VyX2lkIjoyOCwiZXhwIjoxNDkwODA2MTk5LCJvcmlnX2lhdCI6MTQ5MDEyODczNCwidXNlcm5hbWUiOiJ0YWxsaXMifQ.KE62O0Ne9DjyPDlFfqihLig1WzIpigryVOisB9rLF3c"},
                  "method":"patch",
                  "url":"https://iotile.cloud/api/v1/device/d--0000-0000-0000-00d1/"},
              "request":
                  {"__raven_xhr": 
                      {"method":"PATCH",
                      "url":"https://iotile.cloud/api/v1/device/d--0000-0000-0000-00d1/",
                      "status_code":504}
                  }
              }
          };
    let err: IOTileCloudModule.HttpError = new IOTileCloudModule.HttpError(raw);
    expect(err.status).toEqual(504);
    expect(err.shortUserErrorMsg()).toEqual('Error! GATEWAY_TIMEOUT');
    expect(err.longUserErrorMsg()).toEqual('Error 504! GATEWAY_TIMEOUT');
    expect(err.extraInfo()).toEqual('Error 504! GATEWAY_TIMEOUT -> PATCH:https://iotile.cloud/api/v1/device/d--0000-0000-0000-00d1/');
  });

  it('Check Login Error', () => {
    let raw: any = {
      "config":
          {"transformRequest":{},
          "transformResponse":{},
          "timeout":30000,
          "xsrfCookieName":"XSRF-TOKEN",
          "xsrfHeaderName":"X-XSRF-TOKEN",
          "maxContentLength":-1,
          "headers":
            {"Accept":"application/json, text/plain, */*",
            "Content-Type":"application/json;charset=utf-8"},
          "method":"post",
          "url":"/proxy/api/v1/auth/api-jwt-auth/",
          "data":
            {"username": "kaylie@arch-iot.com",
            "password": "sbdfbwd"}},
      "request":
          {"__raven_xhr":
            {"method":"POST",
            "url":"/proxy/api/v1/auth/api-jwt-auth/",
            "status_code":400}
          },
      "response":
          {"data":
            {"non_field_errors":["Unable to log in with provided credentials."]},
            "status":400,
            "statusText":"Bad Request",
            "headers":
              {"allow":"POST, OPTIONS",
              "vary":"Accept,Origin,Cookie, Accept-Encoding",
              "content-type":"application/json"},
              "config":
                {"transformRequest":{},
                "transformResponse":{},
                "timeout":30000,
                "xsrfCookieName":"XSRF-TOKEN",
                "xsrfHeaderName":"X-XSRF-TOKEN",
                "maxContentLength":-1,
                "headers":
                  {"Accept":"application/json, text/plain, */*",
                  "Content-Type":"application/json;charset=utf-8"},
                "method":"post",
                "url":"/proxy/api/v1/auth/api-jwt-auth/",
                "data":
                  {"username":"kaylie@arch-iot.com",
                  "password":"sbdfbwd"}},
                "request":
                  {"__raven_xhr":
                    {"method":"POST",
                    "url":"/proxy/api/v1/auth/api-jwt-auth/",
                    "status_code":400}
                  }
                }
              };

    let err: IOTileCloudModule.HttpError = new IOTileCloudModule.HttpError(raw);
    expect(err.status).toEqual(400);
    expect(err.shortUserErrorMsg()).toEqual('Error! Unable to log in with provided credentials.');
    expect(err.longUserErrorMsg()).toEqual('Error 400! Bad Request: Unable to log in with provided credentials.');
    expect(err.extraInfo()).toEqual('Error 400! Bad Request: Unable to log in with provided credentials. -> POST:/proxy/api/v1/auth/api-jwt-auth/');
  });

  it('Check Registration Error', () => {
    let raw: any = {
      "config":
        {"transformRequest":{}, 
        "transformResponse":{},
        "xsrfCookieName":"XSRF-TOKEN",
        "xsrfHeaderName":"X-XSRF-TOKEN",
        "maxContentLength":-1,
        "headers":
          {"Accept":"application/json, text/plain, */*"},
      "method":"post",
      "url":"/proxy/api/v1/account/"},
      "request":
          {"__raven_xhr":
              {"method":"POST",
              "url": "/proxy/api/v1/account/",
              "status_code": 400}
          },
      "response":
          {"data": 
              {"detail":"Account could not be created with received data."},
              "status":400,
              "statusText":"Bad Request",
              "headers":
                {"content-type":"application/json, text/plain, */*"},
              "config":
                  {"transformRequest":{},
                  "transformResponse":{},
                  "xsrfCookieName":"XSRF-TOKEN",
                  "xsrfHeaderName":"X-XSRF-TOKEN",
                  "maxContentLength":-1,
                  "headers":
                      {"Accept":"application/json, text/plain, */*"},
                  "method":"post",
                  "url":"/proxy/api/v1/account/"},
                  "request":
                      {"__raven_xhr": 
                          {"method":"POST",
                          "url":"/proxy/api/v1/account/",
                          "status_code":400}
                      }
                  }
              };
    let err: IOTileCloudModule.HttpError = new IOTileCloudModule.HttpError(raw);
    expect(err.status).toEqual(400);
    expect(err.shortUserErrorMsg()).toEqual('Error! Account could not be created with received data.');
    expect(err.longUserErrorMsg()).toEqual('Error 400! Bad Request: Account could not be created with received data.');
    expect(err.extraInfo()).toEqual('Error 400! Bad Request: Account could not be created with received data. -> POST:/proxy/api/v1/account/');
  });

  it('Check Unknown Data Error', () => {
    let raw: any = {
       "response":
         {"data":
              {"foo":"Some Text."},
          "status":400,
          "statusText":"Bad Request"
        }
      };

    let err: IOTileCloudModule.HttpError = new IOTileCloudModule.HttpError(raw);
    expect(err.shortUserErrorMsg()).toEqual('Error! ( foo: Some Text. )');
    expect(err.longUserErrorMsg()).toEqual('Error 400! Bad Request: ( foo: Some Text. )');
    expect(err.extraInfo()).toEqual('Error 400! Bad Request: ( foo: Some Text. )');
  });

  it('Check Data as single string', () => {
    let raw: any = {
        "response":
          {"data": "No Object",
          "status":400,
          "statusText":"Bad Request"}
          };

    let err: IOTileCloudModule.HttpError = new IOTileCloudModule.HttpError(raw);
    expect(err.shortUserErrorMsg()).toEqual('Error! No Object');
    expect(err.longUserErrorMsg()).toEqual('Error 400! Bad Request: No Object');
    expect(err.extraInfo()).toEqual('Error 400! Bad Request: No Object');
  });

  it('Check Unknown Error', () => {
    let raw: any = { 'foo': 'bar' };
    let err: IOTileCloudModule.HttpError = new IOTileCloudModule.HttpError(raw);
    expect(err.status).toEqual(-1);
    expect(err.shortUserErrorMsg()).toEqual('Error! Could not reach iotile.cloud.  Check your internet connection.');
    expect(err.longUserErrorMsg()).toEqual('Error -1! Unknown Issue: Could not reach iotile.cloud.  Check your internet connection.');
    expect(err.extraInfo()).toEqual('Error -1! Unknown Issue: Could not reach iotile.cloud.  Check your internet connection. -> {"foo":"bar"}');
  });

});