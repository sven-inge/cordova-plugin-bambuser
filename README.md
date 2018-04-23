<div>
  <br/><br />
  <p align="center">
    <a href="https://irisplatform.io" target="_blank" align="center">
        <img src="https://irisplatform.io/static/images/company/iris-by-bambuser-black-horisontal.png" width="280">
    </a>
  </p>
  <br/><br />
</div>

cordova-plugin-bambuser
-----------------------


## Installation

- Download `libbambuser-android-0.9.12-170628.zip`
from https://dashboard.irisplatform.io/developer
and unzip it to `cordova-plugin-bambuser/libambuser-android`

In general, `cordova-plugin-bambuser` tagets a specific version of the SDK:s.
For best results, use exactly the version mentioned above and double-check
whether or not the targeted SDK version changes when updating `cordova-plugin-bambuser`.

- In your Cordova project: `cordova plugin add path/to/cordova-plugin-bambuser`


## Usage

Use the Cordova-style callback-based methods of `window.bambuser`
from within your Cordova application.

See [www/broadcaster.js](./www/broadcaster.js) for details.
