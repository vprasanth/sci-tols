const MongoClient = require('mongodb');
const local = 'mongodb://localhost:27017';

async function connect(url) {
  try {
    const db = await MongoClient.connect(url);
    const stats = await db.stats();
    console.log(stats);
    return db; 
  }
  catch (e) {
    console.log(e.message);
    process.exitCode(1); 
  }
}

async function main() {
  try {
    const db = await connect(local);
    const dbs = await getListOfDbs(db);
    // console.log(dbs);
    dbs.databases.forEach(_db => console.log(_db.name));
    db.close();
  }
  catch(e) {
    console.log(e);
    process.exitCode(1);
  }
}

async function getListOfDbs (db) {
  const _db = await db.admin();
  return  _db.listDatabases();
}
main();

module.exports = { connect: connect };
