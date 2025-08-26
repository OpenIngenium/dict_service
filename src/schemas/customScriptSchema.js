// src/schemas/customScriptSchema.js

import { commonErrorResponses } from './shared_schemas/sharedSchemas.js';



// Schema for ScriptOutputArrayField
const ScriptOutputArrayField = {
  type: 'object',
  description: 'Definition of a single custom script output',
  properties: {
    name: {
      description: 'The name of the output (the "key")',
      type: 'string'
    },
    description: {
      description: 'Description of the output field',
      type: 'string'
    },
    visible: {
      description: 'Whether the field is displayed in the array table or in the mouse over details',
      type: 'string',
      enum: ['YES', 'NO']
    },
    type: {
      description: 'Type of the argument',
      type: 'string',
      enum: [
        'INT',
        'STRING',
        'FLOAT'
      ]
    }
  }
}

// Schema for ScriptOutputArray
const ScriptOutputArray = {
  type: 'object',
  description: 'Definition of an array of outputs that can be repeated',
  properties: {
    name: {
      description: 'The name of the output array (the "key")',
      type: 'string'
    },
    description: {
      description: 'Description of the output array',
      type: 'string'
    },
    max_entries: {
      description: 'Maximum number of entries (Should not exceed ~10)',
      type: 'integer'
    },
    outputs: {
      description: 'Array of ScriptOutputArrayFields',
      type: 'array',
      items: ScriptOutputArrayField
    }
  }
}

// Schema for ScriptOutput
const ScriptOutput = {
  type: 'object',
  description: 'Definition of a single custom script output',
  properties: {
    name: {
      description: 'The name of the output (the "key")',
      type: 'string'
    },
    description: {
      description: 'Description of the output field',
      type: 'string'
    },
    type: {
      description: 'Type of the argument',
      type: 'string',
      enum: [
        'INT',
        'STRING',
        'FLOAT',
        'FILE',
        'IMAGE',
        'SERIES'
      ]
    }
  }
}

// Schema for Template
const Template = {
  type: 'object',
  properties: {
    template: {
      type: 'string',
      description: 'A formatted string using python style f"" formating where the variables are output fields (E.g. "The {criminals} were no match for {superhero}")'
    }
  }
}

// Schema for Layout
const Layout = {
  type: 'object',
  properties: {
    row: {
      type: 'integer',
      description: 'Vertical position of the field in the UI, expressed as "rows" (starting at 1)'
    },
    column: {
      type: 'integer',
      description: 'Horizontal position of the field in the UI, expressed as "columns" (starting at 1 max of 12)',
      minimum: 1,
      maximum: 12
    },
    width: {
      type: 'integer',
      description: 'Nominal width of a field expressed as "columns" or increments of 1/12 of available screen widths',
      minimum: 1,
      maximum: 12
    },
    height: {
      type: 'integer',
      description: 'Nominal height of a field (in rows)'
    },
    align: {
      type: 'string',
      description: 'Alignment (within column)',
      enum: ['LEFT', 'RIGHT', 'CENTER']
    }
  }
}


// Schema for LayoutDisplay
const LayoutDisplay = {
  type: 'object',
  properties: {
    layout_type: {
      type: 'string',
      enum: ['DISPLAY']
    },
    template: {
      ...Template
    },
    layout: {
      ...Layout
    }
  },
  required: ['layout_type']
}

// Schema for Label
const Label = {
  type: 'object',
  properties: {
    label_content: {
      type: 'string',
      description: 'The content of the label'
    },
    label_loc: {
      type: 'string',
      description: 'Where the label is placed relative to the content',
      enum: ['LEFT', 'RIGHT', 'TOP', 'BOTTOM']
    },
    label_align: {
      type: 'string',
      description: 'How the label is aligned in its location relative to its content',
      enum: ['LEFT', 'RIGHT', 'CENTER']
    }
  }
}

// Schema for LayoutField
const LayoutField = {
  type: 'object',
  properties: {
    layout_type: {
      type: 'string',
      enum: ['FIELD']
    },
    field_name: {
      type: 'string',
      description: 'The variable to input/display (must match a field defined in custom script)'
    },
    label: {
      ...Label
    },
    tool_tip: {
      type: 'string',
      description: 'Optional hover text to display input assistance / help'
    },
    layout: {
      ...Layout
    }
  },
  required: ['layout_type']
}

