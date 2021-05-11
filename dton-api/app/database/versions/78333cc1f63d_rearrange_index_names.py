"""Rearrange index names

Revision ID: 78333cc1f63d
Revises: 0b3651d51d95
Create Date: 2021-01-18 14:33:46.230637

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "78333cc1f63d"
down_revision = "0b3651d51d95"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint("ix_articles_id", "articles", type_="primary")
    op.create_primary_key("articles_pkey", "articles", ["id"])

    op.create_index(op.f("ix_articles_id"), "articles", ["id"], unique=False)
    op.drop_index("ix_articles_id2", table_name="articles")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_index("ix_articles_id2", "articles", ["id"], unique=False)
    op.drop_index(op.f("ix_articles_id"), table_name="articles")

    op.drop_constraint("articles_pkey", table_name="articles", type_="primary")
    op.create_primary_key("ix_articles_id", "articles", ["id"])
    # ### end Alembic commands ###
