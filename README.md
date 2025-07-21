# Spaceship game

This repository provides code for the spaceship game aversive learning task described in [Wise & Dolan (2020)](https://www.nature.com/articles/s41467-020-17977-w). The task aesthetics have been updated slightly compared to the original version, but it otherwise remains the same.

A demo of the task can be played [here](https://tw-spaceship-game.firebaseapp.com/).

> ⚠ Warning: This code is a refactored and tidied version of the code used in the original task. This rewriting process may have introduced bugs, and so it is recommended to check the performance of the task and the data it creates thoroughly. Any bugs can be reported in the [issues]() section of this repository.

## Using the task

The contents of this repository can be deployed using any web hosting service, and the task can be run in any modern web browser. The task is written in JavaScript, and does not require any server-side code. For my own usage, I have deployed it to [Google Firebase hosting](https://firebase.google.com/docs/hosting), but any hosting service should work.

### Task configuration

Task configuration variables are specified in the `src/config.js` file. These include variables to alter the speed of the asteroids, and the inter-trial interval.

There is also a variable that gives the completion URL, which can be used to provide e.g. a Prolific completion URL, or a link to questionnaires.

### Trial setup

The locations of the asteroids on each trial are specified in the `trial_info.json` file. This provides the same trial outcomes as the version used in the original paper, with 270 trials in total, but this can be edited if desired.

There are two variables in the JSON file, `positions_A` and `positions_B`, which refer to the positions of the two holes in the asteroid belts. If there is no hole, the value is set to `-999`.

## Saving data

### API-based data saving

This version of the task saves data by sending a POST request to a local API endpoint (`/submit_data`) provided by the [local data server package](https://github.com/the-wise-lab/EEG-task-data-server). The server should be running on `localhost:5000`.

This sends all of the data so far on every call, so we use the "overwrite" write mode to replace the previous data.

**Endpoint:** `POST /submit_data`

**Request format:**

```json
{
  "id": "participant_id",
  "session": "session_number",
  "task": "spaceship",  // Optional: identifies the task type
  "write_mode": "overwrite",  // Optional: "append" (default) or "overwrite"
  "data": [
    {"time": 1000, "value": 0.5, "marker": "stimulus_1"},
    {"time": 2000, "value": 0.7, "marker": "response_1"}
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Data appended for participant ...",
  "filename": "data/participant_...csv",
  "records_added": 2,
  "total_records": 5,
  "write_mode": "overwrite"
}
```

See the code in `src/scenes/GameOver.js` and `src/scenes/EndScene.js` for implementation details.