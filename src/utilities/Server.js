import RavenCoin from './RavenCoin'
import Ravencoin from 'ravencoinjs-lib';

import Store from 'electron-store';
const store = new Store();

import express from 'express';
import cors from 'cors';

import axios from 'axios';
import bodyParser from 'body-parser';
let RVNBOXSDK = require('rvnbox-sdk/lib/rvnbox-sdk').default;
let rvnbox = new RVNBOXSDK();
import underscore from 'underscore';

class Server {
  constructor() {
    const server = express();
    let protocol = 'http';
    let ipAddress = '127.0.0.1';
    let port = 8767;
    server.use(cors());
    server.use(bodyParser.json()); // support json encoded bodies
    server.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
    server.post('/', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      axios.post(`${protocol}://${ipAddress}:${port}/${req.body.method}`, req.body)
      .then((response) => {
        res.send({
          result: response.data
        });
      })
      .catch((error) => {
        res.send(error);
      });
    });

    server.post('/addmultisigaddress', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      let params = req.body.params;
      let nrequired = params[0];
      let keys = params[1];
      let state = store.get('state');
      let accounts = state.wallet.accounts;
      let wallet = state.configuration.wallet;
      let resp = RavenCoin.createMultiSig(nrequired, keys, accounts, wallet);
      res.send(resp.address);
    });

    server.post('/addnode', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send();
    });

    server.post('/backupwallet', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(store.get('state').wallet);
    });

    server.post('/clearbanned', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send();
    });

    server.post('/createmultisig', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      let params = req.body.params;
      let nrequired = params[0];
      let keys = params[1];
      let state = store.get('state');
      let accounts = state.wallet.accounts;
      let wallet = state.configuration.wallet;
      let resp = RavenCoin.createMultiSig(nrequired, keys, accounts, wallet);
      res.send(JSON.stringify(
        {
          "address" : resp.address,
          "redeemScript" : resp.redeemScript.toString('hex')
        }
      ));
    });

    server.post('/createrawtransaction', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send('01000000011da9283b4ddf8d89eb996988b89ead56cecdc44041ab38bf787f1206cd90b51e0000000000ffffffff01405dc600000000001976a9140dfc8bafc8419853b34d5e072ad37d1a5159f58488ac00000000');
    });

    server.post('/decoderawtransaction', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      let decodedTx = {};

      let transaction = rvnbox.Transaction.fromHex(req.body.params[0]);

      decodedTx.txid = transaction.getId();
      decodedTx.size = transaction.byteLength();
      decodedTx.vsize = transaction.virtualSize();
      let a = rvnbox.Address;
      let script = rvnbox.Script;
      let ins = [];
      transaction.ins.forEach((input, index) => {
        let txid = Buffer.from(input.hash).reverse().toString('hex')
        if(transaction.isCoinbase()) {
          ins.push({
            coinbase: input.script.toString('hex'),
            sequence: 4294967295
          });
        } else {
          ins.push({
            txid: txid,
            vout: index,
            scriptSig: {
              asm: script.toASM(input.script),
              hex: input.script.toString('hex')
            },
            sequence: 4294967295
          });
        }
      })
      decodedTx.vin = ins;

      let outs = [];
      transaction.outs.forEach((output, index) => {
        outs.push({
          scriptPubKey: {
            asm: script.toASM(output.script),
            hex: output.script.toString('hex'),
            reqSigs: 1,
            type: "pubkeyhash",
            addresses: [
              rvnbox.Address.toLegacyAddress(a.fromOutputScript(output.script))
            ]
          },
          value: output.value
        });
      })
      decodedTx.vout = outs;

      res.send(decodedTx);
    });

    server.post('/decodescript', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      // let params = req.body.params;
      // let redeemScript = params[0];
      // let rd = Ravencoin.script.multisig.output.decode(new Buffer(redeemScript, "hex"))
      // console.log(rd);
      // let me = Ravencoin.script.decompile(new Buffer(redeemScript, "hex"));
      // console.log(me);
      // console.log(JSON.parse(JSON.stringify(rd)));

      res.send(JSON.stringify({
        "asm" : "2 03ede722780d27b05f0b1169efc90fa15a601a32fc6c3295114500c586831b6aaf 02ecd2d250a76d204011de6bc365a56033b9b3a149f679bc17205555d3c2b2854f 022d609d2f0d359e5bc0e5d0ea20ff9f5d3396cb5b1906aa9c56a0e7b5edc0c5d5 3 OP_CHECKMULTISIG",
        "reqSigs" : 2,
        "type" : "multisig",
        "addresses" : [
          "mjbLRSidW1MY8oubvs4SMEnHNFXxCcoehQ",
          "mo1vzGwCzWqteip29vGWWW6MsEBREuzW94",
          "mt17cV37fBqZsnMmrHnGCm9pM28R1kQdMG"
        ],
        "p2sh" : "2MyVxxgNBk5zHRPRY2iVjGRJHYZEp1pMCSq"
      }));
    });

    server.post('/disconnectnode', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send("Node not found in connected nodes");
    });

    server.post('/dumpprivkey', (req, res) =>{
      res.setHeader('Content-Type', 'application/json');
      let state = store.get('state');
      let accounts = state.wallet.accounts;

      accounts.forEach((account, index) => {
        let tmp = rvnbox.HDNode.fromWIF(account.privateKeyWIF).getAddress();
        if(tmp === rvnbox.Address.toLegacyAddress(req.body.params[0])) {
          res.send(account.privateKeyWIF);
        }
      });
    });

    server.post('/dumpwallet', (req, res) =>{
      res.setHeader('Content-Type', 'application/json');

      res.send(store.get('state').wallet);
    });

    server.post('/encryptwallet', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send("wallet encrypted; Ravencoin server stopping, restart to run with encrypted wallet. The keypool has been flushed, you need to make a new backup.");
    });

    server.post('/estimatefee', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      let fee;
      if(req.body.params[0] === 1) {
        fee = -1;
      } else {
        fee = '0.00000002';
      }

      res.send(JSON.stringify(fee));
    });

    server.post('/estimatesmartfee', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      let fee;
      if(req.body.params[0] === 0) {
        fee = {
          "feerate": -1,
          "blocks": 0
        };
      } else {
        fee = {
          "feerate": '0.00000002',
          "blocks": req.body.params[0]
        };
      }

      res.send(JSON.stringify(fee));
    });

    server.post('/estimatesmartpriority', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send({
          "priority": '-1',
          "blocks": req.body.params[0]
        });
    });

    server.post('/estimatepriority', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send('-1');
    });

    server.post('/fundrawtransaction', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({
      	"hex": "01000000011da9283b4ddf8d89eb996988b89ead56cecdc44041ab38bf787f1206cd90b51e0000000000ffffffff01405dc600000000001976a9140dfc8bafc8419853b34d5e072ad37d1a5159f58488ac00000000",
      	"fee": 0.0000245,
      	"changepos": 2
      }));
    });

    server.post('/generate', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify([]));
    });

    server.post('/generatetoaddress', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify([]));
    });

    server.post('/getaccountaddress', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(rvnbox.Address.toLegacyAddress(rvnbox.HDNode.fromWIF(store.get('addresses')[0].privateKeyWIF).getAddress()));
    });

    server.post('/getaccount', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send('');
    });

    server.post('/getaddednodeinfo', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify([
        {
          "addednode" : "ravend.example.com:8767",
          "connected" : true,
          "addresses" : [
            {
              "address" : "192.0.2.113:8767",
              "connected" : "outbound"
            }
          ]
        }
      ]));
    });

    server.post('/getaddressesbyaccount', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      let state = store.get('state');
      let accounts = state.wallet.accounts;
      let addresses = [];
      accounts.forEach((account, index) => {
        addresses.push(account.legacyAddr);
      });
      res.send(addresses);
    });

    server.post('/getbalance', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify('0.00000000'));
    });

    server.post('/getbestblockhash', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      let bestblock = underscore.last(store.get('state').blockchain.chain);

      res.send(JSON.stringify(bestblock.header));
    });

    server.post('/getblock', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      let blockchain = store.get('state').blockchain;
      let block = underscore.findWhere(blockchain.chain, {header: req.body.params[0]});

      res.send(JSON.stringify(block));
    });

    server.post('/getblockchaininfo', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({
          "chain": "main",
          "blocks": 510569,
          "headers": 510569,
          "bestblockhash": "000000000000c03312793e8dbff3a097cac603c198a24ec8e9a9ab560a57bb1d",
          "difficulty": 55093.92169942019,
          "difficulty_algorithm": "DGW-180",
          "mediantime": 1545966513,
          "verificationprogress": 0.9999981719906134,
          "chainwork": "00000000000000000000000000000000000000000000000342ac45d188195760",
          "size_on_disk": 3984383091,
          "pruned": false,
          "softforks": [
          ],
          "bip9_softforks": {
              "assets": {
                  "status": "active",
                  "startTime": 1540944000,
                  "timeout": 1572480000,
                  "since": 435456
              }
          },
          "warnings": ""
      }));
    });

    server.post('/getblockcount', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      let blockCount = store.get('state').blockchain.chain.length;
      res.send(JSON.stringify(blockCount));
    });

    server.post('/getblockhash', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      let blockchain = store.get('state').blockchain;
      let block = underscore.findWhere(blockchain.chain, {index: +req.body.params[0]});

      res.send(block ? block.header : 'n/a');
    });

    server.post('/getblockheader', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      let blockchain = store.get('state').blockchain;
      let block = underscore.findWhere(blockchain.chain, {header: req.body.params[0]});

      res.send(block ? block.header : 'n/a');
    });

    server.post('/getblocktemplate', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ template_request: req.body.params[0] }));
    });

    server.post('/getchaintips', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify([
          {
              "height": 510569,
              "hash": "000000000000c03312793e8dbff3a097cac603c198a24ec8e9a9ab560a57bb1d",
              "branchlen": 0,
              "status": "active"
          },
          {
              "height": 508027,
              "hash": "0000000000013c04bf48fcab145ca26abd01713493fb19bf128a7d341ffdf9e0",
              "branchlen": 1,
              "status": "valid-fork"
          },
          {
              "height": 507735,
              "hash": "0000000000000135aabe8ba6adb803914d17438c5b10edcb8726fdc3b73c0255",
              "branchlen": 1,
              "status": "valid-headers"
          },
          {
              "height": 506518,
              "hash": "0000000000014f68cf5c972051474ccbb9960a51fabbd02aedbc9e5134fe8937",
              "branchlen": 1,
              "status": "valid-fork"
          },
          {
              "height": 503654,
              "hash": "000000000000076eaaae34ab3b17547db074c92e76ba80e76452fff7c5795dcb",
              "branchlen": 1,
              "status": "valid-headers"
          },
          {
              "height": 502703,
              "hash": "0000000000006a1dd1d9a4820c3c2fc9c3cf9911d60708563f7d6d078e41cfa5",
              "branchlen": 1,
              "status": "valid-fork"
          },
          {
              "height": 502191,
              "hash": "00000000000064e049af9cbd36f2bfbfd288aa7414821e03a443b0527f8a2cac",
              "branchlen": 1,
              "status": "valid-fork"
          },
          {
              "height": 502163,
              "hash": "000000000000567a3cfa57df7091c3698d0f10b5256b99b3e218bc305d82308b",
              "branchlen": 1,
              "status": "valid-headers"
          },
          {
              "height": 501708,
              "hash": "0000000000006cc1206d36e82915a8602e95fd58abc391c630fc68ef4ec2cfa7",
              "branchlen": 1,
              "status": "valid-headers"
          },
          {
              "height": 500819,
              "hash": "0000000000011cde5b3eb591af7479928784c9444818f179208a868813aaed8e",
              "branchlen": 1,
              "status": "valid-headers"
          },
          {
              "height": 500382,
              "hash": "0000000000004847dbb915cb689cb873da039e7b75943ba557719d5749233193",
              "branchlen": 1,
              "status": "valid-headers"
          },
          {
              "height": 498910,
              "hash": "0000000000007b3f7f068cf45b2a15d8d346ecb43f0a390970a1ee51d0e99026",
              "branchlen": 1,
              "status": "valid-headers"
          },
          {
              "height": 496924,
              "hash": "00000000000001760811ac69790383c047dee9feb781e9df175e1cfd58c09954",
              "branchlen": 1,
              "status": "valid-fork"
          },
          {
              "height": 496512,
              "hash": "000000000000ad5a1fd962401d09f81643ad4af89ffa47c5a7be8d0cfc11da0b",
              "branchlen": 1,
              "status": "valid-fork"
          },
          {
              "height": 495346,
              "hash": "000000000000193edb96ca23115d3e09b4fe3edee885360e5aef6a28d8914fc4",
              "branchlen": 1,
              "status": "valid-headers"
          }
      ]));
    });

    server.post('/getconnectioncount', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send('success');
    });

    server.post('/getdifficulty', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify('0'));
    });

    server.post('/getexcessiveblock', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send('success');
    });

    server.post('/getinfo', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send({
        version: 160200,
        protocolversion: 70015,
        walletversion: 130000,
        balance: 0,
        blocks: 518990,
        timeoffset: 0,
        connections: 14,
        proxy: '',
        difficulty: 363501276434.3268,
        testnet: 'false',
        keypoololdest: 1519061617,
        keypoolsize: 100,
        paytxfee: 0,
        relayfee: 0.00001,
        errors: ''
      });
    });

    server.post('/getmemoryinfo', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({
        "locked": {
          "used": 0,
          "free": 65536,
          "total": 65536,
          "locked": 65536,
          "chunks_used": 0,
          "chunks_free": 1
        }
      }));
    });

    server.post('/getmempoolancestors', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({
        "b104586f229e330caf42c475fd52684e9eb5e2d02f0fcd216d9554c5347b0873": {
          "size": 485,
          "fee": 0.00009700,
          "modifiedfee": 0.00009700,
          "time": 1479423635,
          "height": 439431,
          "startingpriority": 15327081.81818182,
          "currentpriority": 21536936.36363636,
          "descendantcount": 1,
          "descendantsize": 485,
          "descendantfees": 9700,
          "ancestorcount": 1,
          "ancestorsize": 485,
          "ancestorfees": 9700,
          "depends": [
          ]
        },
        "094f7dcbc7494510d4daeceb2941ed73b1bd011bf527f6c3b7c897fee85c11d4": {
          "size": 554,
          "fee": 0.00005540,
          "modifiedfee": 0.00005540,
          "time": 1479423327,
          "height": 439430,
          "startingpriority": 85074.91071428571,
          "currentpriority": 3497174.4375,
          "descendantcount": 1,
          "descendantsize": 554,
          "descendantfees": 5540,
          "ancestorcount": 1,
          "ancestorsize": 554,
          "ancestorfees": 5540,
          "depends": [
          ]
        }
      }));
    });


    server.post('/getmempooldescendants', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({
        "b104586f229e330caf42c475fd52684e9eb5e2d02f0fcd216d9554c5347b0873": {
          "size": 485,
          "fee": 0.00009700,
          "modifiedfee": 0.00009700,
          "time": 1479423635,
          "height": 439431,
          "startingpriority": 15327081.81818182,
          "currentpriority": 21536936.36363636,
          "descendantcount": 1,
          "descendantsize": 485,
          "descendantfees": 9700,
          "ancestorcount": 1,
          "ancestorsize": 485,
          "ancestorfees": 9700,
          "depends": [
          ]
        },
        "094f7dcbc7494510d4daeceb2941ed73b1bd011bf527f6c3b7c897fee85c11d4": {
          "size": 554,
          "fee": 0.00005540,
          "modifiedfee": 0.00005540,
          "time": 1479423327,
          "height": 439430,
          "startingpriority": 85074.91071428571,
          "currentpriority": 3497174.4375,
          "descendantcount": 1,
          "descendantsize": 554,
          "descendantfees": 5540,
          "ancestorcount": 1,
          "ancestorsize": 554,
          "ancestorfees": 5540,
          "depends": [
          ]
        }
      }
      ));
    });

    server.post('/getmempoolentry', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({
        "size": 485,
        "fee": 0.00009700,
        "modifiedfee": 0.00009700,
        "time": 1479423635,
        "height": 439431,
        "startingpriority": 15327081.81818182,
        "currentpriority": 21536936.36363636,
        "descendantcount": 1,
        "descendantsize": 485,
        "descendantfees": 9700,
        "ancestorcount": 1,
        "ancestorsize": 485,
        "ancestorfees": 9700,
        "depends": [
        ]
      }));
    });

    server.post('/getmempoolinfo', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({
        "size": 1237,
        "bytes": 591126,
        "usage": 1900416,
        "maxmempool": 300000000,
        "mempoolminfee": 0.00000000
      }));
    });

    server.post('/getmininginfo', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({
        "blocks": 464545,
        "currentblocksize": 0,
        "currentblockweight": 0,
        "currentblocktx": 0,
        "difficulty": 521974519553.6282,
        "errors": "",
        "networkhashps": 4.126888339085874e+18,
        "pooledtx": 31241,
        "chain": "main"
      }));
    });

    server.post('/getnettotals', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({
        "totalbytesrecv": 7137052851,
        "totalbytessent": 211648636140,
        "timemillis": 1481227418585,
        "uploadtarget": {
          "timeframe": 86400,
          "target": 0,
          "target_reached": false,
          "serve_historical_blocks": true,
          "bytes_left_in_cycle": 0,
          "time_left_in_cycle": 0
        }
      }));
    });

    server.post('/getnetworkhashps', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send('2674221725221622000');
    });

    server.post('/getnetworkinfo', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            "version": 2020000,
            "subversion": "/Ravencoin:2.2.0/",
            "protocolversion": 70017,
            "localservices": "000000000000000d",
            "localrelay": true,
            "timeoffset": 2,
            "networkactive": true,
            "connections": 8,
            "networks": [
                {
                    "name": "ipv4",
                    "limited": false,
                    "reachable": true,
                    "proxy": "",
                    "proxy_randomize_credentials": false
                },
                {
                    "name": "ipv6",
                    "limited": false,
                    "reachable": true,
                    "proxy": "",
                    "proxy_randomize_credentials": false
                },
                {
                    "name": "onion",
                    "limited": true,
                    "reachable": false,
                    "proxy": "",
                    "proxy_randomize_credentials": false
                }
            ],
            "relayfee": 0.00001000,
            "incrementalfee": 0.00001000,
            "localaddresses": [
            ],
            "warnings": ""
        }));
    });

    server.post('/getnewaddress', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      let state = store.get('state');
      let accounts = state.wallet.accounts;

      res.send(accounts[0].legacyAddr);
    });

    server.post('/getpeerinfo', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify([
          {
          "id": 3,
          "addr": "192.0.2.113:43132",
          "addrlocal": "127.0.0.1:8767",
          "services": "0000000000000000",
          "relaytxes": true,
          "lastsend": 1481158534,
          "lastrecv": 1481158534,
          "bytessent": 142772,
          "bytesrecv": 14167,
          "conntime": 1481158420,
          "timeoffset": 11,
          "pingtime": 0.226368,
          "minping": 0.226368,
          "version": 70001,
          "subver": "/Satoshi:0.12.1/",
          "inbound": true,
          "startingheight": 0,
          "banscore": 0,
          "synced_headers": -1,
          "synced_blocks": -1,
          "inflight": [
          ],
          "whitelisted": false,
          "bytessent_per_msg": {
            "addr": 55,
            "inv": 12161,
            "ping": 32,
            "pong": 1824,
            "tx": 128549,
            "verack": 24,
            "version": 127
          },
          "bytesrecv_per_msg": {
            "getdata": 12161,
            "ping": 1824,
            "pong": 32,
            "verack": 24,
            "version": 126
          }
        }
      ]));
    });

    server.post('/getrawchangeaddress', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      let state = store.get('state');
      let accounts = state.wallet.accounts;

      res.send(accounts[0].legacyAddr);
    });

    server.post('/getrawmempool', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify([
            "68d199b7c8aa7a5fe9e7d7c7ee9c1bda9b9eb939058250cfeb625a6a92b07a9f",
            "138bac03bde472bc2a1b09c7839e2e1accc621d28883a696331565f22c4edc6d",
            "6c945a933b61f3a11835f84765048a0239dec7be4edea50a8547d728a9ed9929",
            "63d0ef419a289649ba9c6b33b836e0f90ebe3ec3e5d591e7d10ca3cae187cf26",
            "4a90d078a99a10facf6ab3d9699227a6992604992288b7067f2315d75dce771a",
            "2e9c0d9a71fc2cbc9cc95c2d3502e8e477a11252273518ae7232803c8ab972e3",
            "5e8d3829f2bb91a02da0cd85f5148525cfa022adc1cff3c31f99d892a72145c4",
            "65cc716dd7effeec984f7ad6f66ad17430ea0f632667ee10de22c9049a9e3a62",
            "d2f2ec5be0b33581ab41bdaa2f620605d53d12cd263100f2465097f5acc50029",
            "8c72b81cfacd5f95fd2d602f5272300b236acabbee0f11c857180c82d469ee94",
            "d242498795dcc99474a1da809e1c0f661ca566090c0e4a3999ba12e51c40caa4",
            "aa40e6280286618790dee77022eb42b2b9467fdb20081ede4cc70669d42a6489",
            "f56f1fbceebdf7b1ada7e6676b9bf3c1ef19089351ad97a7a907c147fce814df",
            "1c92b9c67f0e6d114770519bb91320864ed24b0cda3f9ceea1576b6e14b557b6",
            "9dea948c467d1853013bb16b2bcf87e3d6cf103d0263792a146ebec14c54ed56",
            "cfcf927e464e91da82ed41725619ba84912eb8d8af49478b0decf2275b59d047",
            "d28f01ed0af41ed2ab9a1f005e1fc2fec803acbec8af56192e3d706404749b87",
            "9435ad09aa055eaa1139206d4e9df137b33ca9672145706aa252bf1099f6607e"
        ]));
    });

    server.post('/getrawtransaction', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      let resp;
      if(req.body.params[1] && req.body.params[1] == true) {
        resp = {
          "hex": "0100000001bafe2175b9d7b3041ebac529056b393cf2997f7964485aa382ffa449ffdac02a000000008a473044022013d212c22f0b46bb33106d148493b9a9723adb2c3dd3a3ebe3a9c9e3b95d8cb00220461661710202fbab550f973068af45c294667fc4dc526627a7463eb23ab39e9b01410479be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8ffffffff01b0a86a00000000001976a91401b81d5fa1e55e069e3cc2db9c19e2e80358f30688ac00000000",
          "txid": "52309405287e737cf412fc42883d65a392ab950869fae80b2a5f1e33326aca46",
          "hash": "52309405287e737cf412fc42883d65a392ab950869fae80b2a5f1e33326aca46",
          "size": 223,
          "vsize": 223,
          "version": 1,
          "locktime": 0,
          "vin": [
              {
                  "txid": "2ac0daff49a4ff82a35a4864797f99f23c396b0529c5ba1e04b3d7b97521feba",
                  "vout": 0,
                  "scriptSig": {
                      "asm": "3044022013d212c22f0b46bb33106d148493b9a9723adb2c3dd3a3ebe3a9c9e3b95d8cb00220461661710202fbab550f973068af45c294667fc4dc526627a7463eb23ab39e9b[ALL] 0479be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8",
                      "hex": "473044022013d212c22f0b46bb33106d148493b9a9723adb2c3dd3a3ebe3a9c9e3b95d8cb00220461661710202fbab550f973068af45c294667fc4dc526627a7463eb23ab39e9b01410479be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8"
                  },
                  "sequence": 4294967295
              }
          ],
          "vout": [
              {
                  "value": 0.06990000,
                  "n": 0,
                  "scriptPubKey": {
                      "asm": "OP_DUP OP_HASH160 01b81d5fa1e55e069e3cc2db9c19e2e80358f306 OP_EQUALVERIFY OP_CHECKSIG",
                      "hex": "76a91401b81d5fa1e55e069e3cc2db9c19e2e80358f30688ac",
                      "reqSigs": 1,
                      "type": "pubkeyhash",
                      "addresses": [
                          "1A6Ei5cRfDJ8jjhwxfzLJph8B9ZEthR9Z"
                      ]
                  }
              }
          ],
          "blockhash": "0000000000000000015955e197fc362502a32f76290e5b5e5be822f9f161b3f3",
          "confirmations": 374,
          "time": 1483591778,
          "blocktime": 1483591778
        };
      } else {
        resp = '0200000002b0e5d57d7ceb9329622792eb77d68971527a27dbd164f83c31f232b300b2ce40000000006a47304402205a6b937be935b7ef3c7507e65ac34f8466551c52be62c4eb0cc9c3232ed42b6202205ba4b7b76c05e5f2a10f74086257950df12ab2fc046e9d8e42304eeb791aff2041210338e9690b132d13a209dd5d549e21da1fee5fd8b391a9a183bb643f3fef6db110ffffffff681bc3b7293b887eeba19beaab30765ec2b16712d9df5c153d38988973cb05c9000000006b483045022100eb8136cbecccf125021c13fc953e6d669d41842f189a69f2060d7b4e5bbeba380220331642c3de3e1b016a0bfff0aa9c3a45b19078aa571ed10d90254137b87e6dd84121028a91bd260272d6e05845f602386ef744ecd8ffb15b68933e59c27ca1637bc911ffffffff02f8240100000000001976a914b0ef8fc1b127ac562ed8158cd11b7ed261b28bab88acd5be3e0f000000001976a914efb008ccec12d06248b33b38df962290673f8f3788ac00000000';

      }

      res.send(JSON.stringify(resp));
    });

    server.post('/getreceivedbyaccount', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send('0.00000000');
    });

    server.post('/getreceivedbyaddress', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send('0.00000000');
    });

    server.post('/gettransaction', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({
          "amount" : 0.00000000,
          "fee" : 0.00000000,
          "confirmations" : 106670,
          "blockhash" : "000000008b630b3aae99b6fe215548168bed92167c47a2f7ad4df41e571bcb51",
          "blockindex" : 1,
          "blocktime" : 1396321351,
          "txid" : "5a7d24cd665108c66b2d56146f244932edae4e2376b561b3d396d5ae017b9589",
          "walletconflicts" : [
          ],
          "time" : 1396321351,
          "timereceived" : 1418924711,
          "bip125-replaceable" : "no",
          "details" : [
              {
                  "account" : "",
                  "address" : "mjSk1Ny9spzU2fouzYgLqGUD8U41iR35QN",
                  "category" : "send",
                  "amount" : -0.10000000,
                  "vout" : 0,
                  "fee" : 0.00000000
              },
              {
                  "account" : "doc test",
                  "address" : "mjSk1Ny9spzU2fouzYgLqGUD8U41iR35QN",
                  "category" : "receive",
                  "amount" : 0.10000000,
                  "vout" : 0
              }
          ],
          "hex" : "0100000001cde58f2e37d000eabbb60d9cf0b79ddf67cede6dba58732539983fa341dd5e6c010000006a47304402201feaf12908260f666ab369bb8753cdc12f78d0c8bdfdef997da17acff502d321022049ba0b80945a7192e631c03bafd5c6dc3c7cb35ac5c1c0ffb9e22fec86dd311c01210321eeeb46fd878ce8e62d5e0f408a0eab41d7c3a7872dc836ce360439536e423dffffffff0180969800000000001976a9142b14950b8d31620c6cc923c5408a701b1ec0a02088ac00000000"
      }));
    });

    server.post('/gettxout', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({
          "bestblock" : "00000000c92356f7030b1deeab54b3b02885711320b4c48523be9daa3e0ace5d",
          "confirmations" : 0,
          "value" : 0.00100000,
          "scriptPubKey" : {
              "asm" : "OP_DUP OP_HASH160 a11418d3c144876258ba02909514d90e71ad8443 OP_EQUALVERIFY OP_CHECKSIG",
              "hex" : "76a914a11418d3c144876258ba02909514d90e71ad844388ac",
              "reqSigs" : 1,
              "type" : "pubkeyhash",
              "addresses" : [
                  "mvCfAJSKaoFXoJEvv8ssW7wxaqRPphQuSv"
              ]
          },
          "version" : 1,
          "coinbase" : false
      }));
    });

    server.post('/gettxoutproof', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send("03000000394ab3f08f712aa0f1d26c5daa4040b50e96d31d4e8e3c130000000000000000\
      ca89aaa0bbbfcd5d1210c7888501431256135736817100d8c2cf7e4ab9c02b168115d455\
      04dd1418836b20a6cb0800000d3a61beb3859abf1b773d54796c83b0b937968cc4ce3c0f\
      71f981b2407a3241cb8908f2a88ac90a2844596e6019450f507e7efb8542cbe54ea55634\
      c87bee474ee48aced68179564290d476e16cff01b483edcd2004d555c617dfc08200c083\
      08ba511250e459b49d6a465e1ab1d5d8005e0778359c2993236c85ec66bac4bfd974131a\
      dc1ee0ad8b645f459164eb38325ac88f98c9607752bc1b637e16814f0d9d8c2775ac3f20\
      f85260947929ceef16ead56fcbfd77d9dc6126cce1b5aacd9f834690f7508ee2db2ab67d\
      382c5e738b1b6fe3fb079511952d33ec18c8440ef291eb8d3546a971ee4aa5e574b7be7f\
      5aff0b1c989b2059ae5a611c8ce5c58e8e8476246c5e7c6b70e0065f2a6654e2e6cf4efb\
      6ae19bf2548a7d9febf5b0aceaff28610922e1b9e23e52f650a4a11d2986c9c2b09bb168\
      a70a7d4ac16e4d389bc2868ee91da1837d2cd79288bdc680e9c35ebb3ddfd045d69d767b\
      164ec69d5db9f995c045d10af5bd90cd9d1116c3732e14796ef9d1a57fa7bb718c07989e\
      d06ff359bf2009eaf1b9e000c054b87230567991b447757bc6ca8e1bb6e9816ad604dbd6\
      0600");
    });

    server.post('/gettxoutsetinfo', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({
          "height" : 315293,
          "bestblock" : "00000000c92356f7030b1deeab54b3b02885711320b4c48523be9daa3e0ace5d",
          "transactions" : 771920,
          "txouts" : 2734587,
          "bytes_serialized" : 102629817,
          "hash_serialized" : "4753470fda0145760109e79b8c218a1331e84bb4269d116857b8a4597f109905",
          "total_amount" : 13131746.33839451
      }));
    });

    server.post('/getunconfirmedbalance', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send('0.00000000');
    });

    server.post('/getwalletinfo', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({
          "walletversion" : 60000,
          "balance" : 1.45060000,
          "txcount" : 17,
          "keypoololdest" : 1398809500,
          "keypoolsize" : 196,
          "unlocked_until" : 0
      }));
    });

    server.post('/help', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send('https://www.youtube.com/watch?v=ZNahS3OHPwA');
    });

    server.post('/importaddress', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({ result: null }));
    });

    server.post('/importmulti', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify([
        {
          "success": true
        },
        {
          "success": false,
          "error": {
          "code": -8,
          "message": "Internal must be set for hex scriptPubKey"
          }
        }
      ]));
    });

    server.post('/importprivkey', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({ result: null }));
    });

    server.post('/importprunedfunds', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({ result: null }));
    });

    server.post('/importwallet', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({ result: null }));
    });

    server.post('/keypoolrefill', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({ result: null }));
    });

    server.post('/listaccounts', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({
          "" : -2.73928803,
          "Refund from example.com" : 0.00000000,
          "doc test" : -498.45900000,
          "someone else's address" : 0.00000000,
          "someone else's address2" : 0.00050000,
          "test" : 499.97975293,
          "test account" : 0.00000000,
          "test label" : 0.48961280,
          "test1" : 1.99900000
      }));
    });

    server.post('/listaddressgroupings', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify([
          [
              [
                  "mgKgzJ7HR64CrB3zm1B4FUUCLtaSqUKfDb",
                  0.00000000
              ],
              [
                  "mnUbTmdAFD5EAg3348Ejmonub7JcWtrMck",
                  0.00000000,
                  "test1"
              ]
          ]
      ]));
    });

    server.post('/listbanned', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify([
        {
          "address": "83.84.25.82/32",
          "banned_until": 1487269503,
          "ban_created": 1478629503,
          "ban_reason": "node misbehaving"
        },
        {
          "address": "111.111.0.111/32",
          "banned_until": 1487791655,
          "ban_created": 1479151655,
          "ban_reason": "manually added"
        }
      ]));
    });

    server.post('/listlockunspent', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify([
          {
              "txid" : "ca7cb6a5ffcc2f21036879493db4530c0ce9b5bff9648f9a3be46e2dfc8e0166",
              "vout" : 0
          }
      ]));
    });

    server.post('/listreceivedbyaccount', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify([
          {
              "account" : "",
              "amount" : 0.19960000,
              "confirmations" : 53601
          },
          {
              "account" : "doc test",
              "amount" : 0.30000000,
              "confirmations" : 8991
          }
      ]));
    });

    server.post('/listreceivedbyaddress', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify([
          {
              "address" : "mnUbTmdAFD5EAg3348Ejmonub7JcWtrMck",
              "account" : "test1",
              "amount" : 1.99900000,
              "confirmations" : 55680,
              "label" : "test1",
              "txids" : [
                  "4d71a6127796766c39270881c779b6e05183f2bf35589261e9572436356f287f",
                  "997115d0cf7b83ed332e6c1f2e8c44f803c95ea43490c84ce3e9ede4b2e1605f"
              ]
          },
          {
              "involvesWatchonly" : true,
              "address" : "n3GNqMveyvaPvUbH469vDRadqpJMPc84JA",
              "account" : "someone else's address2",
              "amount" : 0.00050000,
              "confirmations" : 34714,
              "label" : "someone else's address2",
              "txids" : [
                  "99845fd840ad2cc4d6f93fafb8b072d188821f55d9298772415175c456f3077d"
              ]
          }
      ]));
    });

    server.post('/listsinceblock', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({
          "transactions" : [
              {
                  "account" : "doc test",
                  "address" : "mmXgiR6KAhZCyQ8ndr2BCfEq1wNG2UnyG6",
                  "category" : "receive",
                  "amount" : 0.10000000,
                  "vout" : 0,
                  "confirmations" : 76478,
                  "blockhash" : "000000000017c84015f254498c62a7c884a51ccd75d4dd6dbdcb6434aa3bd44d",
                  "blockindex" : 1,
                  "blocktime" : 1399294967,
                  "txid" : "85a98fdf1529f7d5156483ad020a51b7f3340e47448cf932f470b72ff01a6821",
                  "walletconflicts" : [
                  ],
                  "time" : 1399294967,
                  "timereceived" : 1418924714,
                  "bip125-replaceable": "no"
              },
              {
                  "involvesWatchonly" : true,
                  "account" : "someone else's address2",
                  "address" : "n3GNqMveyvaPvUbH469vDRadqpJMPc84JA",
                  "category" : "receive",
                  "amount" : 0.00050000,
                  "vout" : 0,
                  "confirmations" : 34714,
                  "blockhash" : "00000000bd0ed80435fc9fe3269da69bb0730ebb454d0a29128a870ea1a37929",
                  "blockindex" : 11,
                  "blocktime" : 1411051649,
                  "txid" : "99845fd840ad2cc4d6f93fafb8b072d188821f55d9298772415175c456f3077d",
                  "walletconflicts" : [
                  ],
                  "time" : 1418695703,
                  "timereceived" : 1418925580,
                  "bip125-replaceable": "no"
              }
          ],
          "lastblock" : "0000000000984add1a686d513e66d25686572c7276ec3e358a7e3e9f7eb88619"
      }));
    });

    server.post('/listtransactions', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify([
          {
              "involvesWatchonly" : true,
              "account" : "",
              "address" : "1GeDA9rRpqaCdsdkTzGtbajt6jPvn3pg2N",
              "category" : "send",
              "amount" : -3.45902877,
              "vout" : 0,
              "fee" : -0.00032890,
              "confirmations" : 29710,
              "blockhash" : "0000000000000000008b9cb38cd3105e75af94b3af79d0a59cbe4edb618fb814",
              "blockindex" : 1705,
              "blocktime" : 1463173519,
              "txid" : "9b32d4315ac4c5e0d3a5fb947b9a198d3641698badc820643a7df23081f99695e",
              "walletconflicts" : [
              ],
              "time" : 1418695703,
              "timereceived" : 1418925580,
      	"bip125-replaceable" : "no",
      	"abandoned": false
          }
      ]));
    });

    server.post('/listunspent', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify([
          {
              "txid" : "d54994ece1d11b19785c7248868696250ab195605b469632b7bd68130e880c9a",
              "vout" : 1,
              "address" : "mgnucj8nYqdrPFh2JfZSB1NmUThUGnmsqe",
              "account" : "test label",
              "scriptPubKey" : "76a9140dfc8bafc8419853b34d5e072ad37d1a5159f58488ac",
              "amount" : 0.00010000,
              "confirmations" : 6210,
              "spendable" : true,
              "sovable" : true
          }
      ]));
    });

    server.post('/lockunspent', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(true);
    });

    server.post('/move', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(true);
    });

    server.post('/ping', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify(null));
    });

    server.post('/preciousblock', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify(null));
    });

    server.post('/prioritisetransaction', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(true);
    });

    server.post('/pruneblockchain', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send('success');
    });

    server.post('/removeprunedfunds', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify(null));
    });

    server.post('/sendfrom', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send('f14ee5368c339644d3037d929bbe1f1544a532f8826c7b7288cb994b0b0ff5d8');
    });

    server.post('/sendmany', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send('ec259ab74ddff199e61caa67a26e29b13b5688dc60f509ce0df4d044e8f4d63d');
    });

    server.post('/sendrawtransaction', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send('f5a5ce5988cc72b9b90e8d1d6c910cda53c88d2175177357cc2f2cf0899fbaad');
    });

    server.post('/sendtoaddress', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send('a2a2eb18cb051b5fe896a32b1cb20b179d981554b6bd7c5a956e56a0eecb04f0');
    });

    server.post('/setaccount', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify(null));
    });

    server.post('/setban', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify(null));
    });

    server.post('/setexcessiveblock', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send('success');
    });

    server.post('/setnetworkactive', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify(null));
    });

    server.post('/settxfee', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(true);
    });

    server.post('/signmessage', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      let state = store.get('state');
      let accounts = state.wallet.accounts;
      let address = req.body.params[0];

      let privateKeyWIF = RavenCoin.returnPrivateKeyWIF(address, accounts);

      if(privateKeyWIF === undefined) {
        res.send("RVNBOX doesn't have the private key for that address");
        return false;
      } else if(privateKeyWIF === 'Received an invalid Ravencoin address as input.') {
        res.send(privateKeyWIF);
        return false;
      }

      let message = req.body.params[1];
      let signature = rvnbox.RavenCoin.signMessageWithPrivKey(privateKeyWIF, message);
      res.send(signature);
    });

    server.post('/signmessagewithprivkey', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      let privateKeyWIF = req.body.params[0];
      let signature = rvnbox.RavenCoin.signMessageWithPrivKey(privateKeyWIF, req.body.params[1]);

      res.send(signature.toString('base64'));
    });


    server.post('/signrawtransaction', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({
          "hex" : "01000000011da9283b4ddf8d89eb996988b89ead56cecdc44041ab38bf787f1206cd90b51e000000006a47304402200ebea9f630f3ee35fa467ffc234592c79538ecd6eb1c9199eb23c4a16a0485a20220172ecaf6975902584987d295b8dddf8f46ec32ca19122510e22405ba52d1f13201210256d16d76a49e6c8e2edc1c265d600ec1a64a45153d45c29a2fd0228c24c3a524ffffffff01405dc600000000001976a9140dfc8bafc8419853b34d5e072ad37d1a5159f58488ac00000000",
          "complete" : true
      }));
    });

    server.post('/stop', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send('Ravencoin server stopping');
    });

    server.post('/submitblock', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify(null));
    });

    server.post('/validateaddress', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify({
          "isvalid": true,
          "address": "17fshh33qUze2yifiJ2sXgijSMzJ2KNEwu",
          "scriptPubKey": "76a914492ae280d70af33acf0ae7cd329b961e65e9cbd888ac",
          "ismine": true,
          "iswatchonly": false,
          "isscript": false,
          "pubkey": "0312eeb9ae5f14c3cf43cece11134af860c2ef7d775060e3a578ceec888acada31",
          "iscompressed": true,
          "account": "Test"
      }));
    });

    server.post('/verifychain', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(true);
    });

    server.post('/verifymessage', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      let address;
      let verified;
      try {
        address = rvnbox.Address.toLegacyAddress(req.body.params[0]);
      }
      catch (e) {
        address = e.message;
      }
      if(address === 'Received an invalid Ravencoin address as input.') {
        res.send(address);
        return false;
      }

      try {
        verified = rvnbox.RavenCoin.verifyMessage(address, req.body.params[1], req.body.params[2])
      }
      catch (e) {
        verified = e.message;
      }
      res.send(verified);
    });

    server.post('/verifytxoutproof', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify([
      "f20e44c818ec332d95119507fbe36f1b8b735e2c387db62adbe28e50f7904683"
      ]));
    });

    server.post('/walletlock', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify(null));
    });

    server.post('/walletpassphrase', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify(null));
    });
    server.post('/walletpassphrasechange', (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      res.send(JSON.stringify(null));
    });

    server.listen(port, () => {console.log('listening on port 8767,')});
  }
}

export default Server;
