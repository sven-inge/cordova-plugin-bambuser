#import "CordovaBambuserPlayer.h"

@implementation CordovaBambuserPlayer {
    UIColor *originalBackgroundColor;
    NSString *onBroadcastLoadedCallbackId;
    NSString *onStateChangeCallbackId;
    NSNumber *audioVolume;
    NSString *applicationId;
    bool hasEmittedBroadcastLoaded;
}

- (id) init {
    if (self = [super init]) {
        originalBackgroundColor = self.webView.backgroundColor;
        onBroadcastLoadedCallbackId = nil;
        onStateChangeCallbackId = nil;
        audioVolume = nil;
        applicationId = nil;
        hasEmittedBroadcastLoaded = false;
    }
    return self;
}

- (void) setPlayerDimensions {
    if (bambuserPlayer != nil) {
        bambuserPlayer.frame = CGRectMake(0, 0, self.webView.bounds.size.width, self.webView.bounds.size.height);
    }
}

- (void) ensureLibbambuserIsBootstrapped {
    if (bambuserPlayer == nil) {
        bambuserPlayer = [[BambuserPlayer alloc] init];
        bambuserPlayer.delegate = self;

        // Persist some settings between plays
        if (applicationId != nil) {
            bambuserPlayer.applicationId = applicationId;
        }
        if (audioVolume != nil) {
            bambuserPlayer.volume = [audioVolume floatValue];
        }
        [self.webView.superview insertSubview: bambuserPlayer belowSubview:self.webView];
    }
    [self setPlayerDimensions];
}

