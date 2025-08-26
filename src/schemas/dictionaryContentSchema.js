// src/schemas/dictionaryContentSchema.js

import { commonErrorResponses } from './shared_schemas/sharedSchemas.js';

// Schema for Enumerations (used in Argument)
const enumerationsSchema = {
  type: 'object',
  properties: {
    symbol: {
      description: 'Display value of the enumeration',
      type: 'string',
    },
    numeric: {
      description: 'Numeric value of the enumeration',
      type: 'integer',
    },
  },
};

// Schema for AllowableRange (used in Argument)
const allowableRangeSchema = {
  type: 'object',
  properties: {
    min_value: {
      description: 'Minimum Value for the Range',
      type: 'string',
    },
    max_value: {
      description: 'Maximum Value for the Range',
      type: 'string',
    },
  },
};

// Schema for Argument (used in Command)
const argumentSchema = {
  type: 'object',
  description: 'Definition of a single Flight command arguments',
  properties: {
    argument_type: {
      description: 'Type of the argument',
      type: 'string',
      enum: ['INT', 'UINT', 'STRING', 'FLOAT', 'BOOL', 'TIME', 'ENUM', 'ROL'],
    },
    argument_size: {
      description: 'Size of the argument',
      type: 'integer',
    },
    argument_description: {
      description: 'Description of the argument (if available)',
      type: 'string',
    },
    repeat_arg: {
      description: 'A repeat argument (repeat args can be repeated in the order they are in multiple times). Note that the term "repeat set" refers to all the of repeat args defined for a command in the order they are defined in.',
      type: 'string',
      enum: ['Yes', 'No'],
    },
    allowable_ranges: {
      description: 'Array of allowable ranges (if not present - everything is allowed)',
      type: 'array',
      items: allowableRangeSchema,
    },
    enumerations: {
      description: 'Used if the argument_type is ENUM',
      type: 'array',
      items: enumerationsSchema,
    },
  },
};

// Schema for the Command object itself
const commandObjectSchema = {
  type: 'object',
  properties: {
    command_stem: {
      description: 'The commmand stem (or mneumonic)',
      type: 'string',
    },
    operations_category: {
      description: 'The operations category of the command.',
      type: 'string',
    },
    cmd_description: {
      description: 'Description of the command.',
      type: 'string',
    },
    restricted_modes: {
      description: 'List of Restricted Modes for this Command',
      type: 'array',
      items: { type: 'string' },
    },
    cmd_type: {
      description: 'If you the project uses different command types (e.g. HW vs. FSW vs. SIM)',
      type: 'string',
    },
    repeat_min: {
      description: 'If there is a repeat argument the minimum number of times the repeat set must be present (ignore if no repeat args)',
      type: 'integer',
    },
    repeat_max: {
      description: 'If there is a repeat argument the maximum number of times the repeat set must be present (ignore if no repeat args)',
      type: 'integer',
    },
    arguments: {
      description: 'Array of arguments. Note that the position of the arguments is important to maintain.',
      type: 'array',
      items: argumentSchema,
    },
  },

};

// Schema for POST /dictionaries/{dictionary_type}/versions/{dictionary_version}/cmds
export const createCommandSchema = {
  summary: 'create a command',
  description: 'Creates a command in the specified dictionary',
  tags: ['Dictionary Content'],
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
    type: 'array',
    items: commandObjectSchema
  }, 
  response: {
    201: {
      description: 'Success. The command is created.',
      type: 'array',
      items: commandObjectSchema
    },
    ...commonErrorResponses,
  },
};

