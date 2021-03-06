"""Soft removal of admins

Revision ID: 9250aab85ae4
Revises: 78333cc1f63d
Create Date: 2021-01-18 15:50:03.030451

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "9250aab85ae4"
down_revision = "78333cc1f63d"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("admins", sa.Column("enabled", sa.Boolean(), nullable=False))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("admins", "enabled")
    # ### end Alembic commands ###
