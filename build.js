const { execSync } = require('child_process');
const { ncp } = require('ncp');
const path = require('path');
const del = require('del');
const fs = require('fs');

const BUILD_FOLDER = 'bvld';
const PACKAGE_INDENTATION = 2;
const PACKAGE_PATH = path.join(__dirname, 'package.json');
ncp.limit = 16;

/**
 * Runs a command and waits for it to finish. Does not resolved with any content.
 * @param {string} command Command to execute
 * @returns {Promise} Promise fufilled with the result.
 */
const exec = command =>
    new Promise(resolve => {
        const result = execSync(command);
        resolve(result);
    });

/**
 * Updates package.json with the new main entry
 * @param {string} mainLocation The location of the main file
 */
const updatePackage = async mainLocation => {
    const package = JSON.parse(fs.readFileSync(PACKAGE_PATH).toString());
    package.main = mainLocation;
    fs.writeFileSync(PACKAGE_PATH, JSON.stringify(package, null, PACKAGE_INDENTATION));
    return;
};

/**
 * Main build function
 */
const build = async () => {
    console.log('Editing `package.json`');
    await updatePackage(`${BUILD_FOLDER}/index.js`);

    console.log('Obfuscating');
    await exec('yarn obfuscate');

    console.log('Building');
    await exec(`yarn dist${process.platform === 'darwin' ? ':both' : ''}`); // Build for both if on a mac

    console.log('Reverting `package.json`');
    await updatePackage('src/index.js');

    console.log(`Deleting ${BUILD_FOLDER}`);
    await del(BUILD_FOLDER);

    console.log('Built. Please install and test everything!');
};

const exclusions = ['interactiveElement', 'variables'].map(x => `${x}.css`);
console.log('Excluding', exclusions);

const exlusionsString = exclusions.map(name => name.replace('.', '\\.')).join('|');
const filter = new RegExp(`^.*(?<!\.map|\.scss|${exlusionsString})$`);

/**
 * Copies the source folder to the {BUILD_FOLDER}. Instantly runs `build` afterwards.
 */
const copy = () => {
    console.log(`Copying files to ${BUILD_FOLDER}`);
    ncp(path.join(__dirname, 'src'), path.join(__dirname, BUILD_FOLDER), { filter }, build);
};

console.log(`Deleting ${BUILD_FOLDER}`);
del(BUILD_FOLDER)
    .then(copy)
    .catch(O_o => console.warn('An error occured.'));