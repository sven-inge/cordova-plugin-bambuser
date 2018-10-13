#import <Cordova/CDVPlugin.h>
#import "libbambuserplayer.h"

@interface CordovaBambuserPlayer : CDVPlugin <BambuserPlayerDelegate> {
    BambuserPlayer *bambuserPlayer;
}

- (void) setApplicationId: (CDVInvokedUrlCommand*) command;
- (void) showPlayerBehindWebView: (CDVInvokedUrlCommand*) command;
- (void) hidePlayer: (CDVInvokedUrlCommand*) command;
- (void) loadBroadcast: (CDVInvokedUrlCommand*) command;
- (void) pause: (CDVInvokedUrlCommand*) command;
// - (void) stop: (CDVInvokedUrlCommand*) command;
- (void) resume: (CDVInvokedUrlCommand*) command;
- (void) close: (CDVInvokedUrlCommand*) command;

// BambuserPlayerDelegate
- (void) videoLoadFail;
- (void) playbackStarted;
- (void) playbackPaused;
- (void) playbackStopped;
- (void) playbackCompleted;

@end
