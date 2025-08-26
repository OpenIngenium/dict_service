// src/schemas/vnvSchema.js

import { commonErrorResponses } from './shared_schemas/sharedSchemas.js';

// Schema for the VerificationItem object itself
const verificationItemObjectSchema = {
  type: 'object',
  properties: {
    vi_id: {
      description: 'Unique ID for the Verification Item (User generated, will enforce format via xml schema)',
      type: 'string',
    },
    vi_name: {
      description: 'Unique Name for the Verification Item (Requirement short text, channel name, etc)',
      type: 'string',
    },
    vi_owner: {
      description: 'Owner of this requirement',
      type: 'string',
    },
    vi_type: {
      description: 'Type of Verification Item. Not constained but expected to be REQUIREMENT, CHANNEL, COMMAND, etc.',
      type: 'string',
    },
    vi_text: {
      description: 'Text of the verification item. Could be requirement text, command/channel description, etc.',
      type: 'string',
    },
    vas: {
      type: 'array',
      description: 'List of Verification Activity associated with the Verification Item',
      items: {
        type: 'string',
      },
    },
    vacs: {
      type: 'array',
      description: 'List of Verification Activity Collection  associated with the Verification Item',
      items: {
        type: 'string',
      },
    },
  },
};

// Schema for POST /vnv/vis
export const createVerificationItemSchema = {
  summary: 'Create a definition of a VI in Ingenium',
  description: 'Create a definition of a Verification Item in Ingenium',
  tags: ['Verification and Validation'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'array',
    items: verificationItemObjectSchema,
  },
  response: {
    201: {
      description: 'Success. VI Created.',
      type: 'array',
      items: verificationItemObjectSchema,
    },
    ...commonErrorResponses,
  },
};

// Schema for GET /vnv/vis
export const getVerificationItemsSchema = {
  summary: 'Get list of all verification items',
  description: 'Get list of all verification items',
  tags: ['Verification and Validation'],
  security: [{ bearerAuth: [] }],
  querystring: {
    type: 'object',
    properties: {
      sort: {
        description: 'Orders the results by element name (alphabetic -ascending/descending)',
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
      wild: {
        description: 'Modifies search fields to use search optimized (true) vs. typeahead optimized (false)',
        type: 'boolean',
        default: false,
      },
      vi_id: {
        description: 'Limits (partial match) the query on vi_id',
        type: 'string',
      },
      vi_name: {
        description: 'Limits (partial match) the query on vi_name',
        type: 'string',
      },
      sort_by: {
        description: 'Field to sort by',
        type: 'string',
        enum: ['VI_ID', 'VI_OWNER', 'VI_NAME', 'VI_TYPE', 'VI_TEXT', 'VA_NAME'],
      },
      vi_owner: {
        description: 'Limits (partial match) the query on verification item point of contact',
        type: 'string',
      },
      va_name: {
        description: 'Limits (partial match) the query on which verification activities the vi is linked to',
        type: 'string',
      },
      vi_type: {
        description: 'Limits (partial match) the query on the type of vi',
        type: 'string',
      },
      vi_text: {
        description: 'Limits (partial match) the query on the vi\'s text',
        type: 'string',
      },
      va_poc: {
        description: 'Limits (partial match) the query on verification activity point of contact',
        type: 'string',
      },
      vac_name: {
        description: 'Limits (partial match) the query on the name of the vac',
        type: 'string',
      },
    },
  },
  response: {
    200: {
      description: 'Success. a list of all verification activities',
      headers: {
        'x-total-count': {
          description: 'The total number of scripts',
          type: 'integer',
        },
      },
      type: 'array',
      items: verificationItemObjectSchema,
    },
    ...commonErrorResponses,
  },
};

// Schema for GET /vnv/vis/{vi_id}
export const getVerificationItemByIdSchema = {
  summary: 'Details for a given verification item',
  description: 'Details for a given verification item',
  tags: ['Verification and Validation'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['vi_id'],
    properties: {
      vi_id: {
        description: 'The unique id of a verification item',
        type: 'string',
      },
    },
  },
  response: {
    200: {
      description: 'Success. Details for a given verification item.',
      ...verificationItemObjectSchema,
    },
    ...commonErrorResponses,
  },
};

// Schema for PATCH /vnv/vis/{vi_id}
export const updateVerificationItemSchema = {
  summary: 'Updates a given verification item',
  description: 'Updates a given verification item',
  tags: ['Verification and Validation'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['vi_id'],
    properties: {
      vi_id: {
        description: 'The unique id of a verification item to update',
        type: 'string',
      },
    },
  },
  body: verificationItemObjectSchema,
  response: {
    200: {
      description: 'Success. Updated a verification item.',
      ...verificationItemObjectSchema,
    },
    ...commonErrorResponses,
  },
};

// Schema for DELETE /vnv/vis/{vi_id}
export const deleteVerificationItemSchema = {
  summary: 'Delete a given verification item',
  description: 'Delete for a given verification item',
  tags: ['Verification and Validation'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['vi_id'],
    properties: {
      vi_id: {
        description: 'The unique id of a verification item to delete',
        type: 'string',
      },
    },
  },
  response: {
    204: {
      description: 'Success. VI Deleted',
      type: 'null',
    },
    ...commonErrorResponses,
  },
};

// Schema for POST /vnv/vis/bulk_query
export const bulkQueryVerificationItemsSchema = {
  summary: 'Query of vis based on VI ids',
  description: 'Verification items. Post is used instead of Get since we need to pass many vi ids in request body. Returns up to 10000 VIs.',
  tags: ['Verification and Validation'],
  security: [{ bearerAuth: [] }],
  body: {
    description: 'Array of VI ids to query for',
    type: 'array',
    items: {
      type: 'string',
    },
  },
  response: {
    200: {
      description: 'Success',
      type: 'array',
      items: verificationItemObjectSchema,
    },
    ...commonErrorResponses,
  },
};