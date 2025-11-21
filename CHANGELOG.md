# Changelog

All notable changes to SQLSmith will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-11-21

### Added
- Initial release of SQLSmith
- JavaScript schema to Postgres SQL conversion
- Shorthand column notation (`uuid:pk`, `text:unique:notnull`, etc.)
- Support for all major PostgreSQL types
- Foreign key support with `fk=table.column` syntax
- Nested object to jsonb conversion
- Schema diffing to generate ALTER statements
- CLI with commands: init, generate, migrate, diff, policies
- Programmatic API for Node.js integration
- Supabase migration file generation with timestamps
- RLS policy template generation
- Configurable options via `sqlsmith.config.js`
- Type override support
- Naming strategy options (snake_case, camelCase)
- Auto-timestamp generation (created_at, updated_at)
- Comprehensive test suite (15 tests)
- GitHub Actions CI workflow
- Full documentation and examples

### Features
- ✨ Clean, readable SQL output
- 🔄 Smart schema diffing with destructive change warnings
- 📦 Supabase-ready timestamped migrations
- 🎯 Concise shorthand notation
- 🔐 RLS policy templates
- ⚙️ Highly configurable
- 🧪 Well-tested
- 🛠️ CLI + programmatic API

## [Unreleased]

### Planned Features
- Composite primary keys support
- Custom constraint support
- Index generation
- Enum type support
- View generation
- Trigger support
- Migration rollback (DOWN migrations)
- Schema validation improvements
- Better error messages
- Interactive CLI mode
- Schema visualization
- PostgreSQL type validation
