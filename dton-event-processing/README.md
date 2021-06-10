## Running locally

This project uses Python 3.8.

Copy `.env` file from [wiki](https://git.sinergise.com/team-6/dton-wildfires-cleaner/-/wikis/.env) to the root repository.

```
pipenv install
pipenv run python main.py
```

### Running notebooks

```
pipenv install --dev
cd notebooks
pipenv run jupyter notebook
```

#### Troubleshooting

In case of problems with a missing package `pexpect`, try

```
pipenv install --dev notebook
```

And run the notebook again.

### Tests

```
pipenv run pytest
```

### Linting

```
pipenv run black -l 120 .
```

### Configuring the pipeline with environment variables

- `MEDIA_INTELLIGENCE_DATE_START` and `MEDIA_INTELLIGENCE_DATE_END`: Dates in ISO format. They are used as `dateStart` and `dateEnd` Media Intelligence query attributes.
- `EVENT_TYPE_TO_RUN`: String, one of the valid event types (defined in `constants.py`). Runs the pipeline for that event type only. Otherwise all types are run.
- `DEV_MODE`: If `true`, requests to events service won't be made, instead the payload will be printed to the console.
- `RUN_ONLY_NEW_EVENTS`: If `true`, existing non-confirmed events won't be processed.