// Schema for GET /dictionaries/{dictionary_type}/versions/{dictionary_version}/cmds
export const getCommandsSchema = {
  summary: 'Get a list of commands',
  description: 'Returns a list of commands based on query parameters.',
  tags: ['Dictionary Content'],
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
      command_stem: {
        description: 'Limits (partial match) the query on command stem (aka command mneumonic)',
        type: 'string',
      },
      ops_cat: {
        description: 'Limits (partial match) the result on the ops category',
        type: 'string',
      },
      command_description: {
        description: 'Limits the query on command description (aka command mneumonic)',
        type: 'string',
      },
    },
  },
  response: {
    200: {
      description: 'Success. a list of all the cmds.',
      headers: {
        'x-total-count': {
          description: 'The total number of resources',
          type: 'integer',
        },
      },
      type: 'array',
      items: commandObjectSchema,
    },
    ...commonErrorResponses,
  },
};

// Schema for POST /dictionaries/{dictionary_type}/versions/{dictionary_version}/cmds/bulk_query
export const bulkQueryCommandsSchema = {
  summary: 'Queries commands based on a list of command stems',
  description: 'Queries commands based on command stems. Using POST instead of GET since many stems may need to be sent. Returns up to 10000 cmds.',
  tags: ['Dictionary Content'],
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
    description: 'Array of command stems to query for',
    type: 'array',
    items: {
      type: 'string',
    }
  },
  response: {
    200: {
      description: 'Success. A list of matching commands.',
      type: 'array',
      items: commandObjectSchema,
    },
    ...commonErrorResponses,
  },
};

// Schema for GET /dictionaries/{dictionary_type}/versions/{dictionary_version}/cmds/{cmd_stem}
export const getCommandByStemSchema = {
  summary: 'Get details of a command',
  description: 'Returns the details of the specified command',
  tags: ['Dictionary Content'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['dictionary_type', 'dictionary_version', 'cmd_stem'],
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
      cmd_stem: {
        description: 'The Command Stem to return the details for',
        type: 'string',
      },
    },
  },
  response: {
    200: {
      description: 'Success. The command details.',
      ...commandObjectSchema, 
    },
    ...commonErrorResponses,
  },
};

// Schema for PATCH /dictionaries/{dictionary_type}/versions/{dictionary_version}/cmds/{cmd_stem}
export const updateCommandSchema = {
  summary: 'update a command',
  description: 'Updates a command in the specified dictionary',
  tags: ['Dictionary Content'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['dictionary_type', 'dictionary_version', 'cmd_stem'],
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
      cmd_stem: {
        description: 'The Command Stem to update',
        type: 'string',
      },
    },
  },
  body: commandObjectSchema, 
  response: {
    200: {
      description: 'Success. The command is updated.',
      ...commandObjectSchema, // The response is the updated Command object
    },
    ...commonErrorResponses,
  },
};

// Schema for DELETE /dictionaries/{dictionary_type}/versions/{dictionary_version}/cmds/{cmd_stem}
export const deleteCommandSchema = {
  summary: 'Delete a command',
  description: 'Deletes the specified command from the dictionary version',
  tags: ['Dictionary Content'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['dictionary_type', 'dictionary_version', 'cmd_stem'],
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
      cmd_stem: {
        description: 'The Command Stem to delete',
        type: 'string',
      },
    },
  },
  response: {
    204: {
      description: 'Success. Deletion.',
      type: 'null', 
    },
    ...commonErrorResponses,
  },
};

// Schema for the EVR object itself
const evrObjectSchema = {
  type: 'object',
  properties: {
    evr_name: {
      description: 'The name of the EVR',
      type: 'string',
    },
    evr_id: {
      description: 'The id of the EVR (format in hex)',
      type: 'string',
    },
    operations_category: {
      description: 'The operations category of the channel.', 
      type: 'string',
    },
    evr_description: {
      description: 'Description of the evr (note this is not always populated)',
      type: 'string',
    },
    evr_message: {
      description: 'EVR display message',
      type: 'string',
    },
    evr_level: {
      description: 'Level of the EVR',
      type: 'string',
    },
  },
};

