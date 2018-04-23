#import "CordovaBambuserBroadcaster.h"

@implementation CordovaBambuserBroadcaster {
    UIColor *originalBackgroundColor;
}

- (id) init {
    if (self = [super init]) {
        originalBackgroundColor = self.webView.backgroundColor;
    }
    return self;
}

- (void) ensureLibbambuserIsBootstrapped {
    if (bambuserView == nil) {
        bambuserView = [[BambuserView alloc] initWithPreset: kSessionPresetAuto];
    }
}

- (void) setApplicationId: (CDVInvokedUrlCommand*) command {
    CDVPluginResult* result = nil;
    NSString* applicationId = command.arguments[0];
    if (applicationId != nil && [applicationId length] > 0) {
        [self ensureLibbambuserIsBootstrapped];
        bambuserView.applicationId = applicationId;
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) showViewfinderBehindWebView: (CDVInvokedUrlCommand*) command {
    [self.webView setOpaque: NO];
    self.webView.backgroundColor = UIColor.clearColor;
    [self ensureLibbambuserIsBootstrapped];
    [bambuserView setOrientation: [UIApplication sharedApplication].statusBarOrientation];
    [self.webView.superview insertSubview: bambuserView.view belowSubview:self.webView];
    [bambuserView setPreviewFrame: CGRectMake(0, 0, self.webView.bounds.size.width, self.webView.bounds.size.height)];
    [self.commandDelegate sendPluginResult: [CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId: command.callbackId];
}

- (void) hideViewfinder: (CDVInvokedUrlCommand*) command {
    [self.webView setOpaque: YES];
    self.webView.backgroundColor = originalBackgroundColor;
    if (bambuserView != nil) {
        [bambuserView.view removeFromSuperview];
    }
    [self.commandDelegate sendPluginResult: [CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId: command.callbackId];
}

- (void) setCustomData: (CDVInvokedUrlCommand*) command {
    CDVPluginResult* result = nil;
    NSString* customData = command.arguments[0];
    if (customData != nil) {
        [self ensureLibbambuserIsBootstrapped];
        bambuserView.customData = customData;
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) setSendPosition: (CDVInvokedUrlCommand*) command {
    [self ensureLibbambuserIsBootstrapped];
    bambuserView.sendPosition = (BOOL)[command.arguments[0] boolValue];
    [self.commandDelegate sendPluginResult: [CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId: command.callbackId];
}

- (void) setTitle: (CDVInvokedUrlCommand*) command {
    CDVPluginResult* result = nil;
    NSString* title = command.arguments[0];
    if (title != nil) {
        [self ensureLibbambuserIsBootstrapped];
        bambuserView.broadcastTitle = title;
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) setVideoQualityPreset: (CDVInvokedUrlCommand*) command {
    CDVPluginResult* result = nil;
    NSString* preset = command.arguments[0];
    if ([preset isEqualToString:@"auto"]) {
        [self ensureLibbambuserIsBootstrapped];
        [bambuserView setVideoQualityPreset: kSessionPresetAuto];
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) startBroadcast: (CDVInvokedUrlCommand*) command {
    [self ensureLibbambuserIsBootstrapped];
    [bambuserView startBroadcasting];
    [self.commandDelegate sendPluginResult: [CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId: command.callbackId];
}

- (void) stopBroadcast: (CDVInvokedUrlCommand*) command {
    [self ensureLibbambuserIsBootstrapped];
    [bambuserView stopBroadcasting];
    [self.commandDelegate sendPluginResult: [CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId: command.callbackId];
}

- (void) switchCamera: (CDVInvokedUrlCommand*) command {
    [self ensureLibbambuserIsBootstrapped];
    [bambuserView swapCamera];
    [self.commandDelegate sendPluginResult: [CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId: command.callbackId];
}

@end
