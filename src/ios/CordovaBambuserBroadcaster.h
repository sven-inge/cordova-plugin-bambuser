#import <Cordova/CDVPlugin.h>
#import "libbambuser.h"

@interface CordovaBambuserBroadcaster : CDVPlugin {
    BambuserView *bambuserView;
}

- (void) setApplicationId: (CDVInvokedUrlCommand*) command;
- (void) showViewfinderBehindWebView: (CDVInvokedUrlCommand*) command;
- (void) hideViewfinder: (CDVInvokedUrlCommand*) command;
- (void) setCustomData: (CDVInvokedUrlCommand*) command;
- (void) setSendPosition: (CDVInvokedUrlCommand*) command;
- (void) setTitle: (CDVInvokedUrlCommand*) command;
- (void) setVideoQualityPreset: (CDVInvokedUrlCommand*) command;
- (void) startBroadcast: (CDVInvokedUrlCommand*) command;
- (void) stopBroadcast: (CDVInvokedUrlCommand*) command;
- (void) switchCamera: (CDVInvokedUrlCommand*) command;

@end
