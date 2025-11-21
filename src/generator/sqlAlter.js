/**
 * Generate ALTER TABLE SQL from schema differences
 */

import { parseSchema } from '../parser/parseSchema.js';

export function generateAlterSQL(oldSchema, newSchema, config = {}) {
  // Parse both schemas
  const oldAST = parseSchema(oldSchema, config);
  const newAST = parseSchema(newSchema, config);

  const alterStatements = [];
  const schema = config.schema || 'public';

  // Find tables that exist in new but not old (CREATE TABLE)
  for (const tableName of Object.keys(newAST.tables)) {
    if (!oldAST.tables[tableName]) {
      alterStatements.push({
        type: 'CREATE_TABLE',
        table: tableName,
        warning: false,
      });
    }
  }

  // Find tables that exist in old but not new (DROP TABLE - destructive!)
  for (const tableName of Object.keys(oldAST.tables)) {
    if (!newAST.tables[tableName]) {
      alterStatements.push({
        type: 'DROP_TABLE',
        table: tableName,
        warning: true,
        destructive: true,
      });
    }
  }

  // Compare tables that exist in both
  for (const tableName of Object.keys(newAST.tables)) {
    if (oldAST.tables[tableName]) {
      const tableDiff = diffTables(
        oldAST.tables[tableName],
        newAST.tables[tableName],
        schema
      );
      alterStatements.push(...tableDiff);
    }
  }

  return generateAlterStatementsSQL(alterStatements, schema, config);
}

function diffTables(oldTable, newTable, schema) {
  const alterStatements = [];

  // Column changes
  const oldColumns = new Map(oldTable.columns.map((c) => [c.name, c]));
  const newColumns = new Map(newTable.columns.map((c) => [c.name, c]));

  // New columns (ADD COLUMN)
  for (const [colName, column] of newColumns) {
    if (!oldColumns.has(colName)) {
      alterStatements.push({
        type: 'ADD_COLUMN',
        table: newTable.name,
        column,
        warning: false,
      });
    }
  }

  // Removed columns (DROP COLUMN - destructive!)
  for (const [colName, column] of oldColumns) {
    if (!newColumns.has(colName)) {
      alterStatements.push({
        type: 'DROP_COLUMN',
        table: newTable.name,
        column: colName,
        warning: true,
        destructive: true,
      });
    }
  }

  // Modified columns (ALTER COLUMN)
  for (const [colName, newCol] of newColumns) {
    const oldCol = oldColumns.get(colName);
    if (oldCol) {
      const changes = diffColumns(oldCol, newCol);
      if (changes.length > 0) {
        alterStatements.push({
          type: 'ALTER_COLUMN',
          table: newTable.name,
          column: colName,
          changes,
          warning: changes.some((c) => c.destructive),
        });
      }
    }
  }

  return alterStatements;
}

function diffColumns(oldCol, newCol) {
  const changes = [];

  // Type change (potentially destructive)
  if (oldCol.type !== newCol.type) {
    changes.push({
      type: 'TYPE',
      from: oldCol.type,
      to: newCol.type,
      destructive: true,
    });
  }

  // NOT NULL constraint
  const oldNotNull = oldCol.constraints.notnull || oldCol.constraints.pk;
  const newNotNull = newCol.constraints.notnull || newCol.constraints.pk;

  if (!oldNotNull && newNotNull) {
    changes.push({
      type: 'SET_NOT_NULL',
      destructive: false,
    });
  } else if (oldNotNull && !newNotNull) {
    changes.push({
      type: 'DROP_NOT_NULL',
      destructive: false,
    });
  }

  // Default value
  if (oldCol.constraints.default !== newCol.constraints.default) {
    if (newCol.constraints.default !== undefined) {
      changes.push({
        type: 'SET_DEFAULT',
        value: newCol.constraints.default,
        destructive: false,
      });
    } else {
      changes.push({
        type: 'DROP_DEFAULT',
        destructive: false,
      });
    }
  }

  return changes;
}

function generateAlterStatementsSQL(alterStatements, schema, config) {
  const sqlLines = [];
  const warnings = [];

  for (const stmt of alterStatements) {
    if (stmt.warning) {
      warnings.push(
        `-- WARNING: ${stmt.type} on ${stmt.table}${
          stmt.column ? '.' + stmt.column : ''
        } is DESTRUCTIVE!`
      );
    }

    switch (stmt.type) {
      case 'ADD_COLUMN':
        sqlLines.push(
          `ALTER TABLE ${schema}.${stmt.table} ADD COLUMN ${stmt.column.name} ${stmt.column.type}${generateConstraints(stmt.column.constraints)};`
        );
        break;

      case 'DROP_COLUMN':
        sqlLines.push(
          `-- ALTER TABLE ${schema}.${stmt.table} DROP COLUMN ${stmt.column};`
        );
        break;

      case 'ALTER_COLUMN':
        for (const change of stmt.changes) {
          switch (change.type) {
            case 'TYPE':
              sqlLines.push(
                `-- ALTER TABLE ${schema}.${stmt.table} ALTER COLUMN ${stmt.column} TYPE ${change.to};`
              );
              break;

            case 'SET_NOT_NULL':
              sqlLines.push(
                `ALTER TABLE ${schema}.${stmt.table} ALTER COLUMN ${stmt.column} SET NOT NULL;`
              );
              break;

            case 'DROP_NOT_NULL':
              sqlLines.push(
                `ALTER TABLE ${schema}.${stmt.table} ALTER COLUMN ${stmt.column} DROP NOT NULL;`
              );
              break;

            case 'SET_DEFAULT':
              sqlLines.push(
                `ALTER TABLE ${schema}.${stmt.table} ALTER COLUMN ${stmt.column} SET DEFAULT ${change.value};`
              );
              break;

            case 'DROP_DEFAULT':
              sqlLines.push(
                `ALTER TABLE ${schema}.${stmt.table} ALTER COLUMN ${stmt.column} DROP DEFAULT;`
              );
              break;
          }
        }
        break;
    }
  }

  if (warnings.length > 0) {
    return warnings.join('\n') + '\n\n' + sqlLines.join('\n');
  }

  return sqlLines.join('\n');
}

function generateConstraints(constraints) {
  const parts = [];

  if (constraints.notnull) {
    parts.push('NOT NULL');
  }

  if (constraints.unique) {
    parts.push('UNIQUE');
  }

  if (constraints.default !== undefined) {
    parts.push(`DEFAULT ${constraints.default}`);
  }

  return parts.length > 0 ? ' ' + parts.join(' ') : '';
}
