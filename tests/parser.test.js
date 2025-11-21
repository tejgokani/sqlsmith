import { test } from 'node:test';
import assert from 'node:assert';
import { parseSchema } from '../src/parser/parseSchema.js';
import { validateSchema } from '../src/parser/validateSchema.js';

test('parseSchema: basic shorthand parsing', () => {
  const schema = {
    users: {
      id: 'uuid:pk',
      name: 'text:notnull',
      email: 'text:unique:notnull',
    },
  };

  const ast = parseSchema(schema);

  assert.ok(ast.tables.users);
  assert.equal(ast.tables.users.columns.length, 3);

  const idCol = ast.tables.users.columns.find((c) => c.name === 'id');
  assert.equal(idCol.type, 'uuid');
  assert.equal(idCol.constraints.pk, true);

  const emailCol = ast.tables.users.columns.find((c) => c.name === 'email');
  assert.equal(emailCol.constraints.unique, true);
  assert.equal(emailCol.constraints.notnull, true);
});

test('parseSchema: default values', () => {
  const schema = {
    users: {
      age: 'integer:default=18',
      created_at: 'timestamptz:default=now()',
    },
  };

  const ast = parseSchema(schema);

  const ageCol = ast.tables.users.columns.find((c) => c.name === 'age');
  assert.equal(ageCol.constraints.default, '18');

  const createdCol = ast.tables.users.columns.find((c) => c.name === 'created_at');
  assert.equal(createdCol.constraints.default, 'now()');
});

test('parseSchema: foreign keys', () => {
  const schema = {
    profiles: {
      id: 'uuid:pk',
      user_id: 'uuid:fk=users.id',
    },
  };

  const ast = parseSchema(schema);

  const userIdCol = ast.tables.profiles.columns.find((c) => c.name === 'user_id');
  assert.equal(userIdCol.constraints.fk.table, 'users');
  assert.equal(userIdCol.constraints.fk.column, 'id');
  assert.equal(ast.tables.profiles.foreignKeys.length, 1);
});

test('parseSchema: nested objects as jsonb', () => {
  const schema = {
    users: {
      profile: {
        bio: 'text',
        avatar: 'text',
      },
    },
  };

  const ast = parseSchema(schema);

  const profileCol = ast.tables.users.columns.find((c) => c.name === 'profile');
  assert.equal(profileCol.type, 'jsonb');
});

test('validateSchema: reject empty schema', () => {
  assert.throws(() => {
    validateSchema({});
  }, /Schema cannot be empty/);
});

test('validateSchema: reject invalid column type', () => {
  assert.throws(() => {
    validateSchema({
      users: {
        id: 123,
      },
    });
  }, /must be a string or object/);
});

test('parseSchema: timestamps config', () => {
  const schema = {
    users: {
      id: 'uuid:pk',
    },
  };

  const config = {
    timestamps: true,
  };

  const ast = parseSchema(schema, config);

  const createdAt = ast.tables.users.columns.find((c) => c.name === 'created_at');
  const updatedAt = ast.tables.users.columns.find((c) => c.name === 'updated_at');

  assert.ok(createdAt);
  assert.ok(updatedAt);
  assert.equal(createdAt.type, 'timestamptz');
});
