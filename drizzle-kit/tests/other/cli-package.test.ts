import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { afterAll, beforeAll, expect, test } from 'vitest';

let consumer: string;

beforeAll(() => {
	consumer = mkdtempSync(resolve(tmpdir(), 'drizzle-kit-cli-package-'));
	copyFileSync(resolve('dist/bin.cjs'), resolve(consumer, 'bin.cjs'));
	mkdirSync(resolve(consumer, 'node_modules'));
	symlinkSync(resolve('../drizzle-orm/dist'), resolve(consumer, 'node_modules/drizzle-orm'));
});

afterAll(() => rmSync(consumer, { recursive: true, force: true }));

test.each([['--help'], ['--version'], ['generate', '--help']])(
	'built CLI starts without database drivers: %j',
	(...args) => {
		const result = spawnSync(process.execPath, ['bin.cjs', ...args], {
			cwd: consumer,
			encoding: 'utf8',
			env: { ...process.env, NODE_PATH: '' },
		});
		expect(result.stderr).toBe('');
		expect(result.status).toBe(0);
		expect(result.stdout).not.toBe('');
	},
);
