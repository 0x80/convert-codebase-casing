# CLI Reference

## Usage

```sh
npx convert-codebase-casing <directory> [options]
```

The `<directory>` argument specifies the root folder to convert (e.g. `./src`).

## Options

| Flag              | Short | Type   | Default  | Description                    |
| ----------------- | ----- | ------ | -------- | ------------------------------ |
| `--casing <type>` | `-c`  | string | `kebab`  | Casing type: `kebab` or `snake` |
| `--log-level <level>` | `-l` | string | `info` | Log level: `error`, `warn`, `info`, or `debug` |
| `--help`          | `-h`  |        |          | Show help text                  |

## Examples

Convert to kebab-case (default):

```sh
npx convert-codebase-casing ./src
```

Convert to snake_case:

```sh
npx convert-codebase-casing ./src --casing snake
```

Enable debug logging to see detailed output:

```sh
npx convert-codebase-casing ./src --log-level debug
```
