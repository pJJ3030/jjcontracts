"use strict";

var BigNumber = require("bignumber.js");
const Config = require("./config");
const fs = require('fs');
const config = Config.getConfig();
const Parameters = require("./parameters").get();

/*
Read json file generated
create a total of all wallets
write a new csv with wallet,gno,pbt
*/

module.exports.computeAllotment = async (symbol) => {

	BigNumber.config({ DECIMAL_PLACES: 9 });
  	const TOTAL_PBT = new BigNumber(config.totalPBTToAllot);
  	const file = Parameters.outputFileNameJSON.replace(/{token}/g, symbol);

  	let myJSON = [];
  	let myJSONReal = {
  		decimals : 18,
		airdrop : {}
  	};

	let data = JSON.parse(fs.readFileSync(file));

	let total = new BigNumber(0);
	let totalPBT = new BigNumber(0);

	data.forEach(function(obj) {
	    var balance = obj.balance;
	    var type = obj.type;
	    
	    if(type == 'wallet') {
	        total = total.plus(new BigNumber(balance));
	    }
	});

	data.forEach(function(obj) {
	    var type = obj.type;
	    
	    if(type == 'wallet') {
	    	var wallet = obj.wallet.toLowerCase();
	        let balance = obj.balance;
	        let bal = new BigNumber(balance);

	        let pbtBal = bal.multipliedBy(TOTAL_PBT).div(total);
	        let pbtBalString = pbtBal.toString(10);
	        totalPBT = totalPBT.plus(pbtBal);
	        myJSON.push([wallet, balance, pbtBalString]);

	        myJSONReal.airdrop[wallet] = BigNumber(pbtBalString).toNumber();
	    }
	});

	const CSVString = myJSON.join('\n');
  	const outFile = Parameters.outputCombinedCSV.replace(/{token}/g, symbol);
  	const outFileJSON = Parameters.outputCombinedJSON.replace(/{token}/g, symbol);

	fs.writeFile(outFile, CSVString, err => {
	    if (err) return console.log(err);
	    console.log('output CSV file successfully written!\n');
	});

	fs.writeFile(outFileJSON, JSON.stringify(myJSONReal), err => {
	    if (err) return console.log(err);
	    console.log('output JSON file successfully written!\n');
	});

  	return;
};

// {
//   "decimals": 18,
//   "airdrop": {
//     "0xeb1b2475B124f1a50051fE0f56CE7728335B65c6": 10,
//     "0x517dA6560b2CeA01214c9e916ACCB424b4FA26Ab": 10.1234,
//     "0x185a4dc360ce69bdccee33b3784b0282f7961aea": 100,
//     "0x4f8ad938eba0cd19155a835f617317a6e788c868": 1189.287810510048604032,
//     "0x88ad09518695c6c3712ac10a214be5109a655671": 333.145540815538941120,
//     "0xca771eda0c70aa7d053ab1b25004559b918fe662": 40.714158973188263936
//   }
// }
