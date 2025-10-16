"""Remove email verification and ensure requests_count

Revision ID: 003_remove_email_verification
Revises: 002_simplify_user_model
Create Date: 2025-10-11 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003_remove_email_verification'
down_revision = '002_simplify_user_model'
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table('users') as batch_op:
        # Just ensure requests_count exists with default value
        # The email verification columns were already dropped in 002
        batch_op.add_column(sa.Column('requests_count', sa.Integer(), server_default='0', nullable=False))

def downgrade():
    with op.batch_alter_table('users') as batch_op:
        # Restore email verification columns
        batch_op.add_column(sa.Column('email_verified', sa.Boolean(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('email_verified_at', sa.DateTime()))
        
        # Remove requests_count
        batch_op.drop_column('requests_count')