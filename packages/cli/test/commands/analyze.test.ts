import { test } from '@oclif/test';
import * as chai from 'chai';
import * as path from 'path';
import Analyze from '../../src/commands/analyze';

chai.use(require('chai-fs'));

const archiveFile = path.join(process.cwd() + '/trace.har');
const traceJSONOutput = path.join(process.cwd() + '/trace.json');

describe('analyze', () => {
  test
    .stdout()
    .it(
      `runs analyze --archive ${archiveFile} --traceJSONOutput ${traceJSONOutput}`,
      async ctx => {
        await Analyze.run([
          '--archive',
          archiveFile,
          '--traceJSONOutput',
          traceJSONOutput
        ]);
        chai.expect(ctx.stdout).to.contain(`Subtotal`);
      }
    );
});