// Schema for MouseoverElement
const MouseoverElement = {
  type: 'object',
  properties: {
    field_name: {
      type: 'string',
      description: 'The variable to display (must match a field defined in custom script)'
    },
    display_name: {
      type: 'string',
      description: 'The more human readable lable or display name for the field. If not provided the field name will be used.'
    }
  }
}


// Schema for Mouseover
const Mouseover = {
  type: 'object',
  properties: {
    mouseover_elements: {
      type: 'array',
      items: MouseoverElement
    }
  }
}


// Schema for Icon
const Icon = {
  type: 'object',
  properties: {
    layout_type: {
      type: 'string',
      enum: ['ICON']
    },
    icon_type: {
      type: 'string',
      description: 'Icon Type Status maps to step or entry pass/fail/error status (check/X) Icon Type Details is an "eye icon"',
      enum: ['STATUS', 'DETAILS']
    },
    mouseover: {
      ...Mouseover
    },
    layout: {
      ...Layout
    }
  },
  required: ['layout_type']
}

// Schema for HeaderLayout
const HeaderLayout = {
  type: 'object',
  properties: {
    headerlayout: {
      type: 'array',
      description: 'A Header is visible at L2 and can contain individual fields, displays, and icons.',
      items: {
        anyOf: [
          { ...LayoutDisplay },
          { ...LayoutField },
          { ...Icon }
        ]
      }
    }
  },
}

// Schema for ImageLayout
const ImageLayout = {
  type: 'object',
  properties: {
    layout_type: {
      type: 'string',
      enum: ['IMAGE']
    },
    field_name: {
      type: 'string',
      description: 'The variable to display (must match an image output field defined)'
    },
    label: {
      ...Label
    },
    layout: {
      ...Layout
    }
  },
  required: ['layout_type']
}

// Schema for ContentLayout
const ContentLayout = {
  type: 'object',
  properties: {
    contentlayout: {
      type: 'array',
      description: 'Content is visible at L3 and contain individual fields, displays, icons, and Images',
      items: {
        anyOf: [
          { ...LayoutDisplay },
          { ...LayoutField },
          { ...Icon },
          { ...ImageLayout }
        ]
      }
    }
  }
}

// Schema for TableColumn
const TableColumn = {
  type: 'object',
  properties: {
    width: {
      type: 'integer',
      description: 'Nominal width of the field in the table (starting at 1 max of 12) This is expressed as "columns" or increments of 1/12 of available screen widths',
      minimum: 1,
      maximum: 12
    },
    column_label: {
      type: 'string',
      description: 'The Column header definition'
    },
    template: {
      ...Template
    }
  }
}

// Schema for TableLayout
const TableLayout = {
  type: 'object',
  properties: {
    layout_type: {
      type: 'string',
      enum: ['TABLE']
    },
    table_name: {
      type: 'string',
      description: 'Table to display (needs to correspond with a output_array_field field)'
    },
    label: {
      ...Label
    },
    row_height: {
      type: 'integer'
    },
    mouseover: {
      ...Mouseover
    },
    table_column: {
      type: 'array',
      items: {
        ...TableColumn
      }
    }
  },
  required: ['layout_type']
}

// Schema for SeriesConfig
const SeriesConfig = {
  type: 'object',
  description: 'This information is used to graph some or all of the data contained in a series. All data is expected to be time series and can either be displayed as a horizontal line (value, time) which is typically used for channels, or a veritical line (@ time with the value used as the label) which just illustrates when a paticular pierce of telemtry was received.',
  properties: {
    variable_name: {
      type: 'string',
      description: 'This should match the variable name of one of the variables in the series.',
    },
    chart_type: {
      type: 'string',
      enum: ['VERTICAL_LINE', 'HORIZONTAL_LINE']
    },
    color: {
      type: 'string',
      description: 'Optional attribute to specify the color for this data series. Use 6 digit Hex color codes. (https://echarts.apache.org/en/option.html#color) If color is not provided, Ingenium will automatically pick a color.',
      pattern: '(([0-9A-Fa-f]){6})'
    }
  }
}

// Schema for SeriesLayout
const SeriesLayout = {
  type: 'object',
  properties: {
    layout_type: {
      type: 'string',
      enum: ['SERIES']
    },
    field_name: {
      type: 'string',
      description: 'The variable to display (must match an series output field defined)',
    },
    series_config: {
      type: 'array',
      description: 'This defines how to graph each variable in the series.',
      items: {
        ...SeriesConfig
      }
    },
    label: {
      ...Label
    },
    layout: {
      ...Layout
    }
  },
  required: ['layout_type']
}

