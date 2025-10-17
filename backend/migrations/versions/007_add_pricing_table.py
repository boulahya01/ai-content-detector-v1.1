"""Add pricing table

Revision ID: 007
Revises: 006_unify_user_system
Create Date: 2024-04-16 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '007'
down_revision: Union[str, None] = '006'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create pricing_table
    op.create_table(
        'pricing_table',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('action_type', sa.String(), nullable=False),
        sa.Column('unit', sa.String(), nullable=False),
        sa.Column('base_shobeis', sa.Integer(), nullable=False),
        sa.Column('min_charge', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('action_type')
    )


def downgrade() -> None:
    op.drop_table('pricing_table')