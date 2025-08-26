// src/schemas/dictionarySchema.js

import { commonErrorResponses } from './shared_schemas/sharedSchemas.js';

// Schema for the Dictionary object itself
const dictionaryObjectSchema = {
  type: 'object',
  properties: {
    creation_date: {
      description: 'The date the dictionary version was created in Ingenium',
      type: 'string',
    },
    dictionary_version: {
      description: 'Dictionary Version (must be unique per dictionary type)',
      type: 'string',
    },
    dictionary_type: {
      description: 'Type of Dictionary (sse/flight)',
      type: 'string',
      enum: ['sse', 'flight'],
    },
    dictionary_description: {
      description: 'Description of the dictionary',
      type: 'string',
    },
    state: {
      description: 'State of the dictionary version',
      type: 'string',
      enum: ['NOT_PUBLISHED', 'PUBLISHED', 'RETIRED', 'RELEASED'],
    },
  },
};

// Schema for GET /dictionaries/{dictionary_type}/versions
export const getDictionariesSchema = {
  summary: 'Get a list of available versions',
  description: 'Returns a list of versions of the dictionary.',
  tags: ['Dictionary'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['dictionary_type'],
    properties: {
      dictionary_type: {
        description: 'Type of Dictionary (sse/flight)',
        type: 'string',
        enum: ['sse', 'flight'],
      },
    },
  },
  querystring: {
    type: 'object',
    properties: {
      sort: {
        description: 'Orders the results by element name (alphabetic - ascending/descending)',
        type: 'string',
        enum: ['ASC', 'DESC'],
      },
      limit: {
        description: 'Limit on the number of returned results',
        type: 'integer',
        default: 20,
      },
      offset: {
        description: 'Offset for pagination',
        type: 'integer',
      },
      state_filter: {
        description: 'Limits the query dictionary versions with the state (exact match). Supports multiple filters with additional \'key=value\' pairs.',
        type: 'string',
        enum: ['NOT_PUBLISHED', 'PUBLISHED', 'RETIRED', 'RELEASED'],
      },
      description_filter: {
        description: 'Limits the query dictionary versions with the description (partial match)',
        type: 'string',
      },
      sort_by: {
        description: 'Field to sort by',
        type: 'string',
        enum: ['CREATION_DATE', 'VERSION', 'STATE'],
      },
    },
  },
  response: {
    200: {
      description: 'Success. A list of all the dictionaries.',
      headers: {
        'x-total-count': {
          description: 'The total number of resources',
          type: 'integer',
        },
      },
      type: 'array',
      items: dictionaryObjectSchema,
    },
    ...commonErrorResponses, 
  },
};

// Schema for POST /dictionaries/{dictionary_type}/versions
export const createDictionarySchema = {
  summary: 'Create a new dictionary',
  description: 'Creates a new dictionary version in the Ingenium Dictionary Service',
  tags: ['Dictionary'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['dictionary_type'],
    properties: {
      dictionary_type: {
        description: 'Type of Dictionary (sse/flight)',
        type: 'string',
        enum: ['sse', 'flight'],
      },
    },
  },
  // Assuming multipart/form-data, schema describes the fields
  body: {
    type: 'object',
    required: ['dictionary_version', 'state'], // Assuming these are essential for creation
    properties: {
      dictionary_description: {
        description: 'Description of the dictionary version',
        type: 'string',
      },
      dictionary_version: {
        description: 'Dictionary Version',
        type: 'string',
      },
      state: {
        description: 'State of the dictionary version',
        type: 'string',
        enum: ['NOT_PUBLISHED', 'PUBLISHED', 'RETIRED', 'RELEASED'],
      },
    },
  },
  response: {
    200: {
      description: 'Success. Dictionary Created',
      type: 'object',
      properties: {
        dictionary_info: dictionaryObjectSchema,
      },
    },
    400: { 
      description: 'Bad input (Version Already Exists)',
      ...commonErrorResponses[400] 
    },
    ...commonErrorResponses, 
  },
};

// Schema for GET /dictionaries/{dictionary_type}/versions/{dictionary_version}
export const getDictionaryByVersionSchema = {
  summary: 'Get details of a dictionary',
  description: 'Returns the details of the specified dictionary.',
  tags: ['Dictionary'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['dictionary_type', 'dictionary_version'],
    properties: {
      dictionary_type: {
        description: 'Type of Dictionary (sse/flight)',
        type: 'string',
        enum: ['sse', 'flight'],
      },
      dictionary_version: {
        description: 'Version of the specific dictionary type',
        type: 'string',
      },
    },
  },
  response: {
    200: {
      description: 'Success. Details of the dictionary.',
      type: 'object',
      properties: dictionaryObjectSchema.properties, 
    },
    ...commonErrorResponses,
  },
};

// Schema for DELETE /dictionaries/{dictionary_type}/versions/{dictionary_version}
export const deleteDictionarySchema = {
  summary: 'Deletes a dictionary',
  description: 'Deletes the specified dictionary.',
  tags: ['Dictionary'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['dictionary_type', 'dictionary_version'],
    properties: {
      dictionary_type: {
        description: 'Type of Dictionary (sse/flight)',
        type: 'string',
        enum: ['sse', 'flight'],
      },
      dictionary_version: {
        description: 'Version of the specific dictionary type',
        type: 'string',
      },
    },
  },
  response: {
    204: {
      description: 'Success. Dictionary Deleted.',
      type: 'null',
    },
    ...commonErrorResponses,
  },
};

// Schema for PATCH /dictionaries/{dictionary_type}/versions/{dictionary_version}
export const updateDictionarySchema = {
  summary: 'Updates Dictionary',
  description: 'Updates the content of a dictionary version in the Ingenium Dictionary Service',
  tags: ['Dictionary'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['dictionary_type', 'dictionary_version'],
    properties: {
      dictionary_type: {
        description: 'Type of Dictionary (sse/flight)',
        type: 'string',
        enum: ['sse', 'flight'],
      },
      dictionary_version: {
        description: 'Version of the specific dictionary type',
        type: 'string',
      },
    },
  },
  body: {
    type: 'object',
    properties: {
      dictionary_description: {
        description: 'Description of the version of the dictionaries',
        type: 'string',
      },
      state: {
        description: 'State of the dictionary version',
        type: 'string',
        enum: ['NOT_PUBLISHED', 'PUBLISHED', 'RETIRED', 'RELEASED'],
      },
    },
  },
  response: {
    200: {
      description: 'Success. Dictionary updated.',
      type: 'object',
      properties: {
        dictionary_info: dictionaryObjectSchema,
      },
    },
    ...commonErrorResponses,
  },
};
