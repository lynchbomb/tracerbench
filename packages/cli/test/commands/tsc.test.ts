import { test } from "@oclif/test";
import { expect, assert } from "chai";
import execa = require("execa");
import { existsSync, readJSONSync, remove } from "fs-extra";
import { join, resolve } from "path";
import { setGracefulCleanup } from "tmp";

import type { Report } from "@rehearsal/reporter";

export const { VOLTA_HOME } = process.env as { VOLTA_HOME: string };
export const YARN_PATH = resolve(VOLTA_HOME, "bin/yarn");

import { TSC, git, getPathToBinary } from "../../src";

const FIXTURE_APP_PATH = resolve(__dirname, "../fixtures/app");
const RESULTS_FILEPATH = join(FIXTURE_APP_PATH, ".rehearsal.json");
// we need an older version of typescript that'll flag errors
let TSC_VERSION = "4.2.4";

describe("ts:command against fixture", async () => {
  const tscBinary = await getPathToBinary(YARN_PATH, "tsc");
  const { stdout } = await execa(tscBinary, ["--version"]);
  // stdout "Version N.N.N" split at the space
  TSC_VERSION = stdout.split(" ")[1];

  await execa(YARN_PATH, [
    "add",
    "-D",
    `typescript@${TSC_VERSION}`,
    "--ignore-scripts"
  ]);

  test.stdout().it("WITH autofix", async (ctx) => {
    await TSC.run([
      "--src_dir",
      FIXTURE_APP_PATH,
      "--dry_run",
      "--is_test",
      "--report_output",
      FIXTURE_APP_PATH,
      "--autofix"
    ]);

    expect(ctx.stdout).to.contain(`Rehearsing with typescript@`);
    expect(ctx.stdout).to.contain(`Running TS-Migrate Reignore`);
    expect(ctx.stdout).to.contain(`Autofix successful`);
    assert.ok(
      existsSync(RESULTS_FILEPATH),
      `result file ${RESULTS_FILEPATH} should exists`
    );
    const report: Report = readJSONSync(RESULTS_FILEPATH);
    const firstFileReportError = report.tscLog[0].errors[0];
    assert.equal(report.projectName, "foo");
    assert.equal(report.fileCount, 3);
    assert.equal(report.cumulativeErrors, 21);
    assert.equal(report.uniqueCumulativeErrors, 1);
    assert.equal(report.autofixedCumulativeErrors, 1);
    assert.equal(report.autofixedUniqueErrorList[0], "6133");
    assert.equal(report.uniqueErrorList[0], "6133");
    assert.equal(report.tscLog.length, 3);
    assert.equal(
      firstFileReportError.errorMessage,
      " @ts-expect-error ts-migrate(6133) FIXED: 'git' is declared but its value is never read."
    );
    assert.equal(
      firstFileReportError.helpMessage,
      "'string' is declared but its value is never read."
    );
    assert.equal(firstFileReportError.errorCode, "6133");
    assert.equal(firstFileReportError.isAutofixed, true);
    assert.equal(firstFileReportError.stringLocation.end, 326);
    assert.equal(firstFileReportError.stringLocation.start, 236);
  });

  await remove(join(FIXTURE_APP_PATH, ".rehearsal.json"));
  await git(
    ["restore", "package.json", "../../yarn.lock", FIXTURE_APP_PATH],
    process.cwd()
  );
  await execa(YARN_PATH, [
    "add",
    "-D",
    `typescript@~${TSC_VERSION}`,
    "--ignore-scripts"
  ]);
  setGracefulCleanup();
});
