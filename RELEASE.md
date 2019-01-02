# Release Notes for @iotile/iotile-cloud

## v0.0.13

- Move to use `typescript-logging` for all logging.
- Reduce the chattiness of log messages by moving detailed logging of all
  requests and responses to trace level that is disabled by default but
  can be enabled at runtime using the `typescript-logging` control control
  API.
- Move to using the `@iotile/iotile-common` v0.0.12 rather than the old
  `iotile-common` package.
