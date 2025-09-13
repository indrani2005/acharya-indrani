# Django Migration Best Practices & Troubleshooting Guide

## 🔄 Django Migration Management

This guide provides best practices for handling Django migrations and troubleshooting common migration issues in the Acharya School Management System.

## 📋 Migration Best Practices

### 1. **Always Create Migrations in Order**
```bash
# Create migrations for each app systematically
uv run manage.py makemigrations users     # Custom user model first
uv run manage.py makemigrations admissions
uv run manage.py makemigrations fees
uv run manage.py makemigrations attendance
# ... continue for all apps
```

### 2. **Custom User Model First**
Our system uses a custom user model (`users.User`), which must be migrated before any other apps that reference it.

**Migration Order Priority:**
1. `contenttypes` (Django built-in)
2. `auth` (Django built-in)
3. `users` (Our custom user model)
4. All other apps (admissions, fees, attendance, etc.)
5. `admin` (Django built-in - depends on user model)

### 3. **Check Dependencies Before Migration**
```bash
# Always review migration files before applying
uv run manage.py showmigrations
uv run manage.py sqlmigrate app_name migration_number
```

### 4. **Test Migrations on Fresh Database**
```bash
# Test migration on a clean database
cp db.sqlite3 db_backup.sqlite3  # Backup first
rm db.sqlite3
uv run manage.py migrate
```

## 🚨 Common Migration Issues & Solutions

### Issue 1: InconsistentMigrationHistory

**Error Message:**
```
django.db.migrations.exceptions.InconsistentMigrationHistory: 
Migration admin.0001_initial is applied before its dependency users.0001_initial
```

**Root Cause:** 
The admin app migration was applied before the custom user model migration, creating a dependency conflict.

**Solution:**
```bash
# 1. Backup current database
cp db.sqlite3 db_backup.sqlite3

# 2. Reset migration state
rm db.sqlite3

# 3. Remove all migration files (keep __init__.py)
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete

# 4. Create fresh migrations
uv run manage.py makemigrations

# 5. Apply migrations
uv run manage.py migrate

# 6. Create superuser
uv run manage.py createsuperuser
```

### Issue 2: Circular Dependencies

**Error Message:**
```
django.db.migrations.exceptions.CircularDependencyError
```

**Solution:**
```bash
# Identify the circular dependency
uv run manage.py showmigrations --verbosity=2

# Split the problematic migration into multiple migrations
uv run manage.py makemigrations app_name --empty
# Edit the empty migration to resolve the circular dependency
```

### Issue 3: Foreign Key Constraint Failures

**Error Message:**
```
django.db.utils.IntegrityError: FOREIGN KEY constraint failed
```

**Solution:**
```bash
# Check for orphaned data
uv run manage.py shell
>>> from app.models import Model
>>> Model.objects.filter(foreign_key__isnull=True)

# Clean up orphaned data before migration
# Or use data migrations to handle the cleanup
```

## 🛠️ Migration Recovery Procedures

### Production Migration Recovery

**NEVER run these commands in production without proper backups!**

1. **Create Full Backup**
```bash
# PostgreSQL
pg_dump -h localhost -U username dbname > backup.sql

# SQLite
cp db.sqlite3 backup_$(date +%Y%m%d_%H%M%S).sqlite3
```

2. **Safe Migration Rollback**
```bash
# Check current migration state
uv run manage.py showmigrations

# Rollback to specific migration
uv run manage.py migrate app_name 0001

# Rollback all migrations for an app
uv run manage.py migrate app_name zero
```

3. **Reset Specific App Migrations**
```bash
# Reset migrations for one app
rm app_name/migrations/00*.py
uv run manage.py makemigrations app_name
uv run manage.py migrate app_name
```

### Development Environment Reset

```bash
# Complete reset (development only!)
rm db.sqlite3
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
uv run manage.py makemigrations
uv run manage.py migrate
uv run manage.py createsuperuser
```

## 📝 Migration File Management

### Migration File Naming Convention
```
0001_initial.py          # First migration for the app
0002_add_student_fields.py   # Descriptive name for changes
0003_remove_old_table.py     # Clear description of what's being removed
```

### Migration File Best Practices

1. **Use Descriptive Names**
```bash
# Good
uv run manage.py makemigrations --name add_email_verification

# Bad
uv run manage.py makemigrations  # Uses auto-generated name
```

2. **One Logical Change Per Migration**
```python
# Good - Single logical change
class Migration(migrations.Migration):
    operations = [
        migrations.AddField(
            model_name='student',
            name='email_verified',
            field=models.BooleanField(default=False),
        ),
    ]

# Bad - Multiple unrelated changes
class Migration(migrations.Migration):
    operations = [
        migrations.AddField(...),  # Add email field
        migrations.DeleteModel(...),  # Delete unrelated model
        migrations.AlterField(...),   # Change unrelated field
    ]
```

