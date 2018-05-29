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

In your Cordova project, run:

`cordova plugin add cordova-plugin-bambuser`


## Usage

Use the Cordova-style callback-based methods of `window.bambuser`
from within your Cordova application.

```javascript
// http://cordova.apache.org/docs/en/8.x/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);
function onDeviceReady() {
  // Now safe to use device APIs
  if (!window.bambuser) {
    alert('cordova-plugin-bambuser is not installed');
  } else {
    var broadcaster = window.bambuser;
    broadcaster.setApplicationId('YOUR-APPLICATION-ID', function() {
      broadcaster.showViewfinderBehindWebView(function() {
        // maybe also set title etc here before starting
        // maybe move startBroadcast() to a button callback instead of starting right aways
        broadcaster.startBroadcast(function() {
          // update UI to show that we're live!
        }, function(err) { alert('failed to start broadcast'); });
      }, function(err) { alert('failed to show viewfinder'); });
    }, function(err) { alert('failed to set application id'); });
  }
}
```

See [www/broadcaster.js](./www/broadcaster.js) for details.
