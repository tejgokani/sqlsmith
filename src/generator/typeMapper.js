/**
 * Map JavaScript types to PostgreSQL types
 */

const TYPE_MAP = {
  // JavaScript native types
  string: 'text',
  number: 'integer',
  boolean: 'boolean',
  object: 'jsonb',
  array: 'jsonb',
  
  // PostgreSQL types
  text: 'text',
  varchar: 'varchar',
  integer: 'integer',
  int: 'integer',
  bigint: 'bigint',
  smallint: 'smallint',
  numeric: 'numeric',
  decimal: 'decimal',
  real: 'real',
  'double precision': 'double precision',
  serial: 'serial',
  bigserial: 'bigserial',
  
  // UUID
  uuid: 'uuid',
  
  // Date/Time
  date: 'date',
  time: 'time',
  timestamp: 'timestamp',
  timestamptz: 'timestamptz',
  interval: 'interval',
  
  // JSON
  json: 'json',
  jsonb: 'jsonb',
  
  // Arrays
  'text[]': 'text[]',
  'integer[]': 'integer[]',
  'uuid[]': 'uuid[]',
  
  // Other
  bytea: 'bytea',
  bool: 'boolean',
};

/**
 * Map a type string to PostgreSQL type
 */
export function mapType(type, config = {}) {
  const cleanType = type.toLowerCase().trim();
  
  // Check for custom type overrides
  if (config.typeOverrides && config.typeOverrides[cleanType]) {
    return config.typeOverrides[cleanType];
  }
  
  // Map standard types
  if (TYPE_MAP[cleanType]) {
    return TYPE_MAP[cleanType];
  }
  
  // Handle array types like "text[]"
  if (cleanType.endsWith('[]')) {
    const baseType = cleanType.slice(0, -2);
    if (TYPE_MAP[baseType]) {
      return `${TYPE_MAP[baseType]}[]`;
    }
  }
  
  // Default fallback
  return cleanType;
}

/**
 * Get default value for a type
 */
export function getDefaultForType(type) {
  const mapped = mapType(type);
  
  const defaults = {
    'text': "''",
    'integer': '0',
    'boolean': 'false',
    'jsonb': "'{}'",
    'json': "'{}'",
    'uuid': 'gen_random_uuid()',
    'timestamptz': 'now()',
    'timestamp': 'now()',
  };
  
  return defaults[mapped] || null;
}
