import RavenCoin from '../src/utilities/RavenCoin';
import chai from 'chai';
let assert = chai.assert;
let fixtures = require('./fixtures/RavenCoin.json')
let RVNBOXCli = require('rvnbox/lib/rvnboxsdk').default;
let rvnbox = new RVNBOXCli();

describe('price conversion', () => {
  it('should convert Ravencoin to Satoshis', () => {
    let ravencoin = 12.5;
    let satoshis = rvnbox.RavenCoin.toSatoshi(ravencoin);
    assert.equal(satoshis, 1250000000);
  });

  it('should convert Satoshis to Ravencoin', () => {
    let satoshis = 1250000000;
    let ravencoin = rvnbox.RavenCoin.toRavencoin(satoshis);
    assert.equal(ravencoin, 12.5);
  });
});

describe('address conversion', () => {
  it('should convert address to Legacy', () => {
    let base58Check = fixtures.base58check;
    let legacyaddr = rvnbox.Address.toLegacyAddress(base58Check);
    assert.equal(legacyaddr, fixtures.legacyaddr);
  });
});

describe('address format detection', () => {
  it('should detect Legacy address', () => {
    let base58Check = fixtures.base58check;
    let isBase58Check = rvnbox.Address.isLegacyAddress(base58Check);
    assert.equal(isBase58Check, true);
  });
});

describe('network detection', () => {
  it('should detect mainnet address', () => {
    let mainnet = fixtures.base58check;
    let isMainnet = rvnbox.Address.isMainnetAddress(mainnet);
    assert.equal(isMainnet, true);
  });

  it('should detect testnet address', () => {
    let testnet = fixtures.testnet;
    let isTestnet = rvnbox.Address.isTestnetAddress(testnet);
    assert.equal(isTestnet, true);
  });
});

describe('address type detection', () => {
  it('should detect P2PKH address', () => {
    let P2PKH = fixtures.base58check;
    let isP2PKH = rvnbox.Address.isP2PKHAddress(P2PKH);
    assert.equal(isP2PKH, true);
  });

  it('should detect P2SH address', () => {
    let P2SH = fixtures.P2SH;
    let isP2SH = rvnbox.Address.isP2SHAddress(P2SH);
    assert.equal(isP2SH, true);
  });
});

describe('return address format', () => {
  it('should return Legacy address', () => {
    let base58Check = fixtures.base58check;
    let isBase58Check = rvnbox.Address.detectAddressFormat(base58Check);
    assert.equal(isBase58Check, 'legacy');
  });
});

describe('return address network', () => {
  it('should return mainnet', () => {
    let mainnet = fixtures.base58check;
    let isMainnet = rvnbox.Address.detectAddressNetwork(mainnet);
    assert.equal(isMainnet, 'mainnet');
  });

  it('should return testnet', () => {
    let testnet = fixtures.testnet;
    let isTestnet = rvnbox.Address.detectAddressNetwork(testnet);
    assert.equal(isTestnet, 'testnet');
  });
});

describe('return address type', () => {
  it('should return P2PKH', () => {
    let P2PKH = fixtures.base58check;
    let isP2PKH = rvnbox.Address.detectAddressType(P2PKH);
    assert.equal(isP2PKH, 'p2pkh');
  });

  it('should return P2SH', () => {
    let P2SH = fixtures.P2SH;
    let isP2SH = rvnbox.Address.detectAddressType(P2SH);
    assert.equal(isP2SH, 'p2sh');
  });
});

describe('generate specific length mnemonic', () => {
  it('should generate a 12 word mnemonic', () => {
    let mnemonic = rvnbox.Mnemonic.generate(128);
    assert.lengthOf(mnemonic.split(' '), 12);
  });

  it('should generate a 15 word mnemonic', () => {
    let mnemonic = rvnbox.Mnemonic.generate(160);
    assert.lengthOf(mnemonic.split(' '), 15);
  });

  it('should generate an 18 word mnemonic', () => {
    let mnemonic = rvnbox.Mnemonic.generate(192);
    assert.lengthOf(mnemonic.split(' '), 18);
  });

  it('should generate an 21 word mnemonic', () => {
    let mnemonic = rvnbox.Mnemonic.generate(224);
    assert.lengthOf(mnemonic.split(' '), 21);
  });

  it('should generate an 24 word mnemonic', () => {
    let mnemonic = rvnbox.Mnemonic.generate(256);
    assert.lengthOf(mnemonic.split(' '), 24);
  });
});

describe('create 512 bit HMAC-SHA512 root seed', () => {
  let rootSeed = rvnbox.Mnemonic.toSeed(rvnbox.Mnemonic.generate(256), 'password');
  it('should create 64 byte root seed', () => {
    assert.equal(rootSeed.byteLength, 64);
  });

  it('should create root seed hex encoded', () => {
    assert.lengthOf(rootSeed.toString('hex'), 128);
  });
});

describe('create master private key', () => {
  it('should create 32 byte chain code', () => {
    let rootSeed = rvnbox.Mnemonic.toSeed(rvnbox.Mnemonic.generate(256), 'password');
    let masterkey = rvnbox.HDNode.fromSeed(rootSeed);
    assert.equal(masterkey.chainCode.byteLength, 32);
  });
});

describe('sign and verify messages', () => {
  it('should sign a message and produce an 88 character signature in base64 encoding', () => {

    let privateKeyWIF = '5KYZdUEo39z3FPrtuX2QbbwGnNP5zTd7yyr2SC1j299sBCnWjss'
    let message = 'This is an example of a signed message.'

    let signature = rvnbox.RavenCoin.signMessageWithPrivKey(privateKeyWIF, message)
    assert.equal(signature.length, 88);
  });

  it('should verify a valid signed message', () => {

    let address = '1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN'
    let signature = 'HJLQlDWLyb1Ef8bQKEISzFbDAKctIlaqOpGbrk3YVtRsjmC61lpE5ErkPRUFtDKtx98vHFGUWlFhsh3DiW6N0rE'
    let message = 'This is an example of a signed message.'

    assert.equal(rvnbox.RavenCoin.verifyMessage(address, signature, message), true);
  });

  it('should not verify a invalid signed message', () => {

    let address = '1HZwkjkeaoZfTSaJxDw6aKkxp45agDiEzN'
    let signature = 'HJLQlDWLyb1Ef8bQKEISzFbDAKctIlaqOpGbrk3YVtRsjmC61lpE5ErkPRUFtDKtx98vHFGUWlFhsh3DiW6N0rE'
    let message = 'This is an example of an invalid message.'

    assert.equal(rvnbox.RavenCoin.verifyMessage(address, signature, message), false);
  });
});
