"""Initial events DB structure

Revision ID: 90a22862149e
Revises:
Create Date: 2020-12-29 10:30:34.717552

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "90a22862149e"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic & adjusted ###
    op.create_table(
        "events",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("type", sa.Enum("WILDFIRE", "FLOOD", name="eventtype"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("locationName", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("lat", sa.Float(), nullable=False),
        sa.Column("lng", sa.Float(), nullable=False),
        sa.Column("confirmed", sa.Boolean(), nullable=True),
        sa.Column("zoom", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_events_id"), "events", ["id"], unique=False)
    op.create_table(
        "articles",
        sa.Column("url", sa.String(), nullable=False),
        sa.Column("owner_id", sa.String(), nullable=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("image", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(
            ["owner_id"],
            ["events.id"],
        ),
        sa.PrimaryKeyConstraint("url"),
    )
    op.create_index(op.f("ix_articles_url"), "articles", ["url"], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic & adjusted ###
    op.drop_index(op.f("ix_articles_url"), table_name="articles")
    op.drop_table("articles")
    op.drop_index(op.f("ix_events_id"), table_name="events")
    op.drop_table("events")
    # ### end Alembic commands ###