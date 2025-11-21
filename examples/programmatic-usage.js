/**
 * SQLSmith Programmatic API Examples
 */

import { generateSQL, diffSchemas, migrate, generatePolicies } from '../src/index.js';

// Example 1: Basic SQL Generation
console.log('=== Example 1: Basic SQL Generation ===\n');

const schema1 = {
  users: {
    id: "uuid:pk",
    name: "text:notnull",
    email: "text:unique:notnull",
    created_at: "timestamptz:default=now()"
  }
};

const sql1 = generateSQL(schema1);
console.log(sql1);
console.log('\n');

// Example 2: With Configuration
console.log('=== Example 2: With Configuration ===\n');

const schema2 = {
  articles: {
    id: "uuid:pk",
    title: "text:notnull",
    content: "text"
  }
};

const config = {
  schema: 'public',
  timestamps: true  // Auto-add created_at and updated_at
};

const sql2 = generateSQL(schema2, config);
console.log(sql2);
console.log('\n');

// Example 3: Schema Diffing
console.log('=== Example 3: Schema Diffing ===\n');

const oldSchema = {
  posts: {
    id: "uuid:pk",
    title: "text:notnull"
  }
};

const newSchema = {
  posts: {
    id: "uuid:pk",
    title: "text:notnull",
    content: "text",
    published: "boolean:default=false"
  }
};

const diff = diffSchemas(oldSchema, newSchema);
console.log(diff);
console.log('\n');

// Example 4: Complex Schema with Foreign Keys
console.log('=== Example 4: Complex Schema ===\n');

const complexSchema = {
  organizations: {
    id: "uuid:pk",
    name: "text:notnull",
    settings: "jsonb:default='{}'",
    created_at: "timestamptz:default=now()"
  },
  users: {
    id: "uuid:pk",
    email: "text:unique:notnull",
    org_id: "uuid:fk=organizations.id",
    role: "text:default='member'"
  },
  posts: {
    id: "uuid:pk",
    author_id: "uuid:fk=users.id",
    title: "text:notnull",
    content: "text",
    tags: "text[]"
  }
};

const sql4 = generateSQL(complexSchema);
console.log(sql4);
console.log('\n');

// Example 5: Nested Objects (converted to jsonb)
console.log('=== Example 5: Nested Objects ===\n');

const schemaWithNested = {
  profiles: {
    id: "uuid:pk",
    user_id: "uuid:fk=users.id",
    metadata: {
      bio: "text",
      avatar_url: "text",
      social_links: {}
    }
  }
};

const sql5 = generateSQL(schemaWithNested);
console.log(sql5);
console.log('\n');

// Example 6: RLS Policies
console.log('=== Example 6: RLS Policies ===\n');

const policies = generatePolicies('users');
console.log(policies);
