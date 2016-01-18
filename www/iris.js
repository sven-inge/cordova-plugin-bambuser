var Iris = {}

var exec = require('cordova/exec');

var viewfinderVisible = false;
var togglingViewfinder = false;

Iris.showViewfinderBehindWebView = function(successCallback, errorCallback) {
    if (togglingViewfinder) {
        console.log('ignored multiple calls to showViewfinderBehindWebView');
        return errorCallback();
    }
    if (viewfinderVisible) {
        console.log('viewfinder is already visible');
        return errorCallback();
    }
    togglingViewfinder = true;
    exec(function() {
        // console.log('showViewfinderBehindWebView success');
        togglingViewfinder = false;
        viewfinderVisible = true;
        successCallback.call(this, arguments);
    }, function() {
        console.log('showViewfinderBehindWebView failure');
        togglingViewfinder = false;
        errorCallback.call(this, arguments);
    }, 'Iris', 'showViewfinderBehindWebView', []);
}

Iris.hideViewfinder = function(successCallback, errorCallback) {
    if (togglingViewfinder) {
        console.log('ignored multiple calls to hideViewfinder');
        return errorCallback();
    }
    if (!viewfinderVisible) {
        console.log('hideViewfinder: viewfinder is already hidden');
        return errorCallback();
    }
    togglingViewfinder = true;
    exec(function() {
        // console.log('hideViewfinder success');
        togglingViewfinder = false;
        viewfinderVisible = false;
        successCallback.call(this, arguments);
    }, function() {
        console.log('hideViewfinder failure');
        togglingViewfinder = false;
        errorCallback.call(this, arguments);
    }, 'Iris', 'hideViewfinder', []);
}

Iris.toggleViewfinder = function(successCallback, errorCallback) {
    if (viewfinderVisible) {
        Iris.hideViewfinder(successCallback, errorCallback);
    } else {
        Iris.showViewfinderBehindWebView(successCallback, errorCallback);
    }
}

Iris.setCustomData = function(customData, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Iris', 'setCustomData', [customData]);
}

Iris.setPrivateMode = function(value, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Iris', 'setPrivateMode', [value]);
}

Iris.setSendPosition = function(value, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Iris', 'setSendPosition', [value]);
}

Iris.setTitle = function(title, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Iris', 'setTitle', [title]);
}

Iris.startBroadcast = function(username, password, successCallback, errorCallback) {
    // console.log('startBroadcast called with username ' + username);
    if (!username) errorCallback('A username is required');
    if (!password) errorCallback('A password is required');
    exec(successCallback, errorCallback, 'Iris', 'startBroadcast', [username, password]);
};

Iris.stopBroadcast = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Iris', 'stopBroadcast', []);
};

Iris.switchCamera = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Iris', 'switchCamera', []);
};

module.exports = Iris;
