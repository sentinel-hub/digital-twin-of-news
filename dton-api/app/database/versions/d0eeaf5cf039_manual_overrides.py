"""Manual overrides

Revision ID: d0eeaf5cf039
Revises: c96a3e4d47aa
Create Date: 2021-01-11 16:06:33.256750

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "d0eeaf5cf039"
down_revision = "c96a3e4d47aa"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("events", sa.Column("overrideConfirmed", sa.Boolean(), nullable=True))
    op.add_column("events", sa.Column("overrideLat", sa.Float(), nullable=True))
    op.add_column("events", sa.Column("overrideLng", sa.Float(), nullable=True))
    op.add_column("events", sa.Column("overrideZoom", sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("events", "overrideZoom")
    op.drop_column("events", "overrideLng")
    op.drop_column("events", "overrideLat")
    op.drop_column("events", "overrideConfirmed")
    # ### end Alembic commands ###