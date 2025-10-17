"""Unify user system and subscription management

Revision ID: 006
Revises: 005_add_analytics_tables
Create Date: 2025-10-16

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = '006'
down_revision = '005_add_analytics_tables'
branch_labels = None
depends_on = None

def upgrade():
    # Add new subscription and tracking columns to users table
    op.add_column('users', sa.Column('user_type', sa.String(20), nullable=False, server_default='FREE'))
    op.add_column('users', sa.Column('subscription_start_date', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('subscription_end_date', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('billing_cycle_start', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('billing_cycle_end', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('subscription_status', sa.String(50), nullable=False, server_default='inactive'))
    op.add_column('users', sa.Column('total_words_analyzed', sa.BigInteger(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('total_api_calls', sa.BigInteger(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('total_exports', sa.BigInteger(), nullable=False, server_default='0'))
    
    # Create unified shobeis_transactions table
    op.create_table(
        'shobeis_transactions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('transaction_type', sa.String(50), nullable=False),
        sa.Column('description', sa.String(255), nullable=True),
        sa.Column('balance_before', sa.Integer(), nullable=False),
        sa.Column('balance_after', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(50), nullable=False, server_default='completed'),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('idempotency_key', sa.String(255), nullable=True, unique=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=True, onupdate=sa.func.now())
    )
    
    # Create user_analytics table
    op.create_table(
        'user_analytics',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('words_analyzed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('api_calls', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('exports', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('shobeis_spent', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('shobeis_earned', sa.Integer(), nullable=False, server_default='0'),
        sa.UniqueConstraint('user_id', 'date', name='uix_user_daily_analytics')
    )
    
    # Create indices for performance
    op.create_index('ix_shobeis_transactions_user_id', 'shobeis_transactions', ['user_id'])
    op.create_index('ix_shobeis_transactions_created_at', 'shobeis_transactions', ['created_at'])
    op.create_index('ix_user_analytics_user_id_date', 'user_analytics', ['user_id', 'date'])
    

def downgrade():
    # Remove indices
    op.drop_index('ix_user_analytics_user_id_date')
    op.drop_index('ix_shobeis_transactions_created_at')
    op.drop_index('ix_shobeis_transactions_user_id')
    
    # Drop tables
    op.drop_table('user_analytics')
    op.drop_table('shobeis_transactions')
    
    # Remove columns from users table
    op.drop_column('users', 'total_exports')
    op.drop_column('users', 'total_api_calls')
    op.drop_column('users', 'total_words_analyzed')
    op.drop_column('users', 'subscription_status')
    op.drop_column('users', 'billing_cycle_end')
    op.drop_column('users', 'billing_cycle_start')
    op.drop_column('users', 'subscription_end_date')
    op.drop_column('users', 'subscription_start_date')
    op.drop_column('users', 'user_type')
    
    # Drop user_type enum
    op.execute('DROP TYPE user_type')