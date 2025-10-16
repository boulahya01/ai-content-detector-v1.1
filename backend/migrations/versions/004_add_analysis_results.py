"""add_analysis_results_table

Revision ID: 004_add_analysis_results
Create Date: 2024-10-14 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004_add_analysis_results'
down_revision = '003_remove_email_verification'
branch_labels = None
depends_on = None


def upgrade():
    # Create analysis_results table
    op.create_table(
        'analysis_results',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('ai_probability', sa.Float(), nullable=False),
        sa.Column('length', sa.Integer(), nullable=False),
        sa.Column('language', sa.String(10), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create index on user_id for better query performance
    op.create_index('ix_analysis_results_user_id', 'analysis_results', ['user_id'])


def downgrade():
    # Drop index
    op.drop_index('ix_analysis_results_user_id')
    
    # Drop table
    op.drop_table('analysis_results')