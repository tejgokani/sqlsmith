# SQLSmith

**JavaScript Schema to Postgres (Supabase) Migration Generator**

SQLSmith converts JavaScript object schemas into clean, safe, Supabase-ready Postgres SQL migration files with schema diffing, CLI tools, and type overrides.

## 🚀 Features

- ✨ **JS → SQL Schema Generation** - Write schemas in JavaScript, get clean SQL
- 🔄 **Schema Diffing** - Generate ALTER statements from schema changes
- 📦 **Supabase-Ready** - Timestamped migrations in the Supabase format
- 🎯 **Shorthand Notation** - Concise column definitions (`"uuid:pk"`, `"text:unique:notnull"`)
- 🔐 **RLS Policy Templates** - Optional Supabase Row Level Security policy generation
- ⚙️ **Highly Configurable** - Type overrides, naming strategies, timestamps, and more
- 🧪 **Well-Tested** - Comprehensive test suite included
- 🛠️ **CLI + Programmatic API** - Use from command line or Node.js code

## 📦 Installation

```bash
npm install -D sqlsmith
# or
yarn add -D sqlsmith
```

## 🏁 Quick Start

### 1. Initialize SQLSmith

```bash
npx sqlsmith init
```

This creates:
- `sqlsmith.config.js` - Configuration file
- `schema.example.js` - Example schema file

### 2. Define Your Schema

Edit `schema.example.js`:

```javascript
export default {
  users: {
    id: "uuid:pk",
    name: "text:notnull",
    email: "text:unique:notnull",
    age: "integer:default=18",
    profile: {
      bio: "text",
      avatar_url: "text"
    },
    created_at: "timestamptz:default=now()"
  },
  profiles: {
    id: "uuid:pk",
    user_id: "uuid:fk=users.id",
    visibility: "text:default='public'"
  }
};
```

### 3. Generate SQL

```bash
# Generate SQL file
npx sqlsmith generate --schema=schema.example.js --out=schema.sql

# Or create a timestamped migration
npx sqlsmith migrate --schema=schema.example.js --message="init"
```

### 4. Output

Generated SQL:

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  age integer DEFAULT 18,
  profile jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES public.users(id),
  visibility text DEFAULT 'public'
);
```

## 📚 CLI Commands

### `init`
Create configuration and example schema files

```bash
npx sqlsmith init
```

### `generate`
Generate SQL from schema

```bash
npx sqlsmith generate --schema=schema.js --out=schema.sql
```

### `migrate`
Create timestamped migration file

```bash
npx sqlsmith migrate --schema=schema.js --message="create users table"
```

### `diff`
Generate ALTER statements from schema differences

```bash
npx sqlsmith diff --from=old-schema.js --to=new-schema.js --out=diff.sql
```

### `policies`
Generate Supabase RLS policy templates

```bash
npx sqlsmith policies --table=users --out=policies.sql
```

## 💻 Programmatic API

```javascript
import { generateSQL, diffSchemas, migrate } from "sqlsmith";

// Generate SQL from schema
const sql = generateSQL(schemaObject);

// Generate ALTER statements
const diff = diffSchemas(oldSchema, newSchema);

// Create migration file
const filePath = migrate(schemaObject, "./supabase/migrations", "init");
```

## 📝 Schema Notation

### Shorthand Format

Column definitions use the format: `"<type>[:modifier1][:modifier2]..."`

```javascript
{
  id: "uuid:pk",                           // Primary key
  email: "text:unique:notnull",            // Unique and NOT NULL
  age: "integer:default=18",               // Default value
  created_at: "timestamptz:default=now()", // Function default
  user_id: "uuid:fk=users.id",            // Foreign key
  settings: "jsonb:default='{}'"          // JSON default
}
```

### Supported Modifiers

- `pk` - Primary key (implies NOT NULL)
- `notnull` - NOT NULL constraint
- `unique` - UNIQUE constraint
- `default=<value>` - Default value
- `fk=<table>.<column>` - Foreign key reference

### Type Mapping

JavaScript types to PostgreSQL:

```javascript
string   → text
number   → integer
boolean  → boolean
uuid     → uuid
object   → jsonb
array    → jsonb
```

Explicit PostgreSQL types supported:
- `text`, `varchar`, `integer`, `bigint`, `smallint`
- `numeric`, `decimal`, `real`, `double precision`
- `uuid`, `boolean`, `date`, `timestamp`, `timestamptz`
- `json`, `jsonb`, `text[]`, `integer[]`, etc.

### Nested Objects

Nested objects are automatically converted to `jsonb`:

```javascript
{
  users: {
    profile: {
      bio: "text",
      avatar_url: "text"
    }
  }
}
```

Becomes:

```sql
profile jsonb
```

## ⚙️ Configuration

`sqlsmith.config.js`:

```javascript
export default {
  schema: 'public',              // PostgreSQL schema
  namingStrategy: 'snake_case',  // snake_case or camelCase
  timestamps: true,              // Add created_at/updated_at
  jsonForObjects: true,          // Convert nested objects to jsonb
  foreignKeyStrategy: 'inline',  // inline or separateTable
  policyGeneration: false,       // Generate RLS policies
  supabaseDir: './supabase/migrations',
  typeOverrides: {
    // Custom type mappings
    id: 'uuid',
    email: 'varchar(255)'
  }
};
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `schema` | string | `'public'` | PostgreSQL schema name |
| `namingStrategy` | string | `'snake_case'` | Naming convention |
| `timestamps` | boolean/object | `false` | Auto-add timestamps |
| `jsonForObjects` | boolean | `true` | Convert objects to jsonb |
| `foreignKeyStrategy` | string | `'inline'` | FK strategy |
| `policyGeneration` | boolean | `false` | Generate RLS policies |
| `supabaseDir` | string | `'./supabase/migrations'` | Migration directory |
| `typeOverrides` | object | `{}` | Custom type mappings |

