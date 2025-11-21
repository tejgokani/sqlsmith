import { test } from 'node:test';
import assert from 'node:assert';
import { generateSQL, diffSchemas } from '../src/index.js';
import { generateCreateSQL } from '../src/generator/sqlCreate.js';
import { parseSchema } from '../src/parser/parseSchema.js';

test('generateSQL: basic CREATE TABLE', () => {
  const schema = {
    users: {
      id: 'uuid:pk',
      name: 'text:notnull',
      email: 'text:unique:notnull',
    },
  };

  const sql = generateSQL(schema);

  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.users'));
  assert.ok(sql.includes('id uuid PRIMARY KEY'));
  assert.ok(sql.includes('name text NOT NULL'));
  assert.ok(sql.includes('email text UNIQUE NOT NULL'));
});

test('generateSQL: with default values', () => {
  const schema = {
    users: {
      age: 'integer:default=18',
      status: "text:default='active'",
      created_at: 'timestamptz:default=now()',
    },
  };

  const sql = generateSQL(schema);

  assert.ok(sql.includes('age integer DEFAULT 18'));
  assert.ok(sql.includes("status text DEFAULT 'active'"));
  assert.ok(sql.includes('created_at timestamptz DEFAULT now()'));
});

test('generateSQL: with foreign keys', () => {
  const schema = {
    profiles: {
      id: 'uuid:pk',
      user_id: 'uuid:fk=users.id',
    },
  };

  const sql = generateSQL(schema);

  assert.ok(sql.includes('user_id uuid REFERENCES public.users(id)'));
});

test('generateSQL: nested objects as jsonb', () => {
  const schema = {
    users: {
      profile: {
        bio: 'text',
        avatar: 'text',
      },
    },
  };

  const sql = generateSQL(schema);

  assert.ok(sql.includes('profile jsonb'));
});

test('generateSQL: multiple tables', () => {
  const schema = {
    users: {
      id: 'uuid:pk',
    },
    posts: {
      id: 'uuid:pk',
    },
  };

  const sql = generateSQL(schema);

  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.users'));
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS public.posts'));
});

test('diffSchemas: add column', () => {
  const oldSchema = {
    users: {
      id: 'uuid:pk',
    },
  };

  const newSchema = {
    users: {
      id: 'uuid:pk',
      name: 'text:notnull',
    },
  };

  const diff = diffSchemas(oldSchema, newSchema);

  assert.ok(diff.includes('ADD COLUMN'));
  assert.ok(diff.includes('name text NOT NULL'));
});

test('diffSchemas: drop column warning', () => {
  const oldSchema = {
    users: {
      id: 'uuid:pk',
      name: 'text',
    },
  };

  const newSchema = {
    users: {
      id: 'uuid:pk',
    },
  };

  const diff = diffSchemas(oldSchema, newSchema);

  assert.ok(diff.includes('WARNING'));
  assert.ok(diff.includes('DROP COLUMN'));
});

test('generateSQL: with custom config', () => {
  const schema = {
    users: {
      id: 'uuid:pk',
    },
  };

  const config = {
    schema: 'custom',
  };

  const sql = generateSQL(schema, config);

  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS custom.users'));
});
