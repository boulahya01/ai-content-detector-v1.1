"""Simplify user model

Revision ID: 002
Revises: 001_update_user_schema
Create Date: 2025-10-11

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = '002'
down_revision = '001_update_user_schema'
branch_labels = None
depends_on = None

def upgrade():
    # Drop unused columns
    op.drop_column('users', 'email_verified')
    op.drop_column('users', 'email_verified_at')
    op.drop_column('users', 'requests_count')
    op.drop_column('users', 'daily_requests')
    
    # Set default values for existing columns
    op.alter_column('users', 'is_active',
        existing_type=sa.BOOLEAN(),
        server_default=sa.text('true'),
        nullable=False)
    
    op.alter_column('users', 'credits',
        existing_type=sa.INTEGER(),
        server_default=sa.text('5'),
        nullable=False)

    # Drop any existing sessions or password reset tables if they exist
    op.execute('DROP TABLE IF EXISTS sessions')
    op.execute('DROP TABLE IF EXISTS password_resets')

def downgrade():
    # Add back the columns with their original properties
    op.add_column('users', sa.Column('email_verified', sa.BOOLEAN(), nullable=False, server_default=sa.text('false')))
    op.add_column('users', sa.Column('email_verified_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('requests_count', sa.INTEGER(), nullable=False, server_default=sa.text('0')))
    op.add_column('users', sa.Column('daily_requests', sa.INTEGER(), nullable=False, server_default=sa.text('0')))
    
    # Remove server defaults
    op.alter_column('users', 'is_active',
        existing_type=sa.BOOLEAN(),
        server_default=None,
        nullable=False)
    
    op.alter_column('users', 'credits',
        existing_type=sa.INTEGER(),
        server_default=None,
        nullable=False)