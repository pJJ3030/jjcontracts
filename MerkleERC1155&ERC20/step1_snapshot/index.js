#!/usr/bin/env node
"use strict";

const Balances = require("./balances");
const Config = require("./config");
const Events = require("./events/blockchain");
const Export = require("./export");
const Compute = require("./compute");

const start = async () => {
  await Config.checkConfig();
  const result = await Events.get();

  console.log("Calculating balances of %s (%s)", result.name, result.symbol);
  const balances = await Balances.createBalances(result);

  console.log("Exporting balances");
  await Export.exportBalances(result.symbol, balances, "both");

  console.log("Computing PBT allotment");
  await Compute.computeAllotment(result.symbol);
};

(async () => {
  try {
    await start();
  } catch (e) {
    console.error(e);
  }
})();
