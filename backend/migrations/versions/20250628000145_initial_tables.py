"""initial tables

Revision ID: 0001_initial
Revises: 
Create Date: $(date +%Y-%m-%d)

"""
from alembic import op
import sqlalchemy as sa

revision = '0001_initial'
down_revision = None

def upgrade():
    op.create_table('users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('username', sa.String(80), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(128), nullable=False)
    )
    op.create_table('owners',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(80), unique=True, nullable=False),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'))
    )
    op.create_table('dogs',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(80), nullable=False),
        sa.Column('breed', sa.String(80)),
        sa.Column('age', sa.Integer),
        sa.Column('owner_id', sa.Integer, sa.ForeignKey('owners.id'))
    )
    op.create_table('activities',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(80), nullable=False),
        sa.Column('description', sa.Text))
    op.create_table('dog_activity',
        sa.Column('dog_id', sa.Integer, sa.ForeignKey('dogs.id'), primary_key=True),
        sa.Column('activity_id', sa.Integer, sa.ForeignKey('activities.id'), primary_key=True),
        sa.Column('duration', sa.Integer)
    )

def downgrade():
    op.drop_table('dog_activity')
    op.drop_table('activities')
    op.drop_table('dogs')
    op.drop_table('owners')
    op.drop_table('users')
