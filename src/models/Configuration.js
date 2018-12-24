class Configuration {
  constructor() {
    this.wallet = {
      autogenerateHDMnemonic: true,
      autogenerateHDPath: true,
      displayRvnaddr: true,
      displayTestnet: false,
      usePassword: false,
      entropy: 16,
      network: 'ravencoin',
      mnemonic: '',
      totalAccounts: 10,
      HDPath: {
        masterKey: "m",
        purpose: "44'",
        coinCode: "175'",
        account: "0'",
        change: "0",
        address_index: "0"
      },
      password: '',
      language: 'english',
      mnemonicValidationMsg: '',
      exchangeRate: '',
      exchangeCurrency: 'USD'
    };
  }
}

export default Configuration;
