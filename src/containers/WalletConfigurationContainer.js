import { connect } from 'react-redux'
import WalletConfiguration from '../components/WalletConfiguration'
import RavenCoin from '../utilities/RavenCoin';
import {
  toggleWalletConfig,
  updateWalletConfig,
  updateStore,
  setExchangeRate
} from '../actions/ConfigurationActions';

import {
  createBlockchain
} from '../actions/BlockchainActions';

import {
  resetWallet,
  createAccount
} from '../actions/WalletActions';

import {
  createMempool
} from '../actions/MempoolActions';

const mapStateToProps = (state) => {
  return {
    configuration: state.configuration
  }
}
 
const mapDispatchToProps = (dispatch) => {
  return {
    handleConfigToggle: (e) => {
      let prop = e.target.id;
      let checked = e.target.checked;

      dispatch(toggleWalletConfig(prop, checked))
    },
    handleConfigChange: (e) => {
      let prop = e.target.id;
      let value = e.target.value;
      dispatch(updateWalletConfig(prop, value))
      if(prop === 'exchangeCurrency') {
        dispatch(setExchangeRate());
      }
    },
    handleEntropySliderChange: (value) => {
      dispatch(updateWalletConfig('entropy', value))
    },
    resetRvnbox: (configuration) => {
      configuration.mnemonic = configuration.newMnemonic;
      if(configuration.autogenerateHDMnemonic) {
        // create a random mnemonic w/ user provided entropy size
        let randomBytes = rvnbox.Crypto.randomBytes(configuration.entropy);
        configuration.mnemonic = rvnbox.Mnemonic.fromEntropy(randomBytes, rvnbox.Mnemonic.wordLists()[configuration.language]);
      }

      let accounts = RavenCoin.createAccounts(configuration);

      dispatch(resetWallet());
      dispatch(updateWalletConfig('mnemonic', configuration.mnemonic));
      dispatch(updateWalletConfig('HDPath', configuration.HDPath));
      dispatch(createBlockchain());
      dispatch(createMempool());
      dispatch(setExchangeRate());

      accounts.forEach((account, index) => {
        let xpriv = rvnbox.HDNode.toXPriv(account);
        let xpub = rvnbox.HDNode.toXPub(account);

        let formattedAccount = {
          addresses: account.addresses,
          title: '',
          index: index,
          privateKeyWIF:  rvnbox.HDNode.toWIF(account),
          xpriv: xpriv,
          xpub: xpub
        };
        dispatch(createAccount(formattedAccount));
      });
      dispatch(updateStore());
    }
  }
}
 
const WalletConfigurationContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletConfiguration)
 
export default WalletConfigurationContainer
