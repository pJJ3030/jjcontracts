"use strict";

const fs = require("fs");
const path = require("path");

const { promisify } = require("util");

const Config = require("../config").getConfig();
const Parameters = require("../parameters").get();

const readdirAsync = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);

const getMinimalERC20 = pastEvents => {
  return pastEvents.map(tx => {
    return {
      transactionHash: tx.transactionHash,
      from: tx.returnValues["0"],
      to: tx.returnValues["1"],
      value: tx.returnValues["2"]._hex
      // value: "0x" + Number(tx.returnValues["2"]).toString(16)
    };
  });
};

const getMinimalERC1155 = pastEvents => {
  return pastEvents.map(tx => {
    return {
      transactionHash: tx.transactionHash,
      from: tx.returnValues["1"],
      to: tx.returnValues["2"],
      value: tx.returnValues["4"]._hex
      // value: "0x" + Number(tx.returnValues["2"]).toString(16)
    };
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