// Schema for POST /dictionaries/{dictionary_type}/versions/{dictionary_version}/evrs
export const createEvrSchema = {
  summary: 'Create an EVR',
  description: 'Creates an EVR',
  tags: ['Dictionary Content'],
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
    type: 'array',
    items: evrObjectSchema
  }, 
  response: {
    200: { 
      description: 'Success. An evr.',
      type: 'array',
      items: evrObjectSchema, 
    },
    ...commonErrorResponses,
  },
};

// Schema for GET /dictionaries/{dictionary_type}/versions/{dictionary_version}/evrs
export const getEvrsSchema = {
  summary: 'Get a list of evrs',
  description: 'Returns a list of evrs based on query parameters.',
  tags: ['Dictionary Content'],
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
      evr_id: {
        description: 'Limits (partial match) the query on evr_id',
        type: 'string',
      },
      evr_name: {
        description: 'Limits (partial match) the query on evr_name',
        type: 'string',
      },
      evr_level: {
        description: 'Limits (partial match) the query on EVR Level',
        type: 'string',
      },
      ops_cat: {
        description: 'Limits (partial match) the result on the ops category',
        type: 'string',
      },
      evr_description: {
        description: 'Limits (partial match) the query on evr description',
        type: 'string',
      },
      evr_message: {
        description: 'Limits (partial match) the query on evr message',
        type: 'string',
      },
    },
  },
  response: {
    200: {
      description: 'Success. a list of all the evrs.',
      headers: {
        'x-total-count': {
          description: 'The total number of resources',
          type: 'integer',
        },
      },
      type: 'array',
      items: evrObjectSchema,
    },
    ...commonErrorResponses,
  },
};

// Schema for POST /dictionaries/{dictionary_type}/versions/{dictionary_version}/evrs/bulk_query
export const bulkQueryEvrsSchema = {
  summary: 'Queries EVRS based on a list of EVR Names',
  description: 'Queries EVRS based on evr names. Using POST instead of GET since many names may need to be sent. Returns up to 10000 evrs.',
  tags: ['Dictionary Content'],
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
    description: 'Array of EVR names to query for',
    type: 'array',
    items: {
      type: 'string',
    },
  },
  response: {
    200: {
      description: 'Success. A list of matching EVRs.',
      type: 'array',
      items: evrObjectSchema,
    },
    ...commonErrorResponses,
  },
};

// Schema for GET /dictionaries/{dictionary_type}/versions/{dictionary_version}/evrs/{evr_name}
export const getEvrByNameSchema = {
  summary: 'Get details of a given evr',
  description: 'Returns the details of the EVR specified.',
  tags: ['Dictionary Content'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['dictionary_type', 'dictionary_version', 'evr_name'],
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
      evr_name: {
        description: 'The name of the EVR to return',
        type: 'string',
      },
    },
  },
  response: {
    200: {
      description: 'Success. An evr.',
      ...evrObjectSchema, 
    },
    ...commonErrorResponses,
  },
};

// Schema for PATCH /dictionaries/{dictionary_type}/versions/{dictionary_version}/evrs/{evr_name}
export const updateEvrSchema = {
  summary: 'update an evr',
  description: 'Updates an evr in the specified dictionary',
  tags: ['Dictionary Content'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['dictionary_type', 'dictionary_version', 'evr_name'],
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
      evr_name: {
        description: 'The name of the EVR to update',
        type: 'string',
      },
    },
  },
  body: evrObjectSchema, 
  response: {
    200: {
      description: 'Success. The evr is updated.',
      ...evrObjectSchema, 
    },
    ...commonErrorResponses,
  },
};

// Schema for DELETE /dictionaries/{dictionary_type}/versions/{dictionary_version}/evrs/{evr_name}
export const deleteEvrSchema = {
  summary: 'Delete an EVR',
  description: 'Deletes the specified EVR from the dictionary version',
  tags: ['Dictionary Content'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['dictionary_type', 'dictionary_version', 'evr_name'],
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
      evr_name: {
        description: 'The name of the EVR to delete',
        type: 'string',
      },
    },
  },
  response: {
    204: {
      description: 'Success. Deletion.',
      type: 'null', 
    },
    ...commonErrorResponses,
  },
};

