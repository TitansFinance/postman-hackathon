const axios = require('axios')
var Web3 = require('web3');
const Tx = require('ethereumjs-tx')

const config = require('./config.json');

const web3 = new Web3(process.env.JSON_RPC);

web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);

const myWalletAddress = web3.eth.accounts.wallet[0].address;

const cEthAddress = config.cEthAddress;
const cEthAbi = config.cEthAbi;
const cEthContract = new web3.eth.Contract(cEthAbi, cEthAddress);


const sendTx = async () => {
  const nonce = await web3.eth.getTransactionCount(process.env.FROM, 'pending')
  var gasPrice = 2; // or get with web3.eth.gasPrice
  var gasLimit = 3000000;

  var amountToSend = 0.1;

  var rawTransaction = {
    "from": process.env.FROM,
    "nonce": web3.utils.toHex(nonce),
    "gasPrice": web3.utils.toHex(gasPrice * 1e9),
    "gasLimit": web3.utils.toHex(gasLimit),
    "to": process.env.TO,
    "value": amountToSend,
    "chainId": 4,
  };

  var privKey = new Buffer(process.env.PRIVATE_KEY, 'hex');
  var tx = new Tx(rawTransaction);

  tx.sign(privKey);

  var serializedTx = tx.serialize();

  web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function(err, hash) {
    if (!err)
        {
          console.log('Txn Sent and hash is ' + hash);
        }
    else
        {
          console.error(err);
        }
  });
}


const supplyEth = async () => {
  const nonce = await web3.eth.getTransactionCount(process.env.FROM, 'pending')
  var gasPrice = 2; // or get with web3.eth.gasPrice
  var gasLimit = 3000000;

  var amountToSend = 0.1;

  var rawTransaction = {
    from: process.env.FROM,
    to: cEthAddress,
    nonce: web3.utils.toHex(nonce),
    gasLimit: web3.utils.toHex(500000),
    gasPrice: web3.utils.toHex(20000000000),
    value: web3.utils.toHex(web3.utils.toWei(process.env.AMOUNT, 'ether')),
    chainId: 4,
    data: cEthContract.methods.mint().encodeABI(),
  }

  var privKey = new Buffer(process.env.PRIVATE_KEY, 'hex');
  var tx = new Tx(rawTransaction);

  tx.sign(privKey);

  var serializedTx = tx.serialize();
  const prefixedTx = '0x' + serializedTx.toString('hex')

  const result = await axios.post(process.env.JSON_RPC, {
    "jsonrpc":"2.0",
    "method":"eth_sendRawTransaction",
    "params":[prefixedTx],
    "id": 1
  })

  console.log(result.data)
  console.log('Sent: ', `https://rinkeby.etherscan.io/tx/${result.data.result}`)

}

supplyEth()

