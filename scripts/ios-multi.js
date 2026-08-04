const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawn, spawnSync } = require('child_process');

/**
 * PROJECT_ROOT is the app folder.
 * PORT is where Metro runs.
 * PACKAGER_HOST is the Mac address used by the simulators.
 * PHONE_NAMES is the list of simulators we want.
 */
const PROJECT_ROOT = path.resolve(path.dirname(process.argv[1]), '..');
const PORT = process.env.EXPO_PORT || '8081';
const PACKAGER_HOST = '127.0.0.1';

/**
 * ANSI
 */
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';
const RESET = '\x1b[0m';
const CLEAR_LINE = '\r\x1b[2K';

const PHONE_NAMES = [
	'iPhone SE (3rd generation)',
	'iPhone 17 Pro',
	'iPhone 17 Pro Max',
];

const PROGRESS_STEPS = [
	'Find phones',
	'Boot phones',
	'Expo Go',
	'Start Metro',
	'Open app',
];

/**
 * Sleep
 */
function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Show every step on one colored line.
 * Green is done, cyan is working, and gray is waiting.
 */
function showProgress(currentStep) {
	let line = '';
	let color = '';
	let icon = '';

	for (let index = 0; index < PROGRESS_STEPS.length; index++) {
		switch (true) {
			case index < currentStep:
				color = GREEN;
				icon = '●';
				break;

			case index === currentStep:
				color = CYAN;
				icon = '●';
				break;

			default:
				color = GRAY;
				icon = '○';
		}

		line += `${color}${icon} ${PROGRESS_STEPS[index]}${RESET}`;

		if (index < PROGRESS_STEPS.length - 1) {
			line += `${GRAY} ━ ${RESET}`;
		}
	}

	process.stdout.write(`${CLEAR_LINE}${line}`);
}

/**
 * Mark every step done and move to a new line.
 */
function finishProgress() {
	showProgress(PROGRESS_STEPS.length);
	process.stdout.write('\n');
}

/**
 * Make sure the port is a number.
 * A bad port cannot start Metro
 */
function checkPort() {
	if (!/^\d+$/.test(PORT)) {
		throw new Error('EXPO_PORT must be a number.');
	}
}

/**
 * Compare names that contain version numbers.
 * Numeric sorting makes 10 come after 9.
 */
function compareVersions(left, right) {
	return left.localeCompare(right, undefined, { numeric: true });
}

/**
 * Ask Xcode for every available simulator.
 * Find each phone in PHONE_NAMES.
 * If a phone exists in more than one iOS version, use the newest one.
 * Return each phone name with its simulator ID.
 */
function findSimulators() {
	let simulatorJSON = '';
	let deviceTuples = [];
	let simulators = [];
	let newestPhone = null;
	let newestRuntime = '';
	let phone = null;
	let phoneIsNewer = false;

	simulatorJSON = execFileSync(
		'xcrun',
		['simctl', 'list', 'devices', 'available', '-j'],
		{ encoding: 'utf8' },
	);

	deviceTuples = Object.entries(JSON.parse(simulatorJSON).devices);

	for (const phoneName of PHONE_NAMES) {
		newestPhone = null;
		newestRuntime = '';

		for (const [runtime, phones] of deviceTuples) {
			phone = phones.find(item => item.name === phoneName);
			phoneIsNewer = compareVersions(runtime, newestRuntime) > 0;

			if (phone && phoneIsNewer) {
				newestPhone = phone;
				newestRuntime = runtime;
			}
		}

		if (!newestPhone) {
			throw new Error(`No available simulator named "${phoneName}" was found.`);
		}

		simulators.push({
			name: newestPhone.name,
			id: newestPhone.udid,
		});
	}

	return simulators;
}

/**
 * Start every simulator we found.
 * Trying to boot an awake simulator reports an error, so ignore that.
 */
function bootSimulators(simulators) {
	for (const simulator of simulators) {
		spawnSync('xcrun', ['simctl', 'boot', simulator.id], {
			stdio: 'ignore',
		});

		execFileSync('xcrun', ['simctl', 'bootstatus', simulator.id, '-b'], {
			stdio: 'ignore',
		});
	}
}

/**
 * Show Apple's Simulator app.
 * The phones are already booting before this window opens.
 */
function openSimulatorApp() {
	execFileSync('open', ['-a', 'Simulator']);
}

/**
 * Read the Expo version from package.json
 * Look in Expo's cache for matching copies of Expo Go (there might be more than one)
 * Sort them and return the newest copy
 */
function findExpoGo() {
	let packageJson = {};
	let expoMajor = '';
	let expoHome = '';
	let expoCache = '';
	let expoGoStart = '';
	let expoGoNames = [];
	let expoGoName = '';

	packageJson = require(path.join(PROJECT_ROOT, 'package.json'));
	expoMajor = packageJson.dependencies.expo.match(/\d+/)[0];
	expoHome = process.env.EXPO_HOME || path.join(os.homedir(), '.expo');
	expoCache = path.join(expoHome, 'ios-simulator-app-cache');
	expoGoStart = `Expo-Go-${expoMajor}.`;

	expoGoNames =
		fs.existsSync(expoCache) ?
			fs.readdirSync(expoCache).filter(name => {
				return (
					name.startsWith(expoGoStart) &&
					name.endsWith('.app') &&
					fs.statSync(path.join(expoCache, name)).isDirectory()
				);
			})
		:	[];

	expoGoNames.sort(compareVersions);
	expoGoName = expoGoNames.at(-1);

	if (!expoGoName) {
		throw new Error(
			`No Expo Go app was found for Expo ${expoMajor}.\n` +
				'Run npm run ios once. Then run npm run ios:multi again.',
		);
	}

	return path.join(expoCache, expoGoName);
}