// Schema for the Channel object itself
const channelObjectSchema = {
  type: 'object',
  properties: {
    channel_name: {
      description: 'The name of the channel',
      type: 'string',
    },
    channel_id: {
      description: 'The id of the channel',
      type: 'string',
    },
    operations_category: {
      description: 'The operations category of the channel.',
      type: 'string',
    },
    description: {
      description: 'Description of the eha channel.',
      type: 'string',
    },
    derived: {
      description: 'Limits the query on whether the channel is ground derived.',
      type: 'string',
      enum: ['Yes', 'No'],
    },
    eu_present: {
      description: 'Indicates if an engineering unit value is defined for the channel.',
      type: 'string',
      enum: ['Yes', 'No'],
    },
    type: {
      type: 'string',
      enum: ['integer', 'unsigned', 'string', 'float', 'boolean', 'time', 'enum'],
    },
    bit_size: {
      type: 'integer',
    },
    enumerations: {
      description: 'Used if the type is ENUM',
      type: 'array',
      items: enumerationsSchema, 
    },
  },
  
};

// Schema for POST /dictionaries/{dictionary_type}/versions/{dictionary_version}/channels
export const createChannelSchema = {
  summary: 'Create an Telemetry Channel',
  description: 'Creates an Telemetry Channel',
  tags: ['Dictionary Content'],
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
    type: 'array',
    items: channelObjectSchema
  },
  response: {
    200: { 
      description: 'Success. An Channel is created.',
      type:'array',
      items:channelObjectSchema, 
    },
    ...commonErrorResponses,
  },
};

// Schema for GET /dictionaries/{dictionary_type}/versions/{dictionary_version}/channels
export const getChannelsSchema = {
  summary: 'Get a list of channels',
  description: 'Returns a list of channels based on query parameters.',
  tags: ['Dictionary Content'],
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
      channel_name: {
        description: 'Limits (partial match) the query on channel_name',
        type: 'string',
      },
      ops_cat: {
        description: 'Limits (partial match) the result on the ops category',
        type: 'string',
      },
      description: {
        description: 'Limits (partial match) the query on channel description',
        type: 'string',
      },
      derived: {
        description: 'Limits the query on whether the channel is ground derived.',
        type: 'string',
        enum: ['Yes', 'No'],
      },
      channel_id: {
        description: 'Limits (partial match) the query on channel id (i.e. THRM-3012)',
        type: 'string',
      },
    },
  },
  response: {
    200: {
      description: 'Success. a list of all the channels.',
      headers: {
        'x-total-count': {
          description: 'The total number of resources',
          type: 'integer',
        },
      },
      type: 'array',
      items: channelObjectSchema,
    },
    ...commonErrorResponses,
  },
};

// Schema for POST /dictionaries/{dictionary_type}/versions/{dictionary_version}/channels/bulk_query
export const bulkQueryChannelsSchema = {
  summary: 'Queries Channels based on a list of Channel Names',
  description: 'Queries Channels based on channel names. Using POST instead of GET since many names may need to be sent. Returns up to 10000 channels.',
  tags: ['Dictionary Content'],
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
    description: 'Array of Channel names to query for',
    type: 'array',
    items: {
      type: 'string',
    }
  },
  response: {
    200: {
      description: 'Success. A list of matching Channels.',
      type: 'array',
      items: channelObjectSchema,
    },
    ...commonErrorResponses,
  },
};

