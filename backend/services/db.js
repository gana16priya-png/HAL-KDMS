const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DATA_DIR = path.join(__dirname, '..', 'data');
const JSON_DB_PATH = path.join(DATA_DIR, 'db.json');

let isMongoConnected = false;

// Ensure local data folder and db.json exist
function initLocalDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(JSON_DB_PATH)) {
    fs.writeFileSync(
      JSON_DB_PATH,
      JSON.stringify(
        {
          users: [],
          projects: [],
          decisions: [],
          issues: [],
          documents: [],
          auditlogs: [],
          accessrequests: [],
        },
        null,
        2
      )
    );
  }
}

async function connectDB() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hkdms';
  initLocalDB();

  try {
    console.log('Connecting to MongoDB at:', mongoURI);
    // Set connection timeout to 3 seconds so fallback loads fast if Mongo is not running
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log('MongoDB successfully connected.');
  } catch (err) {
    console.warn('--- DATABASE WARNING ---');
    console.warn('MongoDB connection failed:', err.message);
    console.warn('HKDMS will run in Local JSON File Database mode.');
    console.warn('Data will be persisted in:', JSON_DB_PATH);
    console.warn('------------------------');
    isMongoConnected = false;
  }
}

// Local JSON DB helpers for CRUD
function readLocalDB() {
  initLocalDB();
  try {
    const data = fs.readFileSync(JSON_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to read local DB:', err);
    return {
      users: [],
      projects: [],
      decisions: [],
      issues: [],
      documents: [],
      auditlogs: [],
      accessrequests: [],
    };
  }
}

function writeLocalDB(data) {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write local DB:', err);
  }
}

// Dynamic Model Mock Wrapper
class LocalCollection {
  constructor(collectionName) {
    this.name = collectionName;
  }

  async find(query = {}) {
    const db = readLocalDB();
    let list = db[this.name] || [];
    
    // Simple filter matching
    return list.filter(item => {
      for (let key in query) {
        // Handle basic queries
        if (key === '$or' && Array.isArray(query[key])) {
          const matchesOr = query[key].some(subQuery => {
            for (let subKey in subQuery) {
              if (item[subKey] !== subQuery[subKey]) {
                return false;
              }
            }
            return true;
          });
          if (!matchesOr) return false;
        } else if (query[key] && typeof query[key] === 'object' && query[key].$ne !== undefined) {
          if (item[key] === query[key].$ne) return false;
        } else if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const list = await this.find(query);
    return list[0] || null;
  }

  async findById(id) {
    return this.findOne({ id: id });
  }

  async create(data) {
    const db = readLocalDB();
    if (!db[this.name]) db[this.name] = [];
    
    const record = {
      id: Math.random().toString(36).substring(2, 11),
      _id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    
    db[this.name].push(record);
    writeLocalDB(db);
    return record;
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const db = readLocalDB();
    const list = db[this.name] || [];
    const index = list.findIndex(item => item.id === id || item._id === id);
    if (index === -1) return null;
    
    const updated = {
      ...list[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    list[index] = updated;
    writeLocalDB(db);
    return updated;
  }

  async findByIdAndDelete(id) {
    const db = readLocalDB();
    const list = db[this.name] || [];
    const index = list.findIndex(item => item.id === id || item._id === id);
    if (index === -1) return null;
    const removed = list.splice(index, 1)[0];
    writeLocalDB(db);
    return removed;
  }
}

// Returns mongoose model if connected, else returns a LocalCollection
function getModel(name, mongooseModel) {
  return new Proxy({}, {
    get(target, prop) {
      if (isMongoConnected) {
        return mongooseModel[prop];
      } else {
        const localColl = new LocalCollection(name.toLowerCase() + 's');
        if (typeof localColl[prop] === 'function') {
          return localColl[prop].bind(localColl);
        }
        return localColl[prop];
      }
    }
  });
}

module.exports = {
  connectDB,
  isMongoConnected: () => isMongoConnected,
  getModel,
  readLocalDB,
  writeLocalDB
};
