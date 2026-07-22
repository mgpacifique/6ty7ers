"""Add departments table

Revision ID: af6d2f8ab853
Revises: f01ba7243a99
Create Date: 2026-07-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'af6d2f8ab853'
down_revision: Union[str, Sequence[str], None] = 'f01ba7243a99'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('departments',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    # Batch mode: SQLite can't ALTER TABLE to add a foreign key directly,
    # and the app falls back to SQLite when Postgres is unreachable.
    with op.batch_alter_table('queue_sessions') as batch_op:
        batch_op.add_column(sa.Column('department_id', postgresql.UUID(as_uuid=True), nullable=True))
        batch_op.create_foreign_key(
            'fk_queue_sessions_department_id',
            'departments', ['department_id'], ['id']
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('queue_sessions') as batch_op:
        batch_op.drop_constraint('fk_queue_sessions_department_id', type_='foreignkey')
        batch_op.drop_column('department_id')
    op.drop_table('departments')