// Schema for GET /dictionaries/{dictionary_type}/versions/{dictionary_version}/channels/{channel_name}
export const getChannelByNameSchema = {
  summary: 'Get details of a give channel',
  description: 'Returns the specifics of the Channel specified.',
  tags: ['Dictionary Content'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['dictionary_type', 'dictionary_version', 'channel_name'],
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
      channel_name: {
        description: 'The name of the EHA to return',
        type: 'string',
      },
    },
  },
  response: {
    200: {
      description: 'Success. A Channel.',
      ...channelObjectSchema, 
    },
    ...commonErrorResponses,
  },
};

// Schema for PATCH /dictionaries/{dictionary_type}/versions/{dictionary_version}/channels/{channel_name}
export const updateChannelSchema = {
  summary: 'update a channel',
  description: 'Updates a channel in the specified dictionary',
  tags: ['Dictionary Content'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['dictionary_type', 'dictionary_version', 'channel_name'],
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
      channel_name: {
        description: 'The name of the EHA to update',
        type: 'string',
      },
    },
  },
  body: channelObjectSchema,                   
  response: {
    200: {
      description: 'Success. The channel is updated.', 
      ...channelObjectSchema, 
    },
    ...commonErrorResponses,
  },
};

// Schema for DELETE /dictionaries/{dictionary_type}/versions/{dictionary_version}/channels/{channel_name}
export const deleteChannelSchema = {
  summary: 'Delete an Channel',
  description: 'Deletes the specified channel from the dictionary version',
  tags: ['Dictionary Content'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['dictionary_type', 'dictionary_version', 'channel_name'],
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
      channel_name: {
        description: 'The name of the EHA to delete',
        type: 'string',
      },
    },
  },
  response: {
    204: {
      description: 'Success. Deletion.',
      type: 'null', 
    },
    ...commonErrorResponses,
  },
};

// Schema for the Mil1553Details object itself
const mil1553DetailsObjectSchema = {
  type: 'object',
  properties: {
    mil1553_name: {
      description: 'Variable name of the 1553 measurement',
      type: 'string',
    },
    description: {
      description: 'Description of the 1553 variable',
      type: 'string',
    },
    operations_category: {
      description: 'The operations category of the 1553 variable.',
      type: 'string',
    },
    output_type: {
      description: 'Type of the variable',
      type: 'string',
      enum: ['INT', 'UINT', 'BIN', 'FLOAT', 'HEX'],
    },
    sub_address: {
      description: 'The sub-address for the 1553 variable',
      type: 'integer',
    },
    remote_terminal: {
      description: 'The remote terminal for the 1553 variable',
      type: 'integer',
    },
    transmit_receive: {
      description: 'Whether the 1553 variable is for Transmitting or Receiving',
      type: 'string',
      enum: ['TRANSMIT', 'RECEIVE'],
    },
    eu_present: {
      description: 'Indicates if an engineering unit value is defined for the channel.',
      type: 'string',
      enum: ['Yes', 'No'],
    },
    enumerations: {
      description: 'Used if the type is ENUM',
      type: 'array',
      items: enumerationsSchema, 
    },
  },
};

// Schema for POST /dictionaries/{dictionary_type}/versions/{dictionary_version}/mil1553
export const createMil1553VariableSchema = {
  summary: 'Create a 1553 Variable',
  description: 'Creates a 1553 Variable',
  tags: ['Dictionary Content'],
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
    type:'array', 
    items:mil1553DetailsObjectSchema
  }, 
  response: {
    200: { 
      description: 'Success. An 1553 Variable is created.',
      type:'array', 
      items:mil1553DetailsObjectSchema, 
    },
    ...commonErrorResponses,
  },
};

