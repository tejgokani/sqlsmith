/**
 * Schema validator
 */

export function validateSchema(schema) {
  if (!schema || typeof schema !== 'object') {
    throw new Error('Schema must be a non-null object');
  }

  if (Object.keys(schema).length === 0) {
    throw new Error('Schema cannot be empty');
  }

  for (const [tableName, tableSchema] of Object.entries(schema)) {
    if (!tableSchema || typeof tableSchema !== 'object') {
      throw new Error(`Table "${tableName}" schema must be an object`);
    }

    if (Object.keys(tableSchema).length === 0) {
      throw new Error(`Table "${tableName}" must have at least one column`);
    }

    for (const [columnName, columnDef] of Object.entries(tableSchema)) {
      validateColumn(tableName, columnName, columnDef);
    }
  }

  return true;
}

function validateColumn(tableName, columnName, columnDef) {
  // Column can be a string (shorthand) or object (nested)
  if (typeof columnDef !== 'string' && typeof columnDef !== 'object') {
    throw new Error(
      `Column "${tableName}.${columnName}" must be a string or object`
    );
  }

  // If it's a string, validate shorthand format
  if (typeof columnDef === 'string') {
    validateShorthand(tableName, columnName, columnDef);
  }
}

function validateShorthand(tableName, columnName, shorthand) {
  // Basic format: "type:modifier1:modifier2..."
  const parts = shorthand.split(':');
  
  if (parts.length === 0 || !parts[0]) {
    throw new Error(
      `Column "${tableName}.${columnName}" has invalid shorthand: "${shorthand}"`
    );
  }

  // Validate modifiers
  const validModifiers = ['pk', 'notnull', 'unique', 'default', 'fk'];
  
  for (let i = 1; i < parts.length; i++) {
    const modifier = parts[i].split('=')[0];
    if (!validModifiers.includes(modifier)) {
      throw new Error(
        `Column "${tableName}.${columnName}" has invalid modifier: "${modifier}"`
      );
    }
  }
}
