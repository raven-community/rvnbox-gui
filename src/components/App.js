// react imports
import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  Redirect,
  NavLink
} from 'react-router-dom';

import underscore from 'underscore';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faUser from '@fortawesome/fontawesome-free-solid/faUser';
import faCubes from '@fortawesome/fontawesome-free-solid/faCubes';
import faQrcode from '@fortawesome/fontawesome-free-solid/faQrcode';
import faCheckCircle from '@fortawesome/fontawesome-free-solid/faCheckCircle';
import faUpload from '@fortawesome/fontawesome-free-solid/faUpload';
import faDownload from '@fortawesome/fontawesome-free-solid/faDownload';
import faCog from '@fortawesome/fontawesome-free-solid/faCog';

import WalletContainer from '../containers/WalletContainer'
import BlocksContainer from '../containers/BlocksContainer';
import BlockContainer from '../containers/BlockContainer';
import AddressContainer from '../containers/AddressContainer';
import AccountDetailsContainer from '../containers/AccountDetailsContainer';
import TransactionContainer from '../containers/TransactionContainer';
import SignAndVerifyContainer from '../containers/SignAndVerifyContainer'
import ImportAndExportContainer from '../containers/ImportAndExportContainer'
import ConvertContainer from '../containers/ConvertContainer';
import StatusBarContainer from '../containers/StatusBarContainer';
import ExplorerContainer from '../containers/ExplorerContainer'

// custom components
import Configuration from '../components/Configuration';

// utilities
import Miner from '../utilities/Miner';
import reduxStore from '../utilities/ReduxStore'

// css
import '../styles/theme.scss';

import { Provider } from 'react-redux'
import { createStore } from 'redux'

// redux actions
import {
  toggleVisibility
} from '../actions/ImportAndExportActions';
//
// const unsubscribe = reduxStore.subscribe(() =>{
//   console.log(JSON.stringify(reduxStore.getState(), null, 2))
//   console.log('*********************************************');
// })

// stop listening to state updates
// unsubscribe()

class App extends Component {

  constructor(props) {
    super(props);
    // Set up default redux store
    Miner.setUpReduxStore()
    Miner.createAccounts()
    Miner.createCoinbaseTx();
    Miner.mineBlock();
  }

  handlePathMatch(path) {
    if(path === '/wallet' || path === '/blocks' || path === '/transactions' || path === '/convert' || path === '/signandverify' || path === '/configuration/wallet') {
      return true;
    } else {
      return false;
    }
  }

  showImport() {
    reduxStore.dispatch(toggleVisibility('import'));
  }

  showExport() {
    reduxStore.dispatch(toggleVisibility('export'));
  }

  render() {

    const pathMatch = (match, location) => {
      if (!match) {
        return false
      }
      return this.handlePathMatch(match.path);
    }

    const AddressPage = (props) => {
      return (
        <Account
          match={props.match}
        />
      );
    };

    const TransactionsPage = (props) => {
      return (
        <TransactionsDisplay
          match={props.match}
        />
      );
    };

    const ConfigurationPage = (props) => {
      return (
        <Configuration
          match={props.match}
        />
      );
    };

    let chainlength = reduxStore.getState().blockchain.chain.length;

    return (
      <Provider store={reduxStore}>
        <Router>
          <div className="header main-header">
            <div className="pure-menu pure-menu-horizontal">
              <Link className="pure-menu-heading header-logo" to="/wallet">
                <img src='assets/logo.png' /> <br />RvnBox
              </Link>
              <ul className="pure-menu-list">

                <li className="pure-menu-item">
                  <NavLink
                    isActive={pathMatch}
                    activeClassName="pure-menu-selected"
                    className="pure-menu-link"
                    to="/wallet">
                    <FontAwesomeIcon icon={faUser} /> Wallet
                  </NavLink>
                </li>
                <li className="pure-menu-item">
                  <NavLink
                    isActive={pathMatch}
                    activeClassName="pure-menu-selected"
                    className="pure-menu-link"
                    to="/blocks">
                    <FontAwesomeIcon icon={faCubes} /> Blocks
                  </NavLink>
                </li>
                <li className="pure-menu-item">
                  <NavLink
                    isActive={pathMatch}
                    activeClassName="pure-menu-selected"
                    className="pure-menu-link"
                    to="/convert">
                    <FontAwesomeIcon icon={faQrcode} /> Convert
                  </NavLink>
                </li>
                <li className="pure-menu-item">
                  <NavLink
                    isActive={pathMatch}
                    activeClassName="pure-menu-selected"
                    className="pure-menu-link"
                    to="/signandverify">
                    <FontAwesomeIcon icon={faCheckCircle} /> Sign &amp; Verify
                  </NavLink>
                </li>
              </ul>
              <ul className="pure-menu-list right">
                <li className="pure-menu-item Explorer">
                  <ExplorerContainer />
                </li>
                <li className="pure-menu-item">
                  <button className="importAndExportBtn" onClick={this.showExport.bind(this)}>
                    <FontAwesomeIcon icon={faUpload} />
                  </button>
                </li>
                <li className="pure-menu-item">
                  <button className="importAndExportBtn" onClick={this.showImport.bind(this)}>
                    <FontAwesomeIcon icon={faDownload} />
                  </button>
                </li>
                <li className="pure-menu-item">
                  <NavLink
                    isActive={pathMatch}
                    activeClassName="pure-menu-selected"
                    className="pure-menu-link"
                    to="/configuration/wallet">
                    <FontAwesomeIcon icon={faCog} />
                  </NavLink>
                </li>
              </ul>
            </div>
            <StatusBarContainer />
            <ImportAndExportContainer />
            <Switch>
              <Route exact path="/blocks" component={BlocksContainer}/>
              <Route path="/blocks/:block_id/transactions/:transaction_id" component={TransactionContainer}/>
              <Route path="/blocks/:block_id" component={BlockContainer}/>
              <Route path="/accounts/:account_id" component={AccountDetailsContainer}/>
              <Route path="/addresses/:address_id" component={AddressContainer}/>
              <Route path="/convert" component={ConvertContainer}/>
              <Route path="/signandverify" component={SignAndVerifyContainer}/>
              <Route path="/configuration" component={ConfigurationPage}/>
              <Route path="/wallet" component={WalletContainer}/>
              <Redirect from='*' to='/wallet' />
            </Switch>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
