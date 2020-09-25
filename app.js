/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * 系统启动入口
 * wangxm   2018-12-25
 */
const command = __webpack_require__(1)
const path = __webpack_require__(2)
const fs = __webpack_require__(3)
const DdnCore = __webpack_require__(4).default
const DdnPeer = __webpack_require__(5).default
const DdnUtils = __webpack_require__(6).default

const packageFile = __webpack_require__(7)
const constants = __webpack_require__(8)

/**
 * 整理系统配置文件生成输入参数
 */
function genOptions () {
  command
    .version(packageFile.version)
    .option('-p, --port <port>', 'Listening port number')
    .option('-a, --address <ip>', 'Listening host name or ip')
    .option('-b, --blockchain <path>', 'Blockchain db path')
    .option('-g, --genesisblock <path>', 'Genesisblock path')
    .option('-x, --peers [peers...]', 'Peers list')
    .option('-l, --log <level>', 'Log level')
    .option('-d, --daemon', 'Run ddn node as daemon')
    .option('-e, --execute <path>', 'exe')
    .option('-r, --reindex', 'verify or not when block loading')
    .option('--dapps <dir>', 'DApps directory')
    .option('--base <dir>', 'Base directory')
    .parse(process.argv)

  const baseDir = command.base || path.resolve(__dirname, './')

  let genesisblockFile = path.join(baseDir, 'config', 'genesisBlock.json')
  if (command.genesisblock) {
    genesisblockFile = path.resolve(process.cwd(), command.genesisblock)
  }
  if (!fs.existsSync(genesisblockFile)) {
    console.error('Failed: DDN genesisblock file does not exists.')
    process.exit(1)
  }

  const genesisblockObject = JSON.parse(fs.readFileSync(genesisblockFile, 'utf8'))

  const configObject = DdnCore.getUserConfig({ cwd: baseDir })
 
  configObject.version = packageFile.version
  configObject.basedir = baseDir
  configObject.buildVersion = '05:38:30 21/08/2020'
  configObject.net = process.env.NET || 'testnet'
  configObject.publicDir = path.join(baseDir, 'public')
  configObject.dappsDir = command.dapps || path.join(baseDir, 'dapps')
  if (command.port) {
    configObject.port = command.port
  }

  if (command.address) {
    configObject.address = command.address
  }

  if (command.peers) {
    if (typeof command.peers === 'string') {
      configObject.peers.list = command.peers.split(',').map(peer => {
        peer = peer.split(':')
        return {
          ip: peer.shift(),
          port: peer.shift() || configObject.port
        }
      })
    } else {
      configObject.peers.list = command.peers
    }
  }

  if (command.log) {
    configObject.logLevel = command.log
  }

  if (command.reindex) {
    configObject.loading.verifyOnLoading = true
  }

  return {
    baseDir,
    configObject,
    constants,
    genesisblockObject,
    isDaemonMode: !!command.daemon
  }
}

async function main () {
  global._require_runtime_ = m => {
    if (typeof (global._require_native_) === 'function') {
      return global._require_native_(m)
    } else {
      return require(m).default || require(m)
    }
  }

  let peer

  try {
    const options = genOptions()
    peer = new DdnPeer()
    await peer.run(options)
  } catch (err) {
    console.error(DdnUtils.system.getErrorMsg(err))

    if (peer) {
      peer.destory()
    }

    process.exit(1)
  }
}

main()


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("commander");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("@ddn/core");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("@ddn/peer");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("@ddn/utils");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = {"name":"ddn","version":"3.6.1","main":"./app.js","private":true,"repository":{"type":"git","url":"git+https://github.com/ddnlink/ddn.git"},"bugs":{"url":"https://github.com/ddnlink/ddn/issues"},"homepage":"https://github.com/ddnlink/ddn/tree/master/packages/ddn#readme","keywords":["ddn","blockchain","bitcoin","node.js","web","server","git","crypto","cryptography","encryption"],"author":"DDN <support@ddn.link>","contributors":[{"name":"imfly","email":"kubying@foxmail.com"},{"name":"wangxm","email":"softwaiter@126.com"}],"license":"MIT","engines":{"node":">=8.6.0"},"scripts":{"start":"cross-env NODE_ENV=05:38:30 21/08/2020 node app.js","test":"./node_modules/.bin/mocha -r intelli-espower-loader test/**/*.test.js","build":"cross-env NODE_ENV=production ./node_modules/.bin/gulp linux-build-main","build-testnet":"./node_modules/.bin/gulp linux-build-test","build-testnet-mac":"./node_modules/.bin/gulp mac-build-test","build-testnet":"./node_modules/.bin/gulp linux-build-local","deploy":"deploy blockchain","cm":"git-cz"},"dependencies":{"@ddn/core":"^0.2.11","@ddn/peer":"^0.7.5","@ddn/utils":"^0.1.19","commander":"2.6.0","lodash":"^4.17.11","sqlite3":"^5.0.0"},"devDependencies":{"babel-core":"^6.26.0","babel-loader":"^7.1.4","babel-preset-env":"^1.6.1","cross-env":"^5.1.3","git-cz":"^4.7.0","gulp":"^4.0.2","gulp-replace":"^0.5.4","gulp-shell":"^0.5.2","gulp-uglify":"^3.0.0","intelli-espower-loader":"^1.0.1","pump":"^2.0.0","string-replace-loader":"^2.3.0","uglifyjs-webpack-plugin":"^1.2.2","webpack":"^3.11.0","webpack-node-externals":"^1.2.0"}}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