- (void) setApplicationId: (CDVInvokedUrlCommand*) command {
    CDVPluginResult* result = nil;
    NSString* newApplicationId = command.arguments[0];
    if (newApplicationId != nil && [newApplicationId length] > 0) {
        [self ensureLibbambuserIsBootstrapped];
        applicationId = newApplicationId;
        bambuserPlayer.applicationId = applicationId;
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) showPlayerBehindWebView: (CDVInvokedUrlCommand*) command {
    [self.webView setOpaque: NO];
    self.webView.backgroundColor = UIColor.clearColor;
    [self ensureLibbambuserIsBootstrapped];
    [self.commandDelegate sendPluginResult: [CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId: command.callbackId];
}

- (void) hidePlayer: (CDVInvokedUrlCommand*) command {
    [self.webView setOpaque: YES];
    self.webView.backgroundColor = originalBackgroundColor;
    if (bambuserPlayer != nil) {
        [bambuserPlayer removeFromSuperview];
    }
    [self.commandDelegate sendPluginResult: [CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId: command.callbackId];
}

- (void) setAudioVolume: (CDVInvokedUrlCommand*) command {
    NSNumber* volume = command.arguments[0];
    // // Let volume persist between plays
    audioVolume = volume;
    if (bambuserPlayer != nil) {
        bambuserPlayer.volume = [audioVolume floatValue];
    }
    [self.commandDelegate sendPluginResult: [CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId: command.callbackId];
}

- (void) loadBroadcast: (CDVInvokedUrlCommand*) command {
    NSString* resourceUri = command.arguments[0];
    NSString* requiredBroadcastState = command.arguments[1];
    hasEmittedBroadcastLoaded = false;
    if (bambuserPlayer != nil) {
      [bambuserPlayer stopVideo];
      [bambuserPlayer removeFromSuperview];
      bambuserPlayer.delegate = nil;
      bambuserPlayer = nil;
    }
    [self ensureLibbambuserIsBootstrapped];
    if ([requiredBroadcastState isEqualToString:@"live"]) {
        bambuserPlayer.requiredBroadcastState = kBambuserBroadcastStateLive;
    }
    if ([requiredBroadcastState isEqualToString:@"archived"]) {
        bambuserPlayer.requiredBroadcastState = kBambuserBroadcastStateArchived;
    }
    if ([requiredBroadcastState isEqualToString:@"any"]) {
        bambuserPlayer.requiredBroadcastState = kBambuserBroadcastStateAny;
    }
    [bambuserPlayer playVideo: resourceUri];
    [self.commandDelegate sendPluginResult: [CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId: command.callbackId];
}

- (void) pause: (CDVInvokedUrlCommand*) command {
    if (bambuserPlayer != nil) {
        [bambuserPlayer pauseVideo];
    }
    [self.commandDelegate sendPluginResult: [CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId: command.callbackId];
}

/*
- (void) stop: (CDVInvokedUrlCommand*) command {
    // Do we need to expose this one?
    // See also: close in Android wrapper
    if (bambuserPlayer != nil) {
        [bambuserPlayer stopVideo];
    }
    [self.commandDelegate sendPluginResult: [CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId: command.callbackId];
}
*/

- (void) resume: (CDVInvokedUrlCommand*) command {
    if (bambuserPlayer != nil) {
        [bambuserPlayer playVideo];
    }
    [self.commandDelegate sendPluginResult: [CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId: command.callbackId];
}

- (void) close: (CDVInvokedUrlCommand*) command {
    if (bambuserPlayer != nil) {
        [bambuserPlayer stopVideo];
        bambuserPlayer.delegate = nil;
        bambuserPlayer = nil;
    }
    [self.commandDelegate sendPluginResult: [CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId: command.callbackId];
}

- (void) onBroadcastLoaded: (CDVInvokedUrlCommand*) command {
    onBroadcastLoadedCallbackId = command.callbackId;
}

- (void) onStateChange: (CDVInvokedUrlCommand*) command {
    onStateChangeCallbackId = command.callbackId;
}

- (void) videoLoadFail {
    NSLog(@"Received videoLoadFail signal");
    if (onStateChangeCallbackId != nil) {
        NSString *res = @"error";
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:(CDVCommandStatus)CDVCommandStatus_OK messageAsString:res];
        [result setKeepCallbackAsBool:true];
        [self.commandDelegate sendPluginResult: result callbackId: onStateChangeCallbackId];
    }
}

- (void) playbackStarted {
    NSLog(@"Received broadcastStarted signal");

    // emulate Android's
    if (!hasEmittedBroadcastLoaded) {
        if (onBroadcastLoadedCallbackId != nil) {
            NSDictionary *res = @{
                @"isLive": @(bambuserPlayer.live),
                // Available via Android SDK - should they be added?
                // @"width": 0,
                // @"hegiht": 0,
            };
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:(CDVCommandStatus)CDVCommandStatus_OK messageAsDictionary:res];
            [result setKeepCallbackAsBool:true];
            [self.commandDelegate sendPluginResult: result callbackId: onBroadcastLoadedCallbackId];
        }
        hasEmittedBroadcastLoaded = true;
    }

    if (onStateChangeCallbackId != nil) {
        NSString *res = @"playing";
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:(CDVCommandStatus)CDVCommandStatus_OK messageAsString:res];
        [result setKeepCallbackAsBool:true];
        [self.commandDelegate sendPluginResult: result callbackId: onStateChangeCallbackId];
    }
}

- (void) playbackPaused {
    NSLog(@"Received broadcastStopped signal");
    if (onStateChangeCallbackId != nil) {
        NSString *res = @"paused";
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:(CDVCommandStatus)CDVCommandStatus_OK messageAsString:res];
        [result setKeepCallbackAsBool:true];
        [self.commandDelegate sendPluginResult: result callbackId: onStateChangeCallbackId];
    }
}

- (void) playbackStopped {
    NSLog(@"Received broadcastStopped signal");
    if (onStateChangeCallbackId != nil) {
        NSString *res = @"stopped";
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:(CDVCommandStatus)CDVCommandStatus_OK messageAsString:res];
        [result setKeepCallbackAsBool:true];
        [self.commandDelegate sendPluginResult: result callbackId: onStateChangeCallbackId];
    }
}

- (void) playbackCompleted {
    NSLog(@"Received playbackCompleted signal");
    if (onStateChangeCallbackId != nil) {
        NSString *res = @"completed";
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:(CDVCommandStatus)CDVCommandStatus_OK messageAsString:res];
        [result setKeepCallbackAsBool:true];
        [self.commandDelegate sendPluginResult: result callbackId: onStateChangeCallbackId];
    }
}

@end
