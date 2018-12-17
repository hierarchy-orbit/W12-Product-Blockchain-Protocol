const W12Crowdsale = artifacts.require('W12Crowdsale');
const W12CrowdsaleStub = artifacts.require('W12CrowdsaleStub');
const Percent = artifacts.require('Percent');
const W12CrowdsaleFactory = artifacts.require('W12CrowdsaleFactory');
const W12FundFactory = artifacts.require('W12FundFactory');
const version = require('../package').version;
const semint = require('@redtea/semint');
const utils = require('../shared/utils');

module.exports = function (deployer, network, accounts) {
    deployer.then(async () => {
        await utils.deploy(network, deployer, Percent);

        if (network === 'test' || network === 'mainnet') {
            utils.migrateLog.addAddress(Percent.contractName, Percent.address);
        }

        W12CrowdsaleStub.link(Percent);
        W12Crowdsale.link(Percent);
        W12CrowdsaleFactory.link(Percent);
    });

    if(network === 'test' || network === 'mainnet') {
    	deployer.then(async () => {
            await utils.deploy(network, deployer, W12FundFactory, semint.encode(version, 4));

            utils.migrateLog.addAddress(W12FundFactory.contractName, W12FundFactory.address);

            await utils.deploy(network, deployer, W12CrowdsaleFactory, semint.encode(version, 4), W12FundFactory.address);

            utils.migrateLog.addAddress(W12CrowdsaleFactory.contractName, W12CrowdsaleFactory.address);
        });
    }
};
