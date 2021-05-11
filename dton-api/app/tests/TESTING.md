### Running tests

In `app/` directory, run:
```
$ pipenv install --dev
$ pipenv shell
(app) $ cd tests/
(app) $ docker-compose up -d
(app) $ pytest
```