"""Override visualization dates

Revision ID: 88a33c410fe0
Revises: d0eeaf5cf039
Create Date: 2021-01-12 09:32:09.644212

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "88a33c410fe0"
down_revision = "d0eeaf5cf039"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "override_visualization_dates",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("owner_id", sa.String(), nullable=True),
        sa.Column("datasetId", sa.String(), nullable=False),
        sa.Column("before", sa.Date(), nullable=False),
        sa.Column("after", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(["owner_id"], ["events.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("owner_id", "datasetId"),
    )
    op.create_index(op.f("ix_override_visualization_dates_id"), "override_visualization_dates", ["id"], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_override_visualization_dates_id"), table_name="override_visualization_dates")
    op.drop_table("override_visualization_dates")
    # ### end Alembic commands ###
