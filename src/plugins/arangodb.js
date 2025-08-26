import fp from 'fastify-plugin';
import { Database } from 'arangojs';
import {
  ARANGO_URL,
  ARANGO_DB_NAME,
  ARANGO_USERNAME,
  ARANGO_PASSWORD,
  COLLECTION_NAMES
} from '../config/env.js';

async function arangoPlugin(fastify, options) {
  fastify.log.info('Initializing ArangoDB connection...');

  const arangoConn = new Database({
    url: ARANGO_URL,
    auth: {
      username: ARANGO_USERNAME,
      password: ARANGO_PASSWORD,
    },
  });

  try {
    const systemDb = arangoConn.database('_system');
    const dbList = await systemDb.listDatabases();

    if (!dbList.includes(ARANGO_DB_NAME)) {
      fastify.log.info(`Database '${ARANGO_DB_NAME}' does not exist. Creating it...`);
      await systemDb.createDatabase(ARANGO_DB_NAME);
      fastify.log.info(`Database '${ARANGO_DB_NAME}' created successfully.`);
    }

    const db = arangoConn.database(ARANGO_DB_NAME);

    // Ensure collections exist
    const collectionNames = COLLECTION_NAMES;
    for (const name of collectionNames) {
      const collection = db.collection(name);
      const exists = await collection.exists();
      if (!exists) {
        fastify.log.info(`Collection '${name}' does not exist. Creating it...`);
        await collection.create();
        fastify.log.info(`Collection '${name}' created successfully.`);
      } else {
        fastify.log.info(`Collection '${name}' already exists.`);
      }
    }

    // Ensure indexes on key fields to optimize query performance and enforce uniqueness
    const indexDefinitions = [
      {
        collection: 'dictionary',
        fields: ['dictionary_type', 'dictionary_version'],
        unique: true,
        sparse: false
      },
      {
        collection: 'command',
        fields: ['dictionary_type', 'dictionary_version', 'command_stem'],
        unique: true,
        sparse: true
      },
      {
        collection: 'evr',
        fields: ['dictionary_type', 'dictionary_version', 'evr_id', 'evr_name'],
        unique: true,
        sparse: true
      },
      {
        collection: 'channel',
        fields: ['dictionary_type', 'dictionary_version', 'channel_id', 'channel_name'],
        unique: true,
        sparse: true
      },
      {
        collection: 'mil1553',
        fields: ['dictionary_type', 'dictionary_version', 'mil1553_name'],
        unique: true,
        sparse: true
      },
      {
        collection: 'vnv',
        fields: ['vi_id'],
        unique: true,
        sparse: true
      },
      {
        collection: 'custom_script',
        fields: ['script_id'],
        unique: true,
        sparse: true
      }
    ];

    for (const def of indexDefinitions) {
      fastify.log.info(
        `Ensuring index on ${def.collection}: [${def.fields.join(', ')}] (unique=${def.unique})`
      );
      await db.collection(def.collection).ensureIndex({
        type: 'persistent',
        fields: def.fields,
        unique: def.unique,
        sparse: def.sparse
      });
    }

    fastify.decorate('db', db);

    fastify.addHook('onClose', async (instance, done) => {
      fastify.log.info('Closing ArangoDB connection...');
      db.close?.(); // Optional chaining in case close isn't defined
      done();
    });
  } catch (err) {
    fastify.log.error( err, 'Failed to connect to ArangoDB or set up collections');
    throw new Error(`Failed to connect to ArangoDB: ${err.message}`);
  }
}

export default fp(arangoPlugin, {
  name: 'fastify-arangodb',
});
