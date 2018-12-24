import { connect } from 'react-redux'
import ImportAndExport from '../components/ImportAndExport';
import {
  toggleVisibility,
  toggleExportCopied,
  importStore
} from '../actions/ImportAndExportActions';

const mapStateToProps = state => {
  return {
    state: state
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    toggleVisibility: () => {
      dispatch(toggleExportCopied(false));
      dispatch(toggleVisibility());
    },
    toggleExportCopied: (val) => {
      dispatch(toggleExportCopied(val));
    },
    importStore: (store) => {
      let parsedStore = JSON.parse(store);
      let seed = rvnbox.Mnemonic.toSeed(parsedStore.configuration.wallet.mnemonic);
      let hdnode = rvnbox.HDNode.fromSeed(seed);
      parsedStore.wallet.accounts.forEach((account, index) => {
        let ac = rvnbox.HDNode.derivePath(hdnode, `m/44'/175'/${index}'`);
        let external = rvnbox.HDNode.derivePath(ac, `0`);
        let internal = rvnbox.HDNode.derivePath(ac, `1`);

        let a = rvnbox.HDNode.createAccount([external, internal]);
        account.addresses = a;
      })
      dispatch(importStore(parsedStore));
    }
  }
}
 
const ImportAndExportContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ImportAndExport)
 
export default ImportAndExportContainer
