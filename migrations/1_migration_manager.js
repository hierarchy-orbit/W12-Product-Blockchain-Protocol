const Migrations = artifacts.require("./Migrations.sol");
const Versions = artifacts.require("./versioning/VersionsLedger.sol");
const version = require('../package').version;
const semint = require('@redtea/semint');
const semver = require('semver');
const utils = require('../shared/utils');

module.exports = function(deployer, network, accounts) {
    if (network === 'test') {
        deployer.then(async () => {
            if (!semint.isValid(version, 4)) throw new Error('version in package.json is not valid');

            utils.migrateLog.create('Rinkeby');

            // firstly deploy versions ledger
            await utils.deploy(network, deployer, Versions, {overwrite: false});

            utils.migrateLog.addAddress(Versions.contractName, Versions.address);

            // get all existing versions
            const versions = (await (await Versions.deployed()).getVersions())
                .map(v => semint.decode(v.toNumber(), 4));

            console.log('deployed versions: ', versions.join(', '));

            const exists = versions.length ? semver.satisfies(version, versions.join('||')) : false;

            if (exists) throw new Error(`version ${version} already deployed`);

            await utils.deploy(network, deployer, Migrations, semint.encode(version, 4));

            utils.migrateLog.addAddress(Migrations.contractName, Migrations.address);
        });
    }
};
