import React, { Component } from 'react';
import underscore from 'underscore';
import moment from 'moment';
import {
  withRouter,
  Redirect
} from 'react-router-dom';

import '../styles/accountTransactions.scss';

class AccountTransactions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: false
    };
  }

  handlexTransactionDetails(transaction) {
    this.setState({
      transaction: transaction,
      redirect: true
    })
  }

  render() {
    if (this.state.redirect) {
      return (<Redirect to={{
        pathname: `/blocks/0/transactions/${this.state.transaction.hash}`
      }} />)
    }

    let a = rvnbox.Address();
    let script = rvnbox.Script;
    let ecpair = rvnbox.ECPair;
    let blocks = [];
    let account = underscore.findWhere(this.props.wallet.accounts, {index: +this.props.match.params.account_id});
    this.props.blockchain.chain.forEach((block, indx) => {
      block.transactions.forEach((tx) => {

        account.addresses.chains.forEach((chain, indx) => {
          chain.addresses.forEach((addy, ind) => {
            if(this.props.configuration.displayRvnaddr) {
              addy = rvnbox.Address.toLegacyAddress(addy);
            }

            tx.inputs.forEach((input) => {
              if(input.scriptSig) {
                let chunksIn = script.decompileHex(input.scriptSig.hex);
                let address = ecpair.fromPublicKeyBuffer(chunksIn[1]).getAddress();

                if(address === addy) {
                  blocks.push(block)
                }
              }
            })

            tx.outputs.forEach((output) => {
              let address = output.scriptPubKey.addresses[0];

              if(address === addy) {
                blocks.push(block)
              }
            })
          });
        });
      })
    });
    let blocksMarkup = [];
    blocks.forEach((block, x) => {
      let blockMarkup =
        <table key={x} className="pure-table">
          <tbody onClick={this.handlexTransactionDetails.bind(this, {hash: '4a335a59f2a76c94f3de9fe365f97408bd9d225e4b7f4998c4f08f040f167f9c'})}>
            <tr>
              <th colSpan="2" className='important'>{moment(block.timestamp).format('MMMM Do YYYY')}</th>
              <th>0.507 RVN</th>
            </tr>
            <tr>
              <td className='important'>{moment(Date.now()).format('h:mm:ss a')}</td>
              <td>qrruxutvg8s76dd3w7r5c0efy5nru609dyzsecpsxz</td>
              <td><span className="minus">-</span> 0.00171852</td>
            </tr>
            <tr>
              <td className='important'>{moment(Date.now()).format('h:mm:ss a')}</td>
              <td>qrruxutvg8s76dd3w7r5c0efy5nru609dyzsecpsxz</td>
              <td><span className="plus">+</span> 16.47640775</td>
            </tr>
          </tbody>
        </table>;
        blocksMarkup.push(blockMarkup);
    })

    return (
      <div className="AccountTransactions pure-g">
        <div className="pure-u-1-1">
          <h2>Transactions</h2>
          {blocksMarkup}
        </div>
      </div>
    );
  }
}

export default AccountTransactions;
