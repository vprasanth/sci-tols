const MongoClient = require('mongodb');
var logger = require('winston');

logger.level = 'info';
const local = 'mongodb://localhost:27017';

main();

async function main() {
  try {
    const server = await connect(local);
    const dbs = await getDbsInServer(server);
    const tenantDbs = dbs.databases.filter(tDb => tDb.name.startsWith('t'));
    let users = [];
    const arrOfCols = ['sales_orders', '_products', 'feeds'];

    let promise = Promise.resolve();
    for (let tenant of tenantDbs) {
      logger.info(tenant.name);
      arrOfCols.forEach(col => {
        promise = promise.then(() => {
          return await purge(server, tenant, col);
        });
      });
      // await purge(server, tenant, '_salese_orders');
      // arrOfCols.map(col => {await purge(server, tenant, col)});
      // users.push({users: await getAllUsers(server, db), db: db.name});
    }
    
    // console.log(users[0].users);
    server.close();
  }
  catch(e) {
    logger.error(e);
    process.exit(1);
  }
}

async function connect(url) { 
  throwError(url, 'no url!');
  const server = await MongoClient.connect(url);
  const stats = await server.stats();
  logger.debug(stats);
  return server; 
}

async function getDbsInServer(server) {
  throwError(server, 'no server!');
  const adminDb = await server.admin();
  return  adminDb.listDatabases();
}

async function getDocsFrom(server, db, col) {
  throwError(server, 'no server!');
  throwError(db, 'no db!');
  throwError(col, 'no collection!');
  const _db = await server.db(db.name);
  const usersCol = await _db.collection(col);
  const allUsers =  await usersCol.find({});
  return await allUsers.toArray();
}

async function getAllUsers(server, db) {
  return getDocsFrom(server, db, 'users');
}

function throwError(x, msg) {
  if (!x) throw new Error(msg);
} 

async function purge(server, db, col){
  const _db = await server.db(db.name);
  try {
    return await _db.dropCollection(col);  
  } catch (e) {
    console.log(`${col} does not exist`);
    return;
  }
}

module.exports = { 
  connect: connect 
};
