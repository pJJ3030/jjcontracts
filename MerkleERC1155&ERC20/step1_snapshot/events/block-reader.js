"use strict";

const fs = require("fs");
const path = require("path");

const { promisify } = require("util");

const Config = require("../config").getConfig();
const Parameters = require("../parameters").get();

const readdirAsync = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);

function sumHexValues(hexArray) {
  // Initialize a variable to store the decimal sum
  let decimalSum = 0;

  // Iterate through the array and convert each hex value to decimal
  for (const item of hexArray) {
    // Remove '0x' from the hex string and parse it as an integer
    const decimalValue = parseInt(item._hex, 16);
    decimalSum += decimalValue;
  }

  // Convert the decimal sum back to a hex string
  const hexSum = '0x' + decimalSum.toString(16);

  return hexSum;
}

const getMinimalERC20 = pastEvents => {
  return pastEvents.map(tx => {
    return {
      transactionHash: tx.transactionHash,
      blockNumber: tx.blockNumber,
      from: tx.returnValues["0"],
      to: tx.returnValues["1"],
      value: tx.returnValues["2"]._hex
      // value: "0x" + Number(tx.returnValues["2"]).toString(16)
    };
  });
};

const getMinimalERC1155 = pastEvents => {
  return pastEvents.map(tx => {
    if(tx.event == "TransferBatch") {
      return {
        transactionHash: tx.transactionHash,
        blockNumber: tx.blockNumber,
        from: tx.returnValues["1"],
        to: tx.returnValues["2"],
        value: sumHexValues(tx.returnValues["4"])
        // .reduce((a, b) => a + b, 0)
      };
    } else {
      return {
        transactionHash: tx.transactionHash,
        blockNumber: tx.blockNumber,
        from: tx.returnValues["1"],
        to: tx.returnValues["2"],
        value: tx.returnValues["4"]._hex
        // value: "0x" + Number(tx.returnValues["2"]).toString(16)
      };
    }
  });
};

module.exports.getEvents = async symbol => {
  const directory = Parameters.eventsDownloadFolder.replace(/{token}/g, symbol);
  var files = await readdirAsync(directory);
  files.sort((a,b) => {
    return parseInt(a.split(".")[0]) - parseInt(b.split(".")[0]);
  });
  let events = [];

  console.log("Parsing files.");

  for await (const file of files) {
    // console.log("Parsing ", file);

    const contents = await readFileAsync(path.join(directory, file));
    const parsed = JSON.parse(contents.toString());
    if(Config.tokenType == "ERC20") {
      events = events.concat(getMinimalERC20(parsed));
    } else if(Config.tokenType == "ERC1155") {
      events = events.concat(getMinimalERC1155(parsed));
    }
  }

  return events;
};
