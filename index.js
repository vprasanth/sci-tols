#!/usr/bin/env node
const log = require('winston');
const db = require('./lib')(require('mongodb'));
const config = require('./config');
log.level = 'log';

async main(){
  // connect to mongo server
  const ms = await db.connect(config);

}

main();
