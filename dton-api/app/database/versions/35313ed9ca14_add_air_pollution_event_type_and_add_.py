"""Add air_pollution event type and add product specific dates to visualizationDates

Revision ID: 35313ed9ca14
Revises: 2f32b58a94b3
Create Date: 2021-04-12 16:51:57.402425

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "35313ed9ca14"
down_revision = "2f32b58a94b3"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE eventtype ADD VALUE 'AIR_POLLUTION'")

    op.create_table(
        "override_product_specific_dates",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=True),
        sa.Column("product", sa.String(), nullable=False),
        sa.Column("before", sa.Date(), nullable=False),
        sa.Column("after", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(["owner_id"], ["override_visualization_dates.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_override_product_specific_dates_id"), "override_product_specific_dates", ["id"], unique=False
    )
    op.create_table(
        "product_specific_dates",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=True),
        sa.Column("product", sa.String(), nullable=False),
        sa.Column("before", sa.Date(), nullable=False),
        sa.Column("after", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(["owner_id"], ["visualization_dates.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_product_specific_dates_id"), "product_specific_dates", ["id"], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_product_specific_dates_id"), table_name="product_specific_dates")
    op.drop_table("product_specific_dates")
    op.drop_index(op.f("ix_override_product_specific_dates_id"), table_name="override_product_specific_dates")
    op.drop_table("override_product_specific_dates")
    # ### end Alembic commands ###
