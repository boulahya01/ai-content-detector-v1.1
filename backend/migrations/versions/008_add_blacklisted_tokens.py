"""Add blacklisted_tokens table

Revision ID: 008_add_blacklisted_tokens
Revises: 007_add_pricing_table
Create Date: 2025-10-16 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '008_add_blacklisted_tokens'
down_revision = '007'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'blacklisted_tokens',
        sa.Column('token', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('token')
    )
    op.create_index('idx_blacklisted_tokens_user_id', 'blacklisted_tokens', ['user_id'])
    op.create_index('idx_blacklisted_tokens_expires_at', 'blacklisted_tokens', ['expires_at'])

def downgrade():
    op.drop_index('idx_blacklisted_tokens_expires_at')
    op.drop_index('idx_blacklisted_tokens_user_id')
    op.drop_table('blacklisted_tokens')