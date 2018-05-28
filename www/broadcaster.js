var Broadcaster = {}

var exec = require('cordova/exec');
var utils = require('cordova/utils');

var viewfinderVisible = false;
var togglingViewfinder = false;

Broadcaster._applicationIdSet = false;

Broadcaster.setApplicationId = function(applicationId, successCallback, errorCallback) {
    var res;
    if (!successCallback && window['Promise']) {
        res = new Promise(function (resolve, reject) { successCallback = resolve; errorCallback = reject; });
    }
    if (Broadcaster._applicationIdSet) {
        errorCallback('applicationId is already set');
        return res;
    }
    if (!applicationId) {
        errorCallback('An applicationId is required');
        return res;
    }
    Broadcaster._applicationIdSet = true;
    exec(successCallback, errorCallback, 'CordovaBambuserBroadcaster', 'setApplicationId', [applicationId]);
    return res;
}


Broadcaster.showViewfinderBehindWebView = function(successCallback, errorCallback) {
    var res;
    if (!successCallback && window['Promise']) {
        res = new Promise(function (resolve, reject) { successCallback = resolve; errorCallback = reject; });
    }
    if (togglingViewfinder) {
        console.log('ignored multiple calls to showViewfinderBehindWebView');
        errorCallback();
        return res;
    }
    if (viewfinderVisible) {
        console.log('viewfinder is already visible');
        errorCallback();
        return res;
    }
    togglingViewfinder = true;
    exec(function() {
        // console.log('showViewfinderBehindWebView success');
        togglingViewfinder = false;
        viewfinderVisible = true;
        if (successCallback) {
          successCallback.call(this, arguments);
        }
    }, function() {
        console.log('showViewfinderBehindWebView failure');
        togglingViewfinder = false;
        if (errorCallback) {
          errorCallback.call(this, arguments);
        }
    }, 'CordovaBambuserBroadcaster', 'showViewfinderBehindWebView', []);
    return res;
}

Broadcaster.hideViewfinder = function(successCallback, errorCallback) {
    var res;
    if (!successCallback && window['Promise']) {
        res = new Promise(function (resolve, reject) { successCallback = resolve; errorCallback = reject; });
    }
    if (togglingViewfinder) {
        console.log('ignored multiple calls to hideViewfinder');
        errorCallback();
        return res;
    }
    if (!viewfinderVisible) {
        console.log('hideViewfinder: viewfinder is already hidden');
        errorCallback();
        return res;
    }
    togglingViewfinder = true;
    exec(function() {
        // console.log('hideViewfinder success');
        togglingViewfinder = false;
        viewfinderVisible = false;
        if (successCallback) {
          successCallback.call(this, arguments);
        }
    }, function() {
        console.log('hideViewfinder failure');
        togglingViewfinder = false;
        if (errorCallback) {
          errorCallback.call(this, arguments);
        }
    }, 'CordovaBambuserBroadcaster', 'hideViewfinder', []);
    return res;
}

Broadcaster.toggleViewfinder = function(successCallback, errorCallback) {
    if (viewfinderVisible) {
        return Broadcaster.hideViewfinder(successCallback, errorCallback);
    } else {
        return Broadcaster.showViewfinderBehindWebView(successCallback, errorCallback);
    }
}

Broadcaster.setCustomData = function(customData, successCallback, errorCallback) {
    var res;
    if (!successCallback && window['Promise']) {
        res = new Promise(function (resolve, reject) { successCallback = resolve; errorCallback = reject; });
    }
    if (!Broadcaster._applicationIdSet) {
        errorCallback('applicationId must be set first');
        return res;
    }
    exec(successCallback, errorCallback, 'CordovaBambuserBroadcaster', 'setCustomData', [customData]);
    return res;
}

Broadcaster.setPrivateMode = function(value, successCallback, errorCallback) {
    var res;
    if (!successCallback && window['Promise']) {
        res = new Promise(function (resolve, reject) { successCallback = resolve; errorCallback = reject; });
    }
    if (!Broadcaster._applicationIdSet) {
        errorCallback('applicationId must be set first');
        return res;
    }
    exec(successCallback, errorCallback, 'CordovaBambuserBroadcaster', 'setPrivateMode', [value]);
    return res;
}

Broadcaster.setSendPosition = function(value, successCallback, errorCallback) {
    var res;
    if (!successCallback && window['Promise']) {
        res = new Promise(function (resolve, reject) { successCallback = resolve; errorCallback = reject; });
    }
    if (!Broadcaster._applicationIdSet) {
        errorCallback('applicationId must be set first');
        return res;
    }
    exec(successCallback, errorCallback, 'CordovaBambuserBroadcaster', 'setSendPosition', [value]);
    return res;
}

