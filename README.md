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
    var broadcaster = window.bambuser.broadcaster;
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

### Promises
For promise support, omit both callbacks:
```javascript
document.addEventListener('deviceready', () => {
  const { broadcaster } = window.bambuser;
  broadcaster.setApplicationId('YOUR-APPLICATION-ID').then(() => {
    return broadcaster.showViewfinderBehindWebView()
  }).then(() => {
    // maybe also set title etc here before starting
    // maybe move startBroadcast() to a button callback instead of starting right aways
    return broadcaster.startBroadcast();
  }).catch(e => console.log(e));
}, false);
```

### async/await
```javascript
document.addEventListener('deviceready', async () => {
  try {
    const { broadcaster } = window.bambuser;
    await broadcaster.setApplicationId('YOUR-APPLICATION-ID');
    await broadcaster.showViewfinderBehindWebView();
    // maybe also set title etc here before starting
    // maybe move startBroadcast() to a button callback instead of starting right aways
    await broadcaster.startBroadcast();
  } catch (e) {
    console.log(e);
  }
});
```

### TypeScript
Typescript definitions are not currently included. As a workaround, it is often
possible to access the plugin's window property via the array syntax and declaring
a shortcut variable of type `any`:

```javascript
document.addEventListener('deviceready', async () => {
  if (!window['bambuser']) {
    alert('cordova-plugin-bambuser is not installed');
  } else {
    const broadcaster: any = window['bambuser']['broadcaster'];
    // ...
  }
});
```

See [www/broadcaster.js](./www/broadcaster.js) for details.
