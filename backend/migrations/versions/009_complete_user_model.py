"""Complete user model fields

Revision ID: 009
Revises: 008_add_blacklisted_tokens
Create Date: 2025-10-16

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic
revision = '009'
down_revision = '008_add_blacklisted_tokens'
branch_labels = None
depends_on = None


def upgrade():
    # Add personal info fields
    op.add_column('users', sa.Column('first_name', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('last_name', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))

    # Add balance fields
    op.add_column('users', sa.Column('shobeis_balance', sa.Integer(), nullable=False, server_default='50'))
    op.add_column('users', sa.Column('bonus_balance', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('monthly_refresh_amount', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('last_refresh_date', sa.DateTime(), nullable=True))

    # Add usage tracking fields
    op.add_column('users', sa.Column('requests_count', sa.Integer(), nullable=False, server_default='0'))

    # Add timestamp fields
    op.add_column('users', sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()))
    op.add_column('users', sa.Column('updated_at', sa.DateTime(), nullable=True, onupdate=sa.func.now()))
    op.add_column('users', sa.Column('last_login', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('last_activity', sa.DateTime(), nullable=True))
    
    # Add constraints
    op.create_check_constraint('shobeis_balance_check', 'users', 'shobeis_balance >= 0')
    op.create_check_constraint('bonus_balance_check', 'users', 'bonus_balance >= 0')


def downgrade():
    # Remove constraints
    op.drop_constraint('bonus_balance_check', 'users')
    op.drop_constraint('shobeis_balance_check', 'users')

    # Remove timestamp fields
    op.drop_column('users', 'last_activity')
    op.drop_column('users', 'last_login')
    op.drop_column('users', 'updated_at')
    op.drop_column('users', 'created_at')

    # Remove usage tracking fields
    op.drop_column('users', 'requests_count')

    # Remove balance fields
    op.drop_column('users', 'last_refresh_date')
    op.drop_column('users', 'monthly_refresh_amount')
    op.drop_column('users', 'bonus_balance')
    op.drop_column('users', 'shobeis_balance')

    # Remove personal info fields
    op.drop_column('users', 'is_active')
    op.drop_column('users', 'last_name')
    op.drop_column('users', 'first_name')