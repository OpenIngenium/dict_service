import dotenv from 'dotenv';

dotenv.config();

export const APP_PORT = process.env.APP_PORT || 5000;
export const APP_HOST = process.env.APP_HOST || '0.0.0.0';
export const NODE_ENV = process.env.NODE_ENV || 'production';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// ArangoDB Configuration
export const ARANGO_URL = process.env.ARANGO_URL || 'http://localhost:8529';
export const ARANGO_DB_NAME = process.env.ARANGO_DB_NAME || 'project_config';
export const ARANGO_USERNAME = process.env.ARANGO_USERNAME || '';
export const ARANGO_PASSWORD = process.env.ARANGO_PASSWORD || '';

export const PUBLIC_PEM = process.env.PUBLIC_PEM

export const COLLECTION_NAMES = ['dictionary', 'command', 'channel', 'evr', 'mil1553', 'vnv', 'custom_script'];