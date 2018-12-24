import React, { Component } from 'react';
import RavenCoin from '../utilities/RavenCoin';
import QRCode from 'qrcode.react';

import '../styles/convert.scss';

class Convert extends Component {
  constructor(props) {
    super(props);
    this.props.createConvert();
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  isXPriv(inputValue) {
    let node = rvnbox.HDNode.fromXPriv(inputValue);

    let wif = rvnbox.HDNode.toWIF(node);
    this.props.updateConvertValue('privateKeyWIF', wif);

    let xpriv = inputValue;
    this.props.updateConvertValue('xpriv', xpriv);

    let xpub = rvnbox.HDNode.toXPub(node);
    this.props.updateConvertValue('xpub', xpub);

    let base58Check = rvnbox.HDNode.toLegacyAddress(node);
    this.props.updateConvertValue('base58Check', base58Check);
  }

  isXPub(inputValue) {
    let node = rvnbox.HDNode.fromXPub(inputValue);

    let xpub = inputValue;
    this.props.updateConvertValue('xpub', xpub);

    let base58Check = rvnbox.HDNode.toLegacyAddress(node);
    this.props.updateConvertValue('base58Check', base58Check);
  }

  isWIF(inputValue) {
    let ecpair = rvnbox.ECPair.fromWIF(inputValue);

    let wif = inputValue;
    this.props.updateConvertValue('privateKeyWIF', wif);

    let base58Check = rvnbox.ECPair.toLegacyAddress(ecpair);
    this.props.updateConvertValue('base58Check', base58Check);
  }

  isOther(inputValue) {

    let base58Check = rvnbox.Address.toLegacyAddress(inputValue);
    this.props.updateConvertValue('base58Check', base58Check);
  }

  convert(e) {
    let inputValue = e.target.value;
    let keyPair = '';
    let xpriv = this.props.convert.xpriv;
    let xpub = this.props.convert.xpub;
    let base58Check = this.props.convert.base58Check;
    let error = this.props.convert.error;
    let errorMsg = this.props.convert.errorMsg;
    let privateKeyWIF = this.props.convert.privateKeyWIF;
    this.props.updateConvertValue('inputValue', inputValue);
    this.props.updateConvertValue('error', null);
    this.props.updateConvertValue('errorMsg', '');

    try {
      this.isXPriv(inputValue)
    }
    catch (e) {
      try {
        this.isXPub(inputValue)
      }
      catch (e) {
        try {
          this.isWIF(inputValue)
        }
        catch (e) {
          try {
            this.isOther(inputValue)
          }
          catch (e) {
          console.log('eror', e)
          }
        }
      }
    }
  }

  render() {
    let conversion;
    let extended;
    let xpub;
    let privateKeyWIF;
    if(this.props.convert.base58Check !== '') {
      conversion = <div className="pure-g">
          <div className="pure-u-1-2 alignLeft">
            <h3>Legacy base58Check</h3>
            <p><QRCode value={this.props.convert.base58Check} /></p>
            <p>{this.props.convert.base58Check}</p>
          </div>
        </div>
    }

    if(this.props.convert.xpriv !== '' && this.props.convert.xpub !== '') {
      extended = <div className="pure-g">
          <div className="pure-u-1-2 alignLeft">
            <h3>Private Key WIF</h3>
            <p><QRCode value={this.props.convert.privateKeyWIF} /></p>
            <p>{this.props.convert.privateKeyWIF}</p>
          </div>
          <div className="pure-u-1-2 alignRight">
            <h3>XPriv</h3>
            <p><QRCode value={this.props.convert.xpriv} /></p>
            <p>{this.props.convert.xpriv}</p>
          </div>
        </div>
      xpub = <div className="pure-g">
          <div className="pure-u-1-2 alignLeft">
            <h3>XPub</h3>
            <p><QRCode value={this.props.convert.xpub} /></p>
            <p>{this.props.convert.xpub}</p>
          </div>
        </div>
    }

    if(this.props.convert.xpriv === '' && this.props.convert.xpub !== '') {
      xpub = <div className="pure-g">
          <div className="pure-u-1-2 alignLeft">
            <h3>XPub</h3>
            <p><QRCode value={this.props.convert.xpub} /></p>
            <p>{this.props.convert.xpub}</p>
          </div>
        </div>
    }

    if(this.props.convert.xpriv === '' && this.props.convert.privateKeyWIF !== '') {
      privateKeyWIF =
        <div className="pure-g">
          <div className="pure-u-1-1 alignLeft">
            <h3>Private Key WIF</h3>
            <p><QRCode value={this.props.convert.privateKeyWIF} /></p>
            <p>{this.props.convert.privateKeyWIF}</p>
          </div>
        </div>;
    }

    let error;
    if(this.props.convert.error) {
      error =
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h3>Error</h3>
            <p>{this.props.convert.errorMsg}</p>
          </div>
        </div>;
    }
    return (
      <div className="Convert">
        <h2 className="content-head is-center">Convert</h2>
        <div className="pure-g">
          <div className="l-box-lrg pure-u-1-1">
            <p>Paste in a public address or private key in Wallet Import Format to convert legacy addresses and generate a QR code.</p>
            <form className="pure-form pure-form-stacked" onSubmit={this.handleSubmit}>
              <input id='path' type='text' placeholder='enter legacy address' onChange={this.convert.bind(this)}/>
            </form>
          </div>
        </div>
        {error}
        {conversion}
        {extended}
        {xpub}
        {privateKeyWIF}
      </div>
    );
  }
}

export default Convert;