// Schema for GET /dictionaries/{dictionary_type}/versions/{dictionary_version}/mil1553
export const getMil1553VariablesSchema = {
  summary: 'Get a list of 1553 variables',
  description: 'Returns a list of 1553 channels based on query parameters.',
  tags: ['Dictionary Content'],
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
      mil1553_name: {
        description: 'Limits (partial match) the query on mil1553 variable name',
        type: 'string',
      },
      ops_cat: {
        description: 'Limits (partial match) the result on the ops category',
        type: 'string',
      },
      output_type: {
        description: 'Type of the variable',
        type: 'string',
        enum: ['INT', 'UINT', 'BIN', 'FLOAT', 'HEX'],
      },
      description: {
        description: 'Limits (partial match) the query on mil1553 variable description',
        type: 'string',
      },
      remote_terminal: {
        description: 'Limits (partial match) the query on 1553 remote terminal number',
        type: 'integer',
      },
      sub_address: {
        description: 'Limits (partial match) the query on the 1553 sub-address',
        type: 'integer',
      },
      transmit_receive: {
        description: 'Limits the query on whether the variable is for transmit or receive',
        type: 'string',
        enum: ['TRANSMIT', 'RECEIVE'],
      },
    },
  },
  response: {
    200: {
      description: 'Success. A list of mil1553 variables.',
      headers: {
        'x-total-count': {
          description: 'The total number of resources',
          type: 'integer',
        },
      },
      type: 'array',
      items: mil1553DetailsObjectSchema,
    },
    ...commonErrorResponses,
  },
};

// Schema for POST /dictionaries/{dictionary_type}/versions/{dictionary_version}/mil1553/bulk_query
export const bulkQueryMil1553VariablesSchema = {
  summary: 'Queries mil1553 variables based on a list of mil Names',
  description: 'Queries mil1553 variables based on mil1553 names. Using POST instead of GET since many names may need to be sent. Returns up to 10000 variables.',
  tags: ['Dictionary Content'],
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
    description: 'Array of mil1553 names to query for',
    type: 'array',
    items: {
      type: 'string',
    }
  },
  response: {
    200: {
      description: 'Success. A list of matching mil1553 variables.',
      type: 'array',
      items: mil1553DetailsObjectSchema,
    },
    ...commonErrorResponses,
  },
};

// Schema for GET /dictionaries/{dictionary_type}/versions/{dictionary_version}/mil1553/{mil1553_name}
export const getMil1553VariableByNameSchema = {
  summary: 'Get details of a given 1553 variable',
  description: 'Returns the specifics of the 1553 variable specified.',
  tags: ['Dictionary Content'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['dictionary_type', 'dictionary_version', 'mil1553_name'],
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
      mil1553_name: {
        description: 'The name of the mil1553 variable to return',
        type: 'string',
      },
    },
  },
  response: {
    200: {
      description: 'Success. 1553 details provided',
      ...mil1553DetailsObjectSchema, 
    },
    ...commonErrorResponses,
  },
};

// Schema for PATCH /dictionaries/{dictionary_type}/versions/{dictionary_version}/mil1553/{mil1553_name}
export const updateMil1553VariableSchema = {
  summary: 'update a mil1553 variable',
  description: 'Updates an mil1553 variable in the specified dictionary',
  tags: ['Dictionary Content'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['dictionary_type', 'dictionary_version', 'mil1553_name'],
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
      mil1553_name: {
        description: 'The name of the mil1553 variable to update',
        type: 'string',
      },
    },
  },
  body: mil1553DetailsObjectSchema,
  response: {
    200: {
      description: 'Success. The mil1553 variable is updated.',
      ...mil1553DetailsObjectSchema, 
    },
    ...commonErrorResponses,
  },
};

// Schema for DELETE /dictionaries/{dictionary_type}/versions/{dictionary_version}/mil1553/{mil1553_name}
export const deleteMil1553VariableSchema = {
  summary: 'Delete an mil1553 variable',
  description: 'Deletes the specified mil1553 variable from the dictionary version',
  tags: ['Dictionary Content'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['dictionary_type', 'dictionary_version', 'mil1553_name'],
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
      mil1553_name: {
        description: 'The name of the mil1553 variable to delete',
        type: 'string',
      },
    },
  },
  response: {
    204: {
      description: 'Success. Deletion.',
      type: 'null', 
    },
    ...commonErrorResponses,
  },
};