const InputLayoutField = {
  ...LayoutField
}

const OutputLayoutField = {
  ...LayoutField
}

// Schema for ResultsLayout
const ResultsLayout = {
  type: 'object',
  properties: {
    resultslayout: {
      type: 'array',
      description: 'Results are visible at L2 and can contain all outputs.',
      items: {
        anyOf: [
          { ...LayoutDisplay },
          { ...InputLayoutField },
          { ...OutputLayoutField },
          { ...Icon },
          { ...ImageLayout },
          { ...TableLayout },
          { ...SeriesLayout }
        ]
      }
    }
  }
}


// Schema for SectionLayout
const SectionLayout = {
  type: 'object',
  properties: {
    entry: {
      type: 'string',
      enum: ['TRUE', 'FALSE'],
      description: 'This indicates if the section is an entry and can repeat multiple times. There can only be one entry per custom script.'
    },
    header: {
      ...HeaderLayout
    },
    content: {
      ...ContentLayout
    },
    results: {
      ...ResultsLayout
    }
  }
}

// Schema for Enumerations
const Enumerations = {
  type: 'object',
  properties: {
    symbol: {
      description: 'Display value of the enumeration',
      type: 'string'
    },
    numeric: {
      description: 'Numeric value of the enumeration',
      type: 'integer'
    }
  }
}

// Schema for the ScriptInput object itself
const ScriptInput = {
  type: 'object',
  description: 'Definition of a single custom script input',
  properties: {
    name: {
      description: 'The name of the input (the "key")',
      type: 'string',
    },
    description: {
      description: 'Description of the input field',
      type: 'string'
    },
    phase: {
      description: 'Whether the script input is an authoring or execution phase input',
      type: 'string',
      enum: ['AUTHORING', 'EXECUTION']
    },
    input_required: {
      description: 'Whether the input is required or optional',
      type: 'string',
      enum: ['YES', 'NO']
    },
    type: {
      description: 'Type of the argument',
      type: 'string',
      enum: [
        'INT',
        'STRING',
        'FLOAT',
        'ENUM',
        'DATA_PATH',
        'TIME',
        'BOOL',
        'FLIGHT_COMMAND',
        'SIM_COMMAND',
        'FLIGHT_EVR',
        'FLIGHT_TELEM',
        'SIM_EVR',
        'SIM_TELEM',
        'VERIFICATION_COND'
      ]
    },
    enumerations: {
      description: 'Used if the argument_type is ENUM',
      type: 'array',
      items: Enumerations
    },
    default_value: {
      description: 'This value will be used to pre-populate the input field, if provided',
      type: 'string'
    }
  }
}


// Schema for ScriptEntry
const ScriptEntry = {
  type: 'object',
  description: 'Definition of a group of inputs and outputs (with a pass/fail status)',
  properties: {
    display_field: {
      description: 'The name of an output field that will be displayed as the primary results',
      type: 'string'
    },
    entry_inputs: {
      description: 'Input fields for the entry',
      type: 'array',
      items: ScriptInput
    },
    entry_outputs: {
      description: 'Output fields for the entry',
      type: 'array',
      items: ScriptOutput
    },
    entry_output_array: {
      ...ScriptOutputArray
    }
  }
}

// Schema for the CustomScript object itself
const CustomScriptObjectSchema = {
  type: 'object',
  properties: {
    script_id: {
      description: 'Unique id of the script. This should be a hash of script_path (for example SHA256).',
      type: 'string',
    },
    script_path: {
      description: 'Path to the script',
      type: 'string',
    },
    script_name: {
      description: 'Name of the script',
      type: 'string',
    },
    description: {
      description: 'Description of the script',
      type: 'string',
    },
    hash: {
      description: 'SHA 256 hash of the script',
      type: 'string',
    },
    status: {
      description: 'Status of the script',
      type: 'string',
      enum: ['ACTIVE', 'INACTIVE'],
    },
    inputs: {
      description: 'Array of script inputs.',
      type: 'array',
      items: ScriptInput
    },
    entries: {
      description: 'input and output fields of entry',
      type: 'array',
      items: ScriptEntry
    },
    outputs: {
      description: 'array of output',
      type: 'array',
      items: ScriptOutput
    },
    output_array: {
      ...ScriptOutputArray
    },
    layout: {
      description: 'Adds advanced layout options to the custom script',
      type: 'array',
      items: SectionLayout
    },
  },
};

