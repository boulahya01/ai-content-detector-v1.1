"""Update user table schema

Revision ID: 001_update_user_schema
Revises: 
Create Date: 2025-10-11 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = '001_update_user_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create users table first
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('first_name', sa.String(length=100), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # Add additional columns
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('last_name', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('role', sa.String(50), server_default='FREE', nullable=False))
        batch_op.add_column(sa.Column('email_verified', sa.Boolean(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('credits', sa.Integer(), server_default='5', nullable=False))
        batch_op.add_column(sa.Column('requests_count', sa.Integer(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('daily_requests', sa.Integer(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('updated_at', sa.DateTime()))
        batch_op.add_column(sa.Column('last_login', sa.DateTime()))
        batch_op.add_column(sa.Column('email_verified_at', sa.DateTime()))

        # Ensure is_active has correct default
        batch_op.alter_column('is_active',
                            existing_type=sa.Boolean(),
                            server_default='1',
                            nullable=False)

def downgrade():
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_column('email_verified_at')
        batch_op.drop_column('last_login')
        batch_op.drop_column('updated_at')
        batch_op.drop_column('daily_requests')
        batch_op.drop_column('requests_count')
        batch_op.drop_column('credits')
        batch_op.drop_column('email_verified')
        batch_op.drop_column('role')
        batch_op.drop_column('last_name')
        
    # Drop the users table
    op.drop_table('users')