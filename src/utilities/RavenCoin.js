import Address from '../models/Address';

import Ravencoin from 'ravencoinjs-lib';
let RVNBOXCli = require('rvnbox/lib/rvnboxsdk').default;
let rvnbox = new RVNBOXCli();
import underscore from 'underscore';

class RavenCoin {
  static returnPrivateKeyWIF(pubAddress, accounts) {
    let address = rvnbox.Address.toLegacyAddress(pubAddress);
    let privateKeyWIF;

    let errorMsg = '';
    accounts.forEach((account, index) => {
      account.previousAddresses.forEach((addy, i) => {
        if(address === addy) {
          privateKeyWIF = account.privateKeyWIF
        }
      });
    });

    if(errorMsg !== '') {
      return errorMsg;
    } else {
      return privateKeyWIF;
    }
  }

  static createMultiSig(nrequired, keys, addresses, wallet) {
    let keyPairs = [];
    let pubKeys = [];
    keys.forEach((key, index) => {
      if(key.toString('hex').length === 66) {
        pubKeys.push(key);
      } else {
        let privkeyWIF = RavenCoin.returnPrivateKeyWIF(key, addresses);
        keyPairs.push(rvnbox.HDNode.fromWIF(privkeyWIF, wallet.network))
      }
    })

    keyPairs.forEach((key, index) => {
      pubKeys.push(key.getPublicKeyBuffer());
    })
    pubKeys.map((hex) => { return Buffer.from(hex, 'hex') })

    let redeemScript = Ravencoin.script.multisig.output.encode(nrequired, pubKeys)
    let scriptPubKey = Ravencoin.script.scriptHash.output.encode(Ravencoin.crypto.hash160(redeemScript))
    let address = Ravencoin.address.fromOutputScript(scriptPubKey)

    return {
      address: address,
      redeemScript: redeemScript
    };
  }

  static createAccounts(config) {
    let language = config.language;

    if(!language || (language !== 'chinese_simplified' && language !== 'chinese_traditional' && language !== 'english' && language !== 'french' && language !== 'italian' && language !== 'japanese' && language !== 'korean' && language !== 'spanish')) {
      config.language = 'english';
    }

    // create root seed buffer
    let rootSeedBuffer = rvnbox.Mnemonic.toSeed(config.mnemonic, config.password);

    // create master hd node
    let masterHDNode = rvnbox.HDNode.fromSeed(rootSeedBuffer, config.network);

    let HDPath = `m/${config.HDPath.purpose}/${config.HDPath.coinCode}`

    let accounts = [];

    for (let i = 0; i < config.totalAccounts; i++) {
      // create accounts
      let account = masterHDNode.derivePath(`${HDPath.replace(/\/$/, "")}/${i}'`);
      let external = account.derivePath("0")
      let internal = account.derivePath("1")
      account.addresses = rvnbox.HDNode.createAccount([external, internal]);
      accounts.push(account);
    };

    return accounts;
  }
}

export default RavenCoin;
