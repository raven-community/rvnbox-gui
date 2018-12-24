import React, { Component } from 'react';
import RavenCoin from '../utilities/RavenCoin'
import {
  withRouter,
  Redirect,
  Route,
  NavLink
} from 'react-router-dom';

import {
  FormattedNumber
} from 'react-intl';

import '../styles/accountDetails.scss';

import AccountTransactionsContainer from '../containers/AccountTransactionsContainer';
import AccountSendContainer from '../containers/AccountSendContainer';
import AccountReceiveContainer from '../containers/AccountReceiveContainer';
import underscore from 'underscore';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faArrowLeft from '@fortawesome/fontawesome-free-solid/faArrowLeft';
import faIdCard from '@fortawesome/fontawesome-free-solid/faIdCard';
import faExchangeAlt from '@fortawesome/fontawesome-free-solid/faExchangeAlt';
import faQrcode from '@fortawesome/fontawesome-free-solid/faQrcode';
import faChevronUp from '@fortawesome/fontawesome-free-solid/faChevronUp';

import '../styles/accountDetails.scss';

class AccountDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {
      redirect: false
    };
  }

  handlePathMatch(path) {
    if(path === '/wallet' || path === '/blocks' || path === '/transactions' || path === '/convert' || path === '/signandverify' || path === '/configuration/wallet') {
      return true;
    } else {
      return false;
    }
  }

  render() {
    const pathMatch = (match, location) => {
      if (!match) {
        return false
      }
      return true;
      // return this.handlePathMatch(match.path);
    }

    let account = underscore.findWhere(this.props.wallet.accounts, {index: +this.props.match.params.account_id});
    return (
      <div className="AccountDetails">
        <div className="pure-menu pure-menu-horizontal">
          <ul className="pure-menu-list">
            <li className="pure-menu-item">
              <NavLink
                to={`/`}
                className="pure-menu-link">
                <FontAwesomeIcon icon={faArrowLeft} /> Back
              </NavLink>
            </li>
            <li className="pure-menu-item account">
              <FontAwesomeIcon icon={faIdCard} /> ACCOUNT {account.index}
            </li>
          </ul>
          <ul className="pure-menu-list right">
            <li className="pure-menu-item">
              <NavLink
                isActive={pathMatch}
                activeClassName="pure-menu-selected"
                to={`/accounts/${account.index}/transactions`}
                className="pure-menu-link">
                <FontAwesomeIcon icon={faExchangeAlt} /> TRANSACTIONS
              </NavLink>
            </li>
            <li className="pure-menu-item">
              <NavLink
                isActive={pathMatch}
                activeClassName="pure-menu-selected"
                to={`/accounts/${account.index}/receive`}
                className="pure-menu-link">
                <FontAwesomeIcon icon={faQrcode} /> RECEIVE
              </NavLink>
            </li>
            <li className="pure-menu-item">
              <NavLink
                isActive={pathMatch}
                activeClassName="pure-menu-selected"
                to={`/accounts/${account.index}/send`}
                className="pure-menu-link">
                <FontAwesomeIcon icon={faChevronUp} /> SEND
              </NavLink>
            </li>
          </ul>
        </div>
        <div className="pure-g AccountDetailsHeader">
          <div className="pure-u-1-4">
            <p className='subheader'>Balance</p>
            <p className='balance'><FormattedNumber value={rvnbox.RavenCoin.toRavencoin(account.balance) * this.props.configuration.exchangeRate} style="currency" currency={this.props.configuration.exchangeCurrency} /></p>
            <p className='subbalance'>{rvnbox.RavenCoin.toRavencoin(account.balance)} RVN</p>

          </div>
          <div className="pure-u-1-4">
            <p className='subheader'>Rate</p>
            <p className='balance'><FormattedNumber value={this.props.configuration.exchangeRate} style="currency" currency={this.props.configuration.exchangeCurrency} /></p>
            <p className='subbalance'>1 RVN</p>
          </div>
          <div className="pure-u-1-4">
            <p className='subheader'>Received</p>
            <p className='balance'><span className="plus">+</span> <FormattedNumber value={rvnbox.RavenCoin.toRavencoin(account.received) * this.props.configuration.exchangeRate} style="currency" currency={this.props.configuration.exchangeCurrency} /></p>
            <p className='subbalance'>{rvnbox.RavenCoin.toRavencoin(account.received)} RVN</p>
          </div>
          <div className="pure-u-1-4">
            <p className='subheader'>Sent</p>
            <p className='balance'><span className="minus">-</span> <FormattedNumber value={rvnbox.RavenCoin.toRavencoin(account.sent) * this.props.configuration.exchangeRate} style="currency" currency={this.props.configuration.exchangeCurrency} /></p>
            <p className='subbalance'>{rvnbox.RavenCoin.toRavencoin(account.sent)} RVN</p>
          </div>
        </div>
        <Route path="/accounts/:account_id/transactions" component={AccountTransactionsContainer}/>
        <Route path="/accounts/:account_id/receive" component={AccountReceiveContainer}/>
        <Route path="/accounts/:account_id/send" component={AccountSendContainer}/>
      </div>
    );
  }
}

export default withRouter(AccountDetails);
