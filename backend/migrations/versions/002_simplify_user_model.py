"""Simplify user model

Revision ID: 002
Revises: 001_update_user_schema
Create Date: 2025-10-11

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic
revision = '002_simplify_user_model'
down_revision = '001_update_user_schema'
branch_labels = None
depends_on = None

def upgrade():
    # Use PRAGMA to inspect existing columns and only operate on present ones
    conn = op.get_bind()
    existing_cols = set()
    if conn is not None:
        res = conn.execute(sa.text("PRAGMA table_info('users')"))
        existing_cols = {r[1] for r in res.fetchall()}

    with op.batch_alter_table('users') as batch_op:
        # Drop unused columns if present
        for col in ('email_verified', 'email_verified_at', 'requests_count', 'daily_requests'):
            if col in existing_cols:
                batch_op.drop_column(col)

        # Ensure defaults and non-null constraints are applied safely if columns exist
        if 'is_active' in existing_cols:
            batch_op.alter_column('is_active',
                existing_type=sa.BOOLEAN(),
                server_default=sa.text('true'),
                nullable=False)

        if 'credits' in existing_cols:
            batch_op.alter_column('credits',
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