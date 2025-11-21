/**
 * Generate CREATE TABLE SQL from AST
 */

export function generateCreateSQL(ast, config = {}) {
  const sqlStatements = [];

  for (const [tableName, table] of Object.entries(ast.tables)) {
    const sql = generateCreateTableSQL(table, config);
    sqlStatements.push(sql);
  }

  return sqlStatements.join('\n\n');
}

function generateCreateTableSQL(table, config) {
  const schema = config.schema || 'public';
  const lines = [];

  lines.push(`CREATE TABLE IF NOT EXISTS ${schema}.${table.name} (`);

  // Generate column definitions
  const columnDefs = table.columns.map((column) => {
    return generateColumnDefinition(column, config);
  });

  lines.push(columnDefs.map((def) => `  ${def}`).join(',\n'));
  lines.push(');');

  return lines.join('\n');
}

function generateColumnDefinition(column, config) {
  const parts = [];

  // Column name and type
  parts.push(`${column.name} ${column.type}`);

  // Constraints
  const { constraints } = column;

  if (constraints.pk) {
    parts.push('PRIMARY KEY');
  }

  if (constraints.unique && !constraints.pk) {
    parts.push('UNIQUE');
  }

  if (constraints.notnull && !constraints.pk) {
    parts.push('NOT NULL');
  }

  if (constraints.default !== undefined) {
    const defaultValue = formatDefaultValue(constraints.default, column.type);
    parts.push(`DEFAULT ${defaultValue}`);
  }

  if (constraints.fk) {
    const fkSchema = config.schema || 'public';
    parts.push(
      `REFERENCES ${fkSchema}.${constraints.fk.table}(${constraints.fk.column})`
    );
  }

  return parts.join(' ');
}

function formatDefaultValue(value, type) {
  // If value is a function call like now(), gen_random_uuid(), etc.
  if (value.includes('(') || value === 'true' || value === 'false' || !isNaN(value)) {
    return value;
  }

  // If already quoted, return as-is
  if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
    return value;
  }

  // For JSON types
  if (type === 'jsonb' || type === 'json') {
    return `'${value}'`;
  }

  // For text types, wrap in quotes
  if (type === 'text' || type === 'varchar') {
    return `'${value}'`;
  }

  return value;
}

/**
 * Generate a single CREATE TABLE statement
 */
export function generateCreateTable(tableName, columns, config = {}) {
  const schema = config.schema || 'public';
  const lines = [];

  lines.push(`CREATE TABLE IF NOT EXISTS ${schema}.${tableName} (`);

  const columnDefs = columns.map((col) => {
    if (typeof col === 'string') {
      return `  ${col}`;
    }
    return `  ${generateColumnDefinition(col, config)}`;
  });

  lines.push(columnDefs.join(',\n'));
  lines.push(');');

  return lines.join('\n');
}