3. **Review Before Committing**
```bash
# Always review migration before committing
cat app/migrations/0001_initial.py
uv run manage.py sqlmigrate app 0001
```

## 🔧 Custom Migration Scripts

### Data Migration Example
```python
# migration file: 0003_populate_user_roles.py
from django.db import migrations

def populate_user_roles(apps, schema_editor):
    User = apps.get_model('users', 'User')
    for user in User.objects.all():
        if not user.role:
            user.role = 'student'  # Default role
            user.save()

def reverse_populate_user_roles(apps, schema_editor):
    # Reverse operation if needed
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0002_add_role_field'),
    ]

    operations = [
        migrations.RunPython(
            populate_user_roles,
            reverse_populate_user_roles
        ),
    ]
```

### Schema Migration with Data Preservation
```python
# migration file: 0004_rename_field_preserve_data.py
from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('students', '0003_previous_migration'),
    ]

    operations = [
        # Step 1: Add new field
        migrations.AddField(
            model_name='student',
            name='new_field_name',
            field=models.CharField(max_length=100, null=True),
        ),
        # Step 2: Copy data (requires RunPython operation)
        # Step 3: Remove old field (in next migration)
    ]
```

## 🚀 Deployment Migration Strategy

### Pre-deployment Checklist
- [ ] All migrations tested on staging environment
- [ ] Database backup created
- [ ] Migration rollback plan prepared
- [ ] No destructive operations without data preservation
- [ ] All team members aware of migration deployment

### Zero-downtime Migration Pattern
```bash
# 1. Deploy code with new field (nullable)
uv run manage.py migrate

# 2. Populate new field with data migration
uv run manage.py migrate

# 3. Deploy code that uses new field
# 4. Remove old field in subsequent deployment
```

## 📊 Migration Monitoring

### Migration Performance Monitoring
```python
# settings.py - Add migration logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'migration_file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'migrations.log',
        },
    },
    'loggers': {
        'django.db.migrations': {
            'handlers': ['migration_file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### Migration Health Checks
```bash
# Check for unapplied migrations
uv run manage.py showmigrations --plan

# Check for migration conflicts
uv run manage.py makemigrations --dry-run --verbosity=2

# Validate migration integrity
uv run manage.py check
```

## 🔍 Debugging Migration Issues

### Common Debugging Commands
```bash
# Show current migration state
uv run manage.py showmigrations

# Show migration plan
uv run manage.py showmigrations --plan

# Show SQL for specific migration
uv run manage.py sqlmigrate app_name migration_number

# Fake apply/unapply migration (dangerous!)
uv run manage.py migrate app_name migration_number --fake

# Check for issues without applying
uv run manage.py makemigrations --dry-run
```

### Migration Log Analysis
```bash
# Check Django logs for migration errors
tail -f logs/django.log | grep migration

# Check database logs (PostgreSQL example)
tail -f /var/log/postgresql/postgresql.log
```

## 🛡️ Migration Security Considerations

### Sensitive Data Handling
```python
# Never include sensitive data in migrations
class Migration(migrations.Migration):
    operations = [
        # Bad - includes sensitive data
        migrations.RunPython(
            lambda apps, schema_editor: User.objects.create_user(
                username='admin',
                password='admin123'  # Never do this!
            )
        ),
        
        # Good - use environment variables or external data
        migrations.RunPython(
            create_admin_user_from_env,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
```

### Migration Permissions
```bash
# Ensure migration files have proper permissions
chmod 644 */migrations/*.py
```

## 📚 Additional Resources

### Django Documentation
- [Django Migrations Documentation](https://docs.djangoproject.com/en/stable/topics/migrations/)
- [Migration Operations Reference](https://docs.djangoproject.com/en/stable/ref/migration-operations/)

### Project-Specific Scripts
```bash
# Custom management commands for this project
uv run manage.py reset_migrations  # Custom command (if implemented)
uv run manage.py check_migration_integrity  # Custom command (if implemented)
```

---

## 🎯 Quick Reference Commands

```bash
# Essential migration commands for daily use
uv run manage.py makemigrations                    # Create migrations
uv run manage.py migrate                          # Apply migrations
uv run manage.py showmigrations                   # Show migration status
uv run manage.py migrate app_name 0001            # Migrate to specific version
uv run manage.py migrate app_name zero            # Undo all migrations for app
uv run manage.py sqlmigrate app_name 0001         # Show SQL for migration
uv run manage.py makemigrations --dry-run         # Preview migrations
uv run manage.py check                            # Check for issues
```

**Remember:** Always backup your database before running migrations in production!

---

**Last Updated:** September 13, 2025  
**Project:** Acharya School Management System  
**Migration System:** Django 5.x