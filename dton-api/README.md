# Digital Twin of the News - API

## Running API locally

```
$ docker-compose up -d
$ cd app/
$ pipenv install
$ pipenv shell
(app) $ python main.py
```

To upgrade the database, run in a separate terminal:
```
$ curl -X POST http://localhost:8000/migratedb
```

### Documentation

FastAPI automatically generates and serves API documentation. It is accessible at `/docs` and `/redoc` endpoints of the API. When running locally, the URLs are:
- http://localhost:8000/docs
- http://localhost:8000/redoc

## Running tests

If running, first stop database service:
```
$ docker-compose down
```

Then:
```
$ cd app/
$ pipenv install --dev
$ pipenv shell
(app) $ cd tests/
(app) $ docker-compose up -d
(app) $ pytest
```

## Creating alembic migration scripts

Alembic supports auto-generation of DB migration scripts:

- change `dbmodels.py` as appropriate
- `cd app/`
- `pipenv shell`
- `alembic revision --autogenerate -m "Added some awesome new field"`
- inspect the resulting migration script and edit as needed
- _(only affects local DB)_ upgrade the database with migration as described in **Running API locally**

You can revert the migration by running `alembic downgrade <migration id>`

When merging changes from a branch which adds a new migration file:
- _(only affects local DB)_ if you already ran the migration file to upgrade the DB, revert it with `alembic downgrade <id>`
  - if that doesn't help, remove docker container and run `docker-compose up -d` again
- fix the `down_revision` and `Revises: <id>` in your migration file to the same value as `revision` is in the migration file that you merged
- _(only affects local DB)_ upgrade the database with migration as described in **Running API locally** 