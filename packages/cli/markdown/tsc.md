`rehearsal tsc`
===============

bump typescript dev-dependency with compilation insights and auto-fix options

* [`rehearsal tsc`](#rehearsal-tsc)

## `rehearsal tsc`

bump typescript dev-dependency with compilation insights and auto-fix options

```
USAGE
  $ rehearsal tsc

OPTIONS
  -a, --autofix                  autofix tsc errors where available
  -b, --build=beta|next|latest   [default: beta] typescript build variant
  -d, --dry_run                  dry run. dont commit any changes. reporting only.
  -s, --src_dir=src_dir          [default: ./app] typescript source directory
  -t, --tsc_version=tsc_version  override the build variant by specifying the typescript compiler version as n.n.n

ALIASES
  $ rehearsal typescript
  $ rehearsal ts
```

_See code: [dist/src/commands/tsc.ts](https://github.com/TracerBench/tracerbench/blob/v6.1.1/dist/src/commands/tsc.ts)_