/* ---------------------------------------------------------------------------------------------
 *  Created by DDN Team on Sat Jun 16 2017 11:31:12
 *
 *  Copyright (c) 2019 DDN Foundation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */

let constants = __webpack_require__(9)

// Todo: get it when building
if (process.env.DDN_ENV === 'custom') {
  constants = __webpack_require__(10)
}

module.exports = constants


/***/ }),
/* 9 */
/***/ (function(module, exports) {

/**
 * Please use yourself constants file
 * Note: Once the mainnet is online, this file can no longer be changed.
 */
module.exports = {
  nethash: '0ab796cd', // 标定该链的版本
  tokenName: 'DDN',
  tokenPrefix: 'D',
  foundAddress: 'DLjrrVwnmMXstcAYVjcrpwyYb3kY1ehABU',
  walletUrl: 'http://wallet.ddn.link',

  interval: 10, // 10ms
  delegates: 101, // number
  superPeers: 21,
  voters: 20,
  remoteVoters: 1,
  maxAmount: 100000000,
  maxPayloadLength: 8 * 1024 * 1024,
  blockHeaderLength: 248,
  addressLength: 208,
  maxAddressesLength: 208 * 128,
  maxClientConnections: 100,
  numberLength: 100000000,
  maxRequests: 10000 * 12,
  requestLength: 104,
  signatureLength: 196,
  maxSignaturesLength: 196 * 256,
  maxConfirmations: 77 * 100,
  confirmationLength: 77,
  fixedPoint: 10 ** 8,
  totalAmount: '10000000000000000', // Bignum update
  maxTxsPerBlock: 500,

  testnet: {
    rewardRatio: 0.2,
    milestones: [
      '500000000', // Initial Reward    Bignum update
      '400000000', // Milestone 1
      '300000000', // Milestone 2
      '200000000', // Milestone 3
      '100000000' // Milestone 4
    ],
    beginDate: new Date(Date.UTC(2017, 10, 20, 12, 20, 20, 20)), // testnet
    rewardDistance: 3000000, // Distance between each milestone
    rewardOffset: 1, // Start rewards at block (n)60480
    compatibleVersion: '0.0.0', // Peer isCompatible?

    // Fees for transacton
    fees: {
      // base
      transfer: '0.1',
      vote: '0.1',
      delegate: '100',
      signature: '5',
      multiSignature: '5',
      lock: 'o.1',

      // aob
      aob_issuer: '100',
      aob_asset: '500',
      aob_flag: '0.1',
      aob_acl: '0.1',
      aob_issue: '0.1',
      aob_transfer: '0',

      // dapp
      dapp: '100',
      dapp_out: '0.1',
      dapp_in: '0.1',

      // todo: 测试中提供的费用
      username: '0.1',

      // dao
      dao_confirmation: '1',
      dao_contribution: '1',
      dao_exchange: '0.1',
      dao_org: '0.1',

      // evidence
      evidence: '0.1' // fixme
    }
  },

  mainnet: {
    rewardRatio: 0.2,
    milestones: [
      '500000000', // Initial Reward      Bignum update
      '400000000', // Milestone 1
      '300000000', // Milestone 2
      '200000000', // Milestone 3
      '100000000' // Milestone 4
    ],
    beginDate: new Date(Date.UTC(2017, 11, 20, 4, 0, 0, 0)), // 主网上线：2017年12月20日中午12点（+8)
    rewardDistance: 3000000, // Distance between each milestone
    rewardOffset: 1, // Start rewards at block (n)
    // If you have some different thing, Please set the compatibleVersion.
    compatibleVersion: '0.0.0', // Peer isCompatible?

    // Fees for transacton
    fees: {
      // base
      transfer: '0.1',
      vote: '0.1',
      delegate: '100',
      signature: '5',
      multiSignature: '5',
      lock: 'o.1',

      // aob
      aob_issuer: '100',
      aob_asset: '500',
      aob_flag: '0.1',
      aob_acl: '0.1',
      aob_issue: '0.1',
      aob_transfer: '0',

      // dapp
      dapp: '100',
      dapp_out: '0.1',
      dapp_in: '0.1',

      // todo: 测试中提供的费用
      username: '0.1',

      // dao
      dao_confirmation: '1',
      dao_contribution: '1',
      dao_exchange: '0.1',
      dao_org: '0.1',

      // evidence
      evidence: '0.1' // fixme
    }
  }
}


/***/ }),
/* 10 */
/***/ (function(module, exports) {

/**
 * 本文件用于测试
 */
module.exports = {
  nethash: 'gar0fktt', // 标定该链的版本
  tokenName: 'HBL',
  tokenPrefix: 'H',
  foundAddress: 'HLjrrVwnmMXstcAYVjcrpwyYb3kY1ehABU',
  walletUrl: 'http://wallet.hbl.link',
  enableMoreLockTypes: true,

  interval: 10, // 10ms
  delegates: 101, // number
  superPeers: 21,
  voters: 20,
  remoteVoters: 1,
  maxAmount: 100000000,
  maxPayloadLength: 8 * 1024 * 1024,
  blockHeaderLength: 248,
  addressLength: 208,
  maxAddressesLength: 208 * 128,
  maxClientConnections: 100,
  numberLength: 100000000,
  maxRequests: 10000 * 12,
  requestLength: 104,
  signatureLength: 196,
  maxSignaturesLength: 196 * 256,
  maxConfirmations: 77 * 100,
  confirmationLength: 77,
  fixedPoint: 10 ** 8,
  totalAmount: '10000000000000000', // = maxAmount * fixedPoint
  maxTxsPerBlock: 500,

  testnet: {
    rewardRatio: 0.2,
    milestones: [
      '500000000', // Initial Reward    Bignum update
      '400000000', // Milestone 1
      '300000000', // Milestone 2
      '200000000', // Milestone 3
      '100000000' // Milestone 4
    ],
    beginDate: new Date(Date.UTC(2017, 10, 20, 12, 20, 20, 20)), // testnet
    rewardDistance: 3000000, // Distance between each milestone
    rewardOffset: 1, // Start rewards at block (n)60480
    compatibleVersion: '0.0.0', // Peer isCompatible?

    // Fees for transacton
    fees: {
      // base
      transfer: '0.1',
      vote: '0.1',
      delegate: '100',
      signature: '5',
      multiSignature: '5',
      lock: 'o.1',

      // aob
      aob_issuer: '100',
      aob_asset: '500',
      aob_flag: '0.1',
      aob_acl: '0.1',
      aob_issue: '0.1',
      aob_transfer: '0',

      // dapp
      dapp: '100',
      dapp_out: '0.1',
      dapp_in: '0.1',

      // todo: 测试中提供的费用
      username: '0.1',

      // dao
      dao_confirmation: '1',
      dao_contribution: '1',
      dao_exchange: '0.1',
      dao_org: '0.1',

      // evidence
      evidence: '0.1' // fixme
    }
  },

  mainnet: {
    rewardRatio: 0.2,
    milestones: [
      '500000000', // Initial Reward      Bignum update
      '400000000', // Milestone 1
      '300000000', // Milestone 2
      '200000000', // Milestone 3
      '100000000' // Milestone 4
    ],
    beginDate: new Date(Date.UTC(2017, 11, 20, 4, 0, 0, 0)), // 主网上线：2017年12月20日中午12点（+8)
    rewardDistance: 3000000, // Distance between each milestone
    rewardOffset: 1, // Start rewards at block (n)
    // If you have some different thing, Please set the compatibleVersion.
    compatibleVersion: '0.0.0', // Peer isCompatible?

    // Fees for transacton
    fees: {
      // base
      transfer: '0.1',
      vote: '0.1',
      delegate: '100',
      signature: '5',
      multiSignature: '5',
      lock: 'o.1',

      // aob
      aob_issuer: '100',
      aob_asset: '500',
      aob_flag: '0.1',
      aob_acl: '0.1',
      aob_issue: '0.1',
      aob_transfer: '0',

      // dapp
      dapp: '100',
      dapp_out: '0.1',
      dapp_in: '0.1',

      // todo: 测试中提供的费用
      username: '0.1',

      // dao
      dao_confirmation: '1',
      dao_contribution: '1',
      dao_exchange: '0.1',
      dao_org: '0.1',

      // evidence
      evidence: '0.1' // fixme
    }
  }
}


/***/ })
/******/ ]);