Broadcaster.setTitle = function(title, successCallback, errorCallback) {
    var res;
    if (!successCallback && window['Promise']) {
        res = new Promise(function (resolve, reject) { successCallback = resolve; errorCallback = reject; });
    }
    if (!Broadcaster._applicationIdSet) {
        errorCallback('applicationId must be set first');
        return res;
    }
    exec(successCallback, errorCallback, 'CordovaBambuserBroadcaster', 'setTitle', [title]);
    return res;
}

/**
 * Supported presets:
 * - auto
 *      Attempts to optimize for a high (adaptive) frame rate by also
 *      adapting the frame quality to the observed throughput. Uses
 *      useAutomaticResolutionSwitching() on Android and
 *      setVideoQualityPreset('kSessionPresetAuto') on iOS.
 *
 * Default: Constant (platfrom-specific default) frame quality
 * with adaptive frame rate.
 */
Broadcaster.setVideoQualityPreset = function(preset, successCallback, errorCallback) {
    var res;
    if (!successCallback && window['Promise']) {
        res = new Promise(function (resolve, reject) { successCallback = resolve; errorCallback = reject; });
    }
    if (!Broadcaster._applicationIdSet) {
        errorCallback('applicationId must be set first');
        return res;
    }
    exec(successCallback, errorCallback, 'CordovaBambuserBroadcaster', 'setVideoQualityPreset', [preset]);
    return res;
}

Broadcaster.startBroadcast = function(successCallback, errorCallback) {
    var res;
    if (!successCallback && window['Promise']) {
        res = new Promise(function (resolve, reject) { successCallback = resolve; errorCallback = reject; });
    }
    if (!Broadcaster._applicationIdSet) {
        errorCallback('applicationId must be set first');
        return res;
    }
    exec(function(response) {
        var id = Broadcaster.addEventListener('connectionStatusChange', function(status) {
            if (status === 'capturing') {
                Broadcaster.removeEventListener(id);
                successCallback(status);
                return;
            }
            if (status === 'finishing' || status === 'idle') {
                console.log('Broadcaster.startBroadcast: Broadcasting stopped before reaching capture state');
                Broadcaster.removeEventListener(id);
                errorCallback(status);
                return;
            }
        });
    }, errorCallback, 'CordovaBambuserBroadcaster', 'startBroadcast', []);
    return res;
};

Broadcaster.stopBroadcast = function(successCallback, errorCallback) {
    var res;
    if (!successCallback && window['Promise']) {
        res = new Promise(function (resolve, reject) { successCallback = resolve; errorCallback = reject; });
    }
    if (!Broadcaster._applicationIdSet) {
        errorCallback('applicationId must be set first');
        return res;
    }
    exec(successCallback, errorCallback, 'CordovaBambuserBroadcaster', 'stopBroadcast', []);
    return res;
};

Broadcaster.switchCamera = function(successCallback, errorCallback) {
    var res;
    if (!successCallback && window['Promise']) {
        res = new Promise(function (resolve, reject) { successCallback = resolve; errorCallback = reject; });
    }
    if (!Broadcaster._applicationIdSet) {
        errorCallback('applicationId must be set first');
        return res;
    }
    if (!Broadcaster._applicationIdSet) return errorCallback('applicationId must be set first');
    exec(successCallback, errorCallback, 'CordovaBambuserBroadcaster', 'switchCamera', []);
    return res;
};

Broadcaster._eventListeners = {};

Broadcaster.addEventListener = function(event, successCallback, errorCallback) {
    var id = utils.createUUID();
    Broadcaster._eventListeners[id] = {
        event: event,
        callback: successCallback,
    };
    Broadcaster._ensureSubscribed();
    return id;
};

Broadcaster.removeEventListener = function(id) {
    delete Broadcaster._eventListeners[id];
}

Broadcaster._emitEvent = function(eventName, payload) {
    Object.keys(Broadcaster._eventListeners).forEach(function(id) {
        if (typeof Broadcaster._eventListeners[id] === 'object') {
            var listener = Broadcaster._eventListeners[id];
            if (listener.event === eventName) {
                listener.callback(payload);
            }
        }
    });
}

Broadcaster._isSubscribed = false;

Broadcaster._ensureSubscribed = function() {
    if (Broadcaster._isSubscribed) return;
    Broadcaster._isSubscribed = true;

    exec(function(status) {
        // TODO: define a high-level vocabulary that works with both SDK:s
        console.log('connectionError: ' + status);
        Broadcaster._emitEvent('connectionError', status);
    }, function(e) {
        console.log('BambuserBroadcaster: failed to subscribe to onConnectionError', e);
    }, 'CordovaBambuserBroadcaster', 'onConnectionError', []);

    exec(function(status) {
        console.log('connectionStatusChange: ' + status);
        Broadcaster._emitEvent('connectionStatusChange', status);
    }, function(e) {
        console.log('BambuserBroadcaster: failed to subscribe to onConnectionStatusChange', e);
    }, 'CordovaBambuserBroadcaster', 'onConnectionStatusChange', []);
};

module.exports = Broadcaster;