/**
 * Check the Expo Go copy on every simulator.
 * Do nothing when the correct copy is already installed.
 * Install or update it when the copies do not match.
 */
function installExpoGo(simulators, expoGo) {
	let expoGoName = '';
	let installedExpoGo = '';

	expoGoName = path.basename(expoGo);

	for (const simulator of simulators) {
		installedExpoGo = spawnSync(
			'xcrun',
			['simctl', 'get_app_container', simulator.id, 'host.exp.Exponent', 'app'],
			{ encoding: 'utf8' },
		).stdout.trim();

		if (path.basename(installedExpoGo) === expoGoName) {
			continue;
		}

		execFileSync('xcrun', ['simctl', 'install', simulator.id, expoGo], {
			stdio: 'ignore',
		});
	}
}

/**
 * Start Expo's Metro server.
 * Return the running Metro process so other steps can watch it.
 */
function startMetro() {
	let nodeOptions = '';
	let metroEnvironment = {};

	nodeOptions =
		`${process.env.NODE_OPTIONS || ''} --dns-result-order=ipv4first`.trim();
	metroEnvironment = { ...process.env, NODE_OPTIONS: nodeOptions };

	if ('FORCE_COLOR' in metroEnvironment) {
		delete metroEnvironment.NO_COLOR;
	}

	return spawn(
		'npx',
		['expo', 'start', '--go', '--localhost', '--port', PORT],
		{
			cwd: PROJECT_ROOT,
			env: metroEnvironment,
			stdio: 'inherit',
		},
	);
}

/**
 * Create a promise for the Metro process.
 * It finishes when Metro stops (method .once listens for the emitter)
 */
function watchMetro(metro) {
	return new Promise((resolve, reject) => {
		metro.once('error', reject);
		metro.once('exit', resolve);
	});
}

/**
 * Listen for the user stopping this script.
 * When this script stops, stop Metro too.
 */
function stopMetroWhenAsked(metro) {
	process.once('SIGINT', () => metro.kill('SIGINT'));
	process.once('SIGTERM', () => metro.kill('SIGTERM'));
}

/**
 * Metro needs a moment to become ready.
 * Check it twice a second for up to one minute.
 * When it is ready, open this project on every simulator.
 */
async function openAppWhenMetroStarts(simulators, metro) {
	let metroStopped = false;
	let response = null;
	let status = '';
	let metroReady = false;
	let openResult = null;
	let appOpened = false;

	for (let attempt = 0; attempt < 100; attempt++) {
		metroStopped = metro.exitCode !== null || metro.signalCode !== null;

		if (metroStopped) return;

		try {
			response = await fetch(`http://${PACKAGER_HOST}:${PORT}/status`);
			status = await response.text();
			metroReady = response.ok && status.includes('packager-status:running');

			if (metroReady) {
				showProgress(4);
				process.stdout.write('\n');

				for (const simulator of simulators) {
					appOpened = false;

					for (let openAttempt = 0; openAttempt < 5; openAttempt++) {
						openResult = spawnSync(
							'xcrun',
							[
								'simctl',
								'openurl',
								simulator.id,
								`exp://${PACKAGER_HOST}:${PORT}`,
							],
							{ stdio: 'ignore' },
						);

						if (openResult.status === 0) {
							appOpened = true;
							break;
						}

						await sleep(500);
					}

					if (!appOpened) {
						throw new Error(`Could not open the app on ${simulator.name}.`);
					}
				}

				finishProgress();
				return;
			}
		} catch {
			// Metro is still starting. Try again.
		}

		await sleep(500);
	}

	metro.kill('SIGTERM');
	throw new Error(`Metro did not start on port ${PORT}.`);
}

/**
 * Keep this script alive while Metro is alive.
 * If Metro exits with an error, use the same error code.
 */
async function finishWithMetro(metroDone) {
	const exitCode = await metroDone;

	if (exitCode) {
		process.exitCode = exitCode;
	}
}

/**
 * Run the steps in order.
 * First prepare the simulators and Expo Go.
 * Then start Metro and open the app.
 * Finally, stay alive until Metro stops.
 */
async function main() {
	let simulators = [];
	let expoGo = '';
	let metro = null;
	let metroDone = null;

	checkPort();

	showProgress(0);
	simulators = findSimulators();

	showProgress(1);
	bootSimulators(simulators);
	openSimulatorApp();

	showProgress(2);
	expoGo = findExpoGo();
	installExpoGo(simulators, expoGo);

	showProgress(3);
	process.stdout.write('\n');
	metro = startMetro();
	metroDone = watchMetro(metro);
	stopMetroWhenAsked(metro);

	await openAppWhenMetroStarts(simulators, metro);
	await finishWithMetro(metroDone);
}

/**
 * Show a simple error when any step fails.
 * Return an error code to the terminal.
 */
function reportError(error) {
	console.error(error.message);
	process.exitCode = 1;
}

main().catch(reportError);
