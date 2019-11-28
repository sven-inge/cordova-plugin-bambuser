var Player = {}

var exec = require('cordova/exec');
var utils = require('cordova/utils');

var playerVisible = false;
var queue = Promise.resolve();

var execQueue = function() {
    var execArgs = Array.prototype.slice.call(arguments);
    queue = queue.then(function() {
        return new Promise(function(resolve) {
            var userCb = execArgs.shift();
            var userEb = execArgs.shift();
            execArgs.unshift(function() {
                // Custom errback that resolves the queue promise before triggering actual errback
                resolve();
                if (userEb) userEb.apply(null, arguments);
            });
            execArgs.unshift(function() {
                // Custom callback that resolves the queue promise before triggering actual callback
                resolve();
                if (userCb) userCb.apply(null, arguments);
            });
            exec.apply(null, execArgs);
        });
    });
};

Player._applicationIdSet = false;

/**
 * https://bambuser.com/docs/key-concepts/application-id/
 */
Player.setApplicationId = function(applicationId, successCallback, errorCallback) {
    var res;
    if (!successCallback) {
        res = new Promise(function (resolve, reject) { successCallback = resolve; errorCallback = reject; });
    }
    if (Player._applicationIdSet) {
        errorCallback('applicationId is already set');
        return res;
    }
    if (!applicationId) {
        errorCallback('An applicationId is required');
        return res;
    }
    Player._applicationIdSet = true;
    execQueue(successCallback, errorCallback, 'CordovaBambuserPlayer', 'setApplicationId', [applicationId]);
    return res;
}

Player.showPlayerBehindWebView = function(successCallback, errorCallback) {
    var res;
    if (!successCallback) {
        res = new Promise(function (resolve, reject) { successCallback = resolve; errorCallback = reject; });
    }
    execQueue(function() {
        // console.log('showPlayerBehindWebView success');
        playerVisible = true;
        if (successCallback) {
          successCallback.call(this, arguments);
        }
    }, function() {
        console.log('showPlayerBehindWebView failure');
        if (errorCallback) {
          errorCallback.call(this, arguments);
        }
    }, 'CordovaBambuserPlayer', 'showPlayerBehindWebView', []);
    return res;
}

Player.hidePlayer = function(successCallback, errorCallback) {
    var res;
    if (!successCallback) {
        res = new Promise(function (resolve, reject) { successCallback = resolve; errorCallback = reject; });
    }
    execQueue(function() {
        // console.log('hidePlayer success');
        playerVisible = false;
        if (successCallback) {
          successCallback.call(this, arguments);
        }
    }, function() {
        console.log('hidePlayer failure');
        if (errorCallback) {
          errorCallback.call(this, arguments);
        }
    }, 'CordovaBambuserPlayer', 'hidePlayer', []);
    return res;
}

Player.setAudioVolume = function(audioVolume, successCallback, errorCallback) {
    var res;
    if (!successCallback) {
        res = new Promise(function (resolve, reject) { successCallback = resolve; errorCallback = reject; });
    }
    if (!Player._applicationIdSet) {
        errorCallback('applicationId must be set first');
        return res;
    }
    execQueue(successCallback, errorCallback, 'CordovaBambuserPlayer', 'setAudioVolume', [audioVolume]);
    return res;
}

/**
 * Create a new player instance that loads a specific broadcast
 * given a resourceUri
 * https://bambuser.com/docs/key-concepts/resource-uri/
 *
 * Options:
 *
 * - requiredBroadcastState
 *   live|archived|any (default)
 *
 *   Can be used to ensure that the player will only play the provided broadcast
 *   while its status is still live, prohibiting playback of an archived file,
 *   or vice versa.
 *   https://bambuser.com/docs/reference/android-sdk-0.9.14/com/bambuser/broadcaster/BroadcastPlayer.html#setAcceptType-com.bambuser.broadcaster.BroadcastPlayer.AcceptType-
 */
Player.loadBroadcast = function(resourceUri, options, successCallback, errorCallback) {
    if (!errorCallback) {
      // 3 arguments or fewer - shift arguments
      errorCallback = successCallback;
      successCallback = options;
    }
    if (!options) options = {};
    var res;
    if (!successCallback) {
        res = new Promise(function (resolve, reject) { successCallback = resolve; errorCallback = reject; });
    }
    if (!Player._applicationIdSet) {
        errorCallback('applicationId must be set first');
        return res;
    }
    execQueue(successCallback, errorCallback, 'CordovaBambuserPlayer', 'loadBroadcast', [
        resourceUri,
        options.requiredBroadcastState || 'any',
    ]);
    return res;
};

Player.pause = function(successCallback, errorCallback) {
    var res;
    if (!successCallback) {
        res = new Promise(function (resolve, reject) { successCallback = resolve; errorCallback = reject; });
    }
    if (!Player._applicationIdSet) {
        errorCallback('applicationId must be set first');
        return res;
    }
    execQueue(successCallback, errorCallback, 'CordovaBambuserPlayer', 'pause', []);
    return res;
};

Player.resume = function(successCallback, errorCallback) {
    var res;
    if (!successCallback) {
        res = new Promise(function (resolve, reject) { successCallback = resolve; errorCallback = reject; });
    }
    if (!Player._applicationIdSet) {
        errorCallback('applicationId must be set first');
        return res;
    }
    execQueue(successCallback, errorCallback, 'CordovaBambuserPlayer', 'resume', []);
    return res;
};

Player.close = function(successCallback, errorCallback) {
    var res;
    if (!successCallback) {
        res = new Promise(function (resolve, reject) { successCallback = resolve; errorCallback = reject; });
    }
    if (!Player._applicationIdSet) {
        errorCallback('applicationId must be set first');
        return res;
    }
    execQueue(successCallback, errorCallback, 'CordovaBambuserPlayer', 'close', []);
    return res;
};

Player._eventListeners = {};

Player.addEventListener = function(event, successCallback, errorCallback) {
    var id = utils.createUUID();
    Player._eventListeners[id] = {
        event: event,
        callback: successCallback,
    };
    Player._ensureSubscribed();
    return id;
};

Player.removeEventListener = function(id) {
    delete Player._eventListeners[id];
}

Player._emitEvent = function(eventName, payload) {
    Object.keys(Player._eventListeners).forEach(function(id) {
        if (typeof Player._eventListeners[id] === 'object') {
            var listener = Player._eventListeners[id];
            if (listener.event === eventName) {
                listener.callback(payload);
            }
        }
    });
}

Player._isSubscribed = false;

Player._ensureSubscribed = function() {
    if (Player._isSubscribed) return;
    Player._isSubscribed = true;

    exec(function(event) {
        console.log('broadcastLoaded');
        console.log(event);
        Player._emitEvent('broadcastLoaded', event);
    }, function(e) {
        console.log('BambuserPlayer: failed to subscribe to onBroadcastLoaded', e);
    }, 'CordovaBambuserPlayer', 'onBroadcastLoaded', []);

    exec(function(state) {
        console.log('stateChange: ' + state);
        Player._emitEvent('stateChange', state);
    }, function(e) {
        console.log('BambuserPlayer: failed to subscribe to onStateChange', e);
    }, 'CordovaBambuserPlayer', 'onStateChange', []);
};

module.exports = Player;
