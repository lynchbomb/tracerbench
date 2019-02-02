tracerbench-cli
===============

tracerbench-cli

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/tracerbench-cli.svg)](https://npmjs.org/package/tracerbench-cli)
[![Downloads/week](https://img.shields.io/npm/dw/tracerbench-cli.svg)](https://npmjs.org/package/tracerbench-cli)
[![License](https://img.shields.io/npm/l/tracerbench-cli.svg)](https://github.com/TracerBench/tracerbench/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g tracerbench-cli
$ tracerbench COMMAND
running command...
$ tracerbench (-v|--version|version)
tracerbench-cli/0.0.0 darwin-x64 node-v8.14.0
$ tracerbench --help [COMMAND]
USAGE
  $ tracerbench COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`tracerbench analyze`](#tracerbench-analyze)
* [`tracerbench create-archive`](#tracerbench-create-archive)
* [`tracerbench help [COMMAND]`](#tracerbench-help-command)
* [`tracerbench trace`](#tracerbench-trace)

## `tracerbench analyze`

Parses a CPU profile and aggregates time across heuristics. Can be vertically sliced with event names.

```
USAGE
  $ tracerbench analyze

OPTIONS
  -a, --archive=archive  (required) Path to archive file
  -e, --event=event      Slice time and see the events before and after the time slice
  -f, --file=file        (required) Path to trace json file
  -m, --methods=methods  (required) [default: ""] List of methods to aggregate

  -r, --report=report    Directory path to generate a report with aggregated sums for each heuristic category and
                         aggregated sum across all heuristics
```

## `tracerbench create-archive`

Creates an automated archive file from a URL.

```
USAGE
  $ tracerbench create-archive

OPTIONS
  -o, --output=output  (required) [default: ./trace.archive] the output filepath/name to save the archive to
  -u, --url=url        (required) url to visit to produce the archive file
```

## `tracerbench help [COMMAND]`

display help for tracerbench

```
USAGE
  $ tracerbench help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.4/src/commands/help.ts)_

## `tracerbench trace`

Creates an automated trace that's saved to JSON. Also takes network conditioner and CPU throttling options.

```
USAGE
  $ tracerbench trace

OPTIONS
  -c, --cpu=cpu          (required) [default: 1] cpu throttle multiplier
  -h, --har=har          (required) filepath to the HAR file

  -n, --network=network  simulated network conditions for: none, offline, dialup, 2g, edge, slow-3g, em-3g, dsl, 3g,
                         fast-3g, 4g, cable, LTE, FIOS

  -o, --output=output    (required) [default: trace.json] the output filepath/name to save the trace to

  -u, --url=url          (required) url to visit
```
<!-- commandsstop -->