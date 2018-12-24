import React, { Component } from 'react';
import {
  Redirect
} from 'react-router-dom';
import '../styles/account.scss';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faAsterisk from '@fortawesome/fontawesome-free-solid/faAsterisk';
import faKey from '@fortawesome/fontawesome-free-solid/faKey';

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  handleRedirect(e) {
    this.props.showAccountModal(this.props.account)
    // if(e.target.nodeName === 'BUTTON' || e.target.nodeName === 'path') {
    //   this.props.showAccountModal(this.props.account)
    // } else {
    //   this.setState({
    //     redirect: true
    //   });
    // }
  }

  render() {

    let address;
    if(this.props.displayRvnaddr) {
      address = <span>{rvnbox.Address.toLegacyAddress(this.props.account.addresses.getChainAddress(0))}</span>;
    } else {
      address = <span>{this.props.account.addresses.getChainAddress(0)}</span>;
    }

    let coinbase;
    if(this.props.account.index === 0) {
      coinbase = <span> <FontAwesomeIcon icon={faAsterisk} /> Coinbase</span>
    }

    let index = this.props.account.index;

    if(this.state.redirect) {
      return (<Redirect to={{
        pathname: `/accounts/${index}/transactions`
      }} />)
    }

    let HDPath = `m/${this.props.configuration.HDPath.purpose}/${this.props.configuration.HDPath.coinCode}`;
    let addressHeight = this.props.account.addresses.chains[0].find(this.props.account.addresses.getChainAddress(0))
    return (
      <tr className="Account">
        <td className='important'><span className='subheader'>ADDRESS {coinbase}</span> <br />{address} <br /><span className='hdPath'>{HDPath}/{index}&rsquo;/0/{addressHeight}</span></td>
        <td className='important'><span className='subheader'>BALANCE</span> <br />{rvnbox.RavenCoin.toRavencoin(this.props.account.balance)} RVN</td>
        <td><span className='subheader'>TX COUNT</span> <br />{this.props.account.txCount}</td>
        <td><span className='subheader'>ACCOUNT</span> <br />{index}</td>
        <td><button onClick={this.handleRedirect.bind(this)} className="pure-button openModal"><FontAwesomeIcon className="openModal" icon={faKey} /></button></td>
      </tr>
    );
  }
}

export default Account;