// Schema for GET /custom_scripts
export const getCustomScriptsSchema = {
  summary: 'Get list of all scripts registered in Ingenium',
  description: 'Get list of all scripts registered in Ingenium',
  tags: ['Scripts'],
  security: [{ bearerAuth: [] }],
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
      wild: {
        description: 'Modifies search fields to use search optimized (true) vs. typeahead optimized (false)',
        type: 'boolean',
        default: false,
      },
      script_path: {
        description: 'Limits (partial match) the query on custom script path',
        type: 'string',
      },
      script_name: {
        description: 'Limits (partial match) the query on custom script name',
        type: 'string',
      },
      description: {
        description: 'Limits (partial match) the query on script description',
        type: 'string',
      },
      status: {
        description: 'Limits (partial match) the query on script status',
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE'],
      },
    },
  },
  response: {
    200: {
      description: 'Success. a list of all the custom scripts.',
      headers: {
        'x-total-count': {
          description: 'The total number of scripts',
          type: 'integer',
        },
      },
      type: 'array',
      items: CustomScriptObjectSchema,
    },
    ...commonErrorResponses,
  },
};

// Schema for POST /custom_scripts
export const createCustomScriptSchema = {
  summary: 'Create a definition of a custom script in Ingenium',
  description: 'Create a custom script definition',
  tags: ['Scripts'],
  security: [{ bearerAuth: [] }],
  body: {
    type: 'array',
    items: CustomScriptObjectSchema
  },
  response: {
    201: {
      description: 'Success. Custom Script Dictionary updated.',
      type: 'array',
      items: CustomScriptObjectSchema,
    },
    ...commonErrorResponses,
  },
};

// Schema for POST /custom_scripts/bulk_query
export const bulkQueryCustomScriptsSchema = {
  summary: 'Queries custom scripts based on script ids',
  description: 'Queries custom scripts based on script ids. Using POST instead of GET since many ids may need to be sent. Returns up to 10000 scripts.',
  tags: ['Scripts'],
  security: [{ bearerAuth: [] }],
  body: {
    description: 'A list of script IDs to query.',
    type: 'array',
    items: { type: 'string' },
  },
  response: {
    200: {
      description: 'Success. Returns custom scripts matching the provided IDs.',
      type: 'array',
      items: CustomScriptObjectSchema,
    },
    ...commonErrorResponses,
  },
};

const customScriptUpdateSchema = {
  type: 'object',
  properties: {
    script_path: {
      description: 'Path to the script',
      type: 'string',
    },
    script_name: {
      description: 'Name of the script',
      type: 'string',
    },
    description: {
      description: 'Description of the script',
      type: 'string',
    },
    status: {
      description: 'Status of the script',
      type: 'string',
      enum: ['ACTIVE', 'INACTIVE'],
    },
  },
};

// Schema for GET /custom_scripts/{script_id}
export const getCustomScriptByIdSchema = {
  summary: 'Gets details of a single script',
  description: 'Gets the details on a single custom script',
  tags: ['Scripts'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['script_id'],
    properties: {
      script_id: {
        description: 'Unique id of the script.',
        type: 'string',
      },
    },
  },
  response: {
    200: {
      description: 'Success. Details on specific script.',
      ...CustomScriptObjectSchema,
    },
    ...commonErrorResponses,
  },
};

// Schema for PATCH /custom_scripts/{script_id}
export const updateCustomScriptSchema = {
  summary: 'Update the status of a custom script in Ingenium',
  description: 'Update a custom script definition',
  tags: ['Scripts'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['script_id'],
    properties: {
      script_id: {
        description: 'Unique id of the script.',
        type: 'string',
      },
    },
  },
  body: CustomScriptObjectSchema,
  response: {
    200: {
      description: 'Success. Custom Script Dictionary updated.',
      ...CustomScriptObjectSchema,
    },
    ...commonErrorResponses,
  },
};

// Schema for DELETE /custom_scripts/{script_id}
export const deleteCustomScriptSchema = {
  summary: 'Deletes a custom script in Ingenium',
  description: 'Deletes a custom script definition',
  tags: ['Scripts'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    required: ['script_id'],
    properties: {
      script_id: {
        description: 'Unique id of the script.',
        type: 'string',
      },
    },
  },
  response: {
    204: {
      description: 'Success. Script deleted.',
      type: 'null',
    },
    ...commonErrorResponses,
  },
};
