"""Add analytics tables

Revision ID: 005_add_analytics_tables
Revises: 004_add_analysis_results
Create Date: 2025-10-14

"""
from alembic import op
import sqlalchemy as sa
import uuid

# revision identifiers, used by Alembic.
revision = '005_add_analytics_tables'
down_revision = '004_add_analysis_results'
branch_labels = None
depends_on = None

def upgrade():
    # Extend users table with analytics columns, but only if they don't already exist
    conn = op.get_bind()
    existing_cols = set()
    if conn is not None:
        res = conn.execute(sa.text("PRAGMA table_info('users')"))
        existing_cols = {r[1] for r in res.fetchall()}

    if 'subscription_tier' not in existing_cols:
        op.add_column('users', sa.Column('subscription_tier', sa.String(50), server_default='free'))
    if 'credits_total' not in existing_cols:
        op.add_column('users', sa.Column('credits_total', sa.Integer(), server_default='0'))
    if 'credits_used' not in existing_cols:
        op.add_column('users', sa.Column('credits_used', sa.Integer(), server_default='0'))
    if 'last_activity' not in existing_cols:
        op.add_column('users', sa.Column('last_activity', sa.DateTime()))
    if 'analysis_count' not in existing_cols:
        op.add_column('users', sa.Column('analysis_count', sa.Integer(), server_default='0'))

    # Add constraints to users table (skip explicit check-constraint creation on SQLite)
    dialect = op.get_bind().dialect.name
    if dialect != 'sqlite':
        # Only create constraints if they don't already exist
        try:
            op.create_check_constraint(
                'credits_check',
                'users',
                'credits_used <= credits_total'
            )
        except Exception:
            pass
        try:
            op.create_check_constraint(
                'valid_subscription_tier',
                'users',
                "subscription_tier IN ('free', 'basic', 'premium', 'enterprise')"
            )
        except Exception:
            pass

    # Create user_analysis_stats table
    # Create user_analysis_stats table if it doesn't exist
    tbls = set()
    if conn is not None:
        tbls = {r[0] for r in conn.execute(sa.text("SELECT name FROM sqlite_master WHERE type='table'"))}

    if 'user_analysis_stats' not in tbls:
        op.create_table(
            'user_analysis_stats',
            sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
            sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('total_analyses', sa.Integer(), server_default='0'),
        sa.Column('ai_detected_count', sa.Integer(), server_default='0'),
        sa.Column('human_detected_count', sa.Integer(), server_default='0'),
        sa.Column('avg_confidence', sa.Numeric(5, 2)),
        sa.Column('avg_processing_time', sa.Integer()),
        sa.Column('last_analysis_date', sa.DateTime()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        )

    # Create user_api_usage table
    if 'user_api_usage' not in tbls:
        op.create_table(
            'user_api_usage',
            sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
            sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('endpoint', sa.String(255)),
        sa.Column('request_count', sa.Integer(), server_default='0'),
        sa.Column('success_count', sa.Integer(), server_default='0'),
        sa.Column('error_count', sa.Integer(), server_default='0'),
        sa.Column('avg_response_time', sa.Integer()),
        sa.Column('last_request', sa.DateTime()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        )

    # Create indexes
    # Create indexes if corresponding tables were created
    try:
        if 'user_analysis_stats' not in tbls:
            op.create_index('idx_user_stats_user_id', 'user_analysis_stats', ['user_id'])
            op.create_index('idx_user_stats_last_analysis', 'user_analysis_stats', ['last_analysis_date'])
        if 'user_api_usage' not in tbls:
            op.create_index('idx_api_usage_user_id', 'user_api_usage', ['user_id'])
    except Exception:
        # Index creation can fail if index already exists; ignore
        pass

def downgrade():
    # Drop indexes
    op.drop_index('idx_user_stats_last_analysis')
    op.drop_index('idx_api_usage_user_id')
    op.drop_index('idx_user_stats_user_id')

    # Drop tables
    op.drop_table('user_api_usage')
    op.drop_table('user_analysis_stats')

    # Drop constraints from users table
    op.drop_constraint('valid_subscription_tier', 'users')
    op.drop_constraint('credits_check', 'users')

    # Drop columns from users table
    op.drop_column('users', 'analysis_count')
    op.drop_column('users', 'last_activity')
    op.drop_column('users', 'credits_used')
    op.drop_column('users', 'credits_total')
    op.drop_column('users', 'subscription_tier')