## 🔄 Schema Diffing

SQLSmith can generate ALTER statements by comparing two schemas:

```javascript
// old-schema.js
export default {
  users: {
    id: "uuid:pk",
    name: "text"
  }
};

// new-schema.js
export default {
  users: {
    id: "uuid:pk",
    name: "text",
    email: "text:unique:notnull"  // Added column
  }
};
```

```bash
npx sqlsmith diff --from=old-schema.js --to=new-schema.js
```

Output:

```sql
ALTER TABLE public.users ADD COLUMN email text UNIQUE NOT NULL;
```

### Destructive Changes

SQLSmith warns about destructive changes:

```sql
-- WARNING: DROP_COLUMN on users.name is DESTRUCTIVE!
-- ALTER TABLE public.users DROP COLUMN name;
```

## 🔐 Supabase Integration

### Migrations

SQLSmith generates timestamped migration files compatible with Supabase:

```
supabase/migrations/
  20251121143022_create_users.sql
  20251121143045_add_profiles.sql
```

### RLS Policies

Generate Row Level Security policy templates:

```bash
npx sqlsmith policies --table=users
```

Output:

```sql
-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all records
CREATE POLICY "authenticated_select_policy" ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can update their own records
CREATE POLICY "user_update_own_policy" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Tests include:
- Parser validation
- SQL generation
- Schema diffing
- Type mapping
- Configuration handling

## 📁 Project Structure

```
sqlsmith/
├── bin/
│   └── sqlsmith.js           # CLI entry point
├── src/
│   ├── index.js              # Main API
│   ├── cli.js                # CLI commands
│   ├── parser/
│   │   ├── parseSchema.js    # Schema parser
│   │   └── validateSchema.js # Schema validator
│   ├── generator/
│   │   ├── sqlCreate.js      # CREATE TABLE generator
│   │   ├── sqlAlter.js       # ALTER TABLE generator
│   │   └── typeMapper.js     # Type mapping
│   ├── integrator/
│   │   ├── supabaseWriter.js # Migration file writer
│   │   └── policyGenerator.js# RLS policy generator
│   └── utils/
│       ├── fileWriter.js     # File utilities
│       ├── logger.js         # Logger
│       └── timestamp.js      # Timestamp generator
├── templates/
│   ├── migration.sql.tpl     # Migration template
│   └── policy.template.sql   # Policy template
├── examples/
│   └── schema.example.js     # Example schema
├── tests/
│   ├── parser.test.js        # Parser tests
│   └── generator.test.js     # Generator tests
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © Your Name

## 🔗 Links

- [GitHub Repository](https://github.com/YOUR_USERNAME/sqlsmith)
- [NPM Package](https://www.npmjs.com/package/sqlsmith)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## ✨ Examples

### Basic Schema

```javascript
export default {
  posts: {
    id: "uuid:pk",
    title: "text:notnull",
    content: "text",
    author_id: "uuid:fk=users.id",
    published: "boolean:default=false",
    created_at: "timestamptz:default=now()"
  }
};
```

### With Timestamps Config

```javascript
// sqlsmith.config.js
export default {
  timestamps: {
    created_at: true,
    updated_at: true
  }
};

// schema.js
export default {
  articles: {
    id: "uuid:pk",
    title: "text:notnull"
    // created_at and updated_at added automatically
  }
};
```

### Complex Schema

```javascript
export default {
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
    role: "text:default='member'",
    metadata: {
      bio: "text",
      avatar: "text",
      preferences: {}
    }
  },
  posts: {
    id: "uuid:pk",
    author_id: "uuid:fk=users.id",
    org_id: "uuid:fk=organizations.id",
    title: "text:notnull",
    content: "text",
    tags: "text[]",
    published_at: "timestamptz"
  }
};
```

---

**Built with ❤️ for the Supabase and PostgreSQL community**


<!-- Updated via Git Committer -->


<!-- Updated via Git Committer -->


<!-- Updated via Git Committer -->

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
## Installation

```bash
npm install
```

<!-- Updated via Git Committer -->


<!-- Updated via Git Committer -->


<!-- Updated via Git Committer -->


<!-- Updated via Git Committer -->
