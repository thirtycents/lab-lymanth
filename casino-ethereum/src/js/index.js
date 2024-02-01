import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'
import './../css/index.css'
import MyContractABI from './../ABI/ContractABI.json'

class App extends React.Component {
   constructor(props) {
      super(props)
      this.state = {
         lastWinner: 0,
         numberOfBets: 0,
         minimumBet: 0,
         totalBet: 0,
         maxAmountOfBets: 0,
      }

      // if (typeof web3 != 'undefined') {
      //    console.log("Using web3 detected from external source like Metamask")
      //    this.web3 = new Web3(web3.currentProvider)
      // } else {
      //    console.log("No web3 detected. Falling back to http://localhost:8080. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
      //    this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8080"))
      // }
     
      
      // const MyContract = web3.eth.contract()
      // this.state.ContractInstance = MyContract.at("0xeC2adB0a85d965206b1121cd96bf2555bCf9e46A")

      // window.a = this.state
      this.initWeb3();
   }


   initWeb3 = async () => {
      if (window.ethereum) {
          this.web3 = new Web3(window.ethereum);
          try {
              await window.ethereum.request({ method: 'eth_requestAccounts' });
          } catch (error) {
              console.error('User denied account access');
          }
      } else if (window.web3) {
          this.web3 = new Web3(window.web3.currentProvider);
      } else {
          console.log('Non-Ethereum browser detected. Consider trying MetaMask.');
      }
      this.initContract();
  };

  initContract = () => {
   const contractAddress = "0xeC2adB0a85d965206b1121cd96bf2555bCf9e46A"; 
   const ContractInstance = new this.web3.eth.Contract(MyContractABI, contractAddress);
   this.setState({ ContractInstance });
};








   componentDidMount() {
      this.updateState()
      this.setupListeners()

      setInterval(this.updateState.bind(this), 7e3)
   }

   // updateState() {
   //    this.state.ContractInstance.minimumBet((err, result) => {
   //       if (result != null) {
   //          this.setState({
   //             minimumBet: parseFloat(web3.fromWei(result, 'ether'))
   //          })
   //       }
   //    })
   //    this.state.ContractInstance.totalBet((err, result) => {
   //       if (result != null) {
   //          this.setState({
   //             totalBet: parseFloat(web3.fromWei(result, 'ether'))
   //          })
   //       }
   //    })
   //    this.state.ContractInstance.numberOfBets((err, result) => {
   //       if (result != null) {
   //          this.setState({
   //             numberOfBets: parseInt(result)
   //          })
   //       }
   //    })
   //    this.state.ContractInstance.maxAmountOfBets((err, result) => {
   //       if (result != null) {
   //          this.setState({
   //             maxAmountOfBets: parseInt(result)
   //          })
   //       }
   //    })
   // }

   updateState = async () => {
      const { ContractInstance } = this.state;
  
      try {
          const minimumBet = await ContractInstance.methods.minimumBet().call();
          const totalBet = await ContractInstance.methods.totalBet().call();
          const numberOfBets = await ContractInstance.methods.numberOfBets().call();
          const maxAmountOfBets = await ContractInstance.methods.maxAmountOfBets().call();
  
          this.setState({
              minimumBet: this.web3.utils.fromWei(minimumBet, 'ether'),
              totalBet: this.web3.utils.fromWei(totalBet, 'ether'),
              numberOfBets: parseInt(numberOfBets),
              maxAmountOfBets: parseInt(maxAmountOfBets)
          });
      } catch (err) {
          console.error(err);
      }
  };
  

   // Listen for events and executes the voteNumber method
   setupListeners() {
      let liNodes = this.refs.numbers.querySelectorAll('li')
      liNodes.forEach(number => {
         number.addEventListener('click', event => {
            event.target.className = 'number-selected'
            this.voteNumber(parseInt(event.target.innerHTML), done => {

               // Remove the other number selected
               for (let i = 0; i < liNodes.length; i++) {
                  liNodes[i].className = ''
               }
            })
         })
      })
   }

   // voteNumber(number, cb) {
   //    let bet = this.refs['ether-bet'].value

   //    if (!bet) bet = 0.1

   //    if (parseFloat(bet) < this.state.minimumBet) {
   //       alert('You must bet more than the minimum')
   //       cb()
   //    } else {
   //       this.state.ContractInstance.bet(number, {
   //          gas: 300000,
   //          from: web3.eth.accounts[0],
   //          value: web3.toWei(bet, 'ether')
   //       }, (err, result) => {
   //          cb()
   //       })
   //    }
   // }
   voteNumber = async (number, cb) => {
      const { ContractInstance } = this.state;
      const bet = this.refs['ether-bet'].value || '0.1';
      const accounts = await this.web3.eth.getAccounts();

      if(accounts.length === 0) {
         console.error("No accounts found. Make sure MetaMask is connected.");
         return;
     }
  
      if (parseFloat(bet) < parseFloat(this.state.minimumBet)) {
          alert('You must bet more than the minimum');
          cb();
      } else {
          ContractInstance.methods.bet(number).send({
              from: accounts[0],
              value: this.web3.utils.toWei(bet, 'ether'),
              gas: 3000000 // 确认这个gas值是合理的
          })
          .on('transactionHash', hash => {
              console.log("Transaction hash:", hash);
              cb();
          })
          .on('error', console.error);
      }
  };
  
   render() {
      return (
         <div className="main-container">
            <h1>Bet for your best number and win huge amounts of Ether</h1>

            <div className="block">
               <b>Number of bets:</b> &nbsp;
               <span>{this.state.numberOfBets}</span>
            </div>

            <div className="block">
               <b>Last number winner:</b> &nbsp;
               <span>{this.state.lastWinner}</span>
            </div>

            <div className="block">
               <b>Total ether bet:</b> &nbsp;
               <span>{this.state.totalBet} ether</span>
            </div>

            <div className="block">
               <b>Minimum bet:</b> &nbsp;
               <span>{this.state.minimumBet} ether</span>
            </div>

            <div className="block">
               <b>Max amount of bets:</b> &nbsp;
               <span>{this.state.maxAmountOfBets}</span>
            </div>

            <hr />

            <h2>Vote for the next number</h2>

            <label>
               <b>How much Ether do you want to bet? <input className="bet-input" ref="ether-bet" type="number" placeholder={this.state.minimumBet} /></b> ether
               <br />
            </label>

            <ul ref="numbers">
               <li>1</li>
               <li>2</li>
               <li>3</li>
               <li>4</li>
               <li>5</li>
               <li>6</li>
               <li>7</li>
               <li>8</li>
               <li>9</li>
               <li>10</li>
            </ul>

            <hr />

            <div><i>Only working with the Ropsten Test Network</i></div>
            <div><i>You can only vote once per account</i></div>
            <div><i>Your vote will be reflected when the next block is mined</i></div>
         </div>
      )
   }
}

ReactDOM.render(
   <App />,
   document.querySelector('#root')
)
