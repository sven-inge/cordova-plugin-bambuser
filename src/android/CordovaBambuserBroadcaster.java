package com.bambuser.cordova;

import android.app.Activity;
import android.content.pm.PackageManager;
import android.graphics.Point;
import android.Manifest.permission;
import android.util.Log;
import android.view.Display;
import android.view.SurfaceView;
import static android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;
import android.widget.Toast;
import com.bambuser.broadcaster.BroadcastStatus;
import com.bambuser.broadcaster.Broadcaster;
import com.bambuser.broadcaster.CameraError;
import com.bambuser.broadcaster.ConnectionError;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.json.JSONException;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;

public class CordovaBambuserBroadcaster extends CordovaPlugin implements Broadcaster.Observer {
    private static final String LOG_PREFIX = "CordovaBambuserBroadcaster";
    private static final int BROADCAST_PERMISSIONS_CODE = 3;
    private CordovaBambuserBroadcaster self;
    private SurfaceView previewSurfaceView;
    private CallbackContext onConnectionStatusChangeCallbackContext;

    /**
     * CordovaPlugin methods
     */

    @Override
    public void initialize(final CordovaInterface cordova, final CordovaWebView webView) {
        log("initialization");
        super.initialize(cordova, webView);
        self = this;

        cordova.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                FrameLayout layout = (FrameLayout) webView.getView().getParent();
                previewSurfaceView = new SurfaceView(layout.getContext());
                final Activity activity = cordova.getActivity();

                mDefaultDisplay = activity.getWindowManager().getDefaultDisplay();
                mBroadcaster = new Broadcaster(activity, self);
                mBroadcaster.setRotation(mDefaultDisplay.getRotation());
                mBroadcaster.setCameraSurface(previewSurfaceView);
            }
        });
    }

    @Override
    public boolean execute(final String action, final CordovaArgs args, final CallbackContext callbackContext) throws JSONException {
        log("Executing Cordova plugin action: " + action);

        if ("showViewfinderBehindWebView".equals(action)) {
            this.cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Point displaySize = new Point();
                    cordova.getActivity().getWindowManager().getDefaultDisplay().getRealSize(displaySize);
                    log("display size: " + displaySize.x + "x" + displaySize.y);

                    int previewWidth = displaySize.x;
                    int previewHeight = displaySize.x * 16/9;
                    log("preview size: " + previewWidth + "x" + previewHeight);

                    FrameLayout layout = (FrameLayout) webView.getView().getParent();
                    RelativeLayout.LayoutParams previewLayoutParams = new RelativeLayout.LayoutParams(previewWidth, previewHeight);
                    layout.addView(previewSurfaceView, 0, previewLayoutParams);

                    callbackContext.success("Viewfinder view added");
                }
            });
            return true;
        }

        if ("hideViewfinder".equals(action)) {
            this.cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    FrameLayout layout = (FrameLayout) webView.getView().getParent();
                    layout.removeView(previewSurfaceView);
                    callbackContext.success("Viewfinder view removed");
                }
            });
            return true;
        }

        if ("setCustomData".equals(action)) {
            final String customData = args.getString(0);
            this.cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mBroadcaster.setCustomData(customData);
                    callbackContext.success("Custom data updated");
                }
            });
            return true;
        }

        if ("setPrivateMode".equals(action)) {
            final boolean value = args.getBoolean(0);
            this.cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mBroadcaster.setPrivateMode(value);
                    callbackContext.success(value ? "Private mode enabled" : "Private mode disabled");
                }
            });
            return true;
        }

        if ("setSendPosition".equals(action)) {
            final boolean value = args.getBoolean(0);
            this.cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mBroadcaster.setSendPosition(value);
                    callbackContext.success(value ? "Positioning enabled" : "Positioning disabled");
                }
            });
            return true;
        }

        if ("setTitle".equals(action)) {
            final String title = args.getString(0);
            this.cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mBroadcaster.setTitle(title);
                    callbackContext.success("Broadcast title updated");
                }
            });
            return true;
        }

        if ("setVideoQualityPreset".equals(action)) {
            final String preset = args.getString(0);
            this.cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (Objects.equals("auto", preset)) {
                        mBroadcaster.useAutomaticResolutionSwitching();
                        callbackContext.success("Switched to video quality preset '" + preset + "'");
                        return;
                    }
                    callbackContext.error("Unknown video quality preset " + preset);
                }
            });
            return true;
        }

        if ("startBroadcast".equals(action)) {
            final String username = args.getString(0);
            final String password = args.getString(1);
            this.cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (!mBroadcaster.canStartBroadcasting()) {
                        log("Cannot start broadcasting, ignoring start request");
                        callbackContext.error("Cannot start broadcasting, ignoring start request");
                        return;
                    }
                    if (hasPermission(permission.CAMERA) && hasPermission(permission.RECORD_AUDIO)) {
                        // lockCurrentOrientation();
                        // initLocalRecording();
                        log("Starting broadcast");
                        mBroadcaster.startBroadcast(username, password);
                        callbackContext.success("Broadcast starting");
                    } else {
                        log("Insufficient permissions to broadcast, requesting permissions");
                        List<String> permissions = new ArrayList<String>();
                        if (!hasPermission(permission.CAMERA)) {
                            permissions.add(permission.CAMERA);
                        }
                        if (!hasPermission(permission.RECORD_AUDIO)) {
                            permissions.add(permission.RECORD_AUDIO);
                        }
                        if (!hasPermission(permission.WRITE_EXTERNAL_STORAGE)) {
                            permissions.add(permission.WRITE_EXTERNAL_STORAGE);
                        }
                        requestPermissions(permissions, BROADCAST_PERMISSIONS_CODE);
                        callbackContext.error("Requesting permissions");
                    }
                }
            });
            return true;
        }

        if ("stopBroadcast".equals(action)) {
            this.cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mBroadcaster.stopBroadcast();
                    callbackContext.success("Broadcast stopped");
                }
            });
            return true;
        }

        if ("switchCamera".equals(action)) {
            this.cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mBroadcaster.switchCamera();
                    callbackContext.success("Camera switch requested");
                }
            });
            return true;
        }

        if ("onConnectionStatusChange".equals(action)) {
            this.cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    self.onConnectionStatusChangeCallbackContext = callbackContext;
                }
            });
            return true;
        }

        return false;
    }

    /**
     * Called when the system is about to start resuming a previous activity.
     */
    @Override
    public void onPause(boolean multitasking) {
        // mOrientationListener.disable();
        mBroadcaster.onActivityPause();
    }

    /**
     * Called when the activity will start interacting with the user.
     */
    @Override
    public void onResume(boolean multitasking) {
        // mOrientationListener.enable();
        mBroadcaster.setRotation(mDefaultDisplay.getRotation());
        mBroadcaster.onActivityResume();
    }

    /**
     * Called when the activity is becoming visible to the user.
     */
    @Override
    public void onStart() {
    }

    /**
     * Called when the activity is no longer visible to the user.
     */
    @Override
    public void onStop() {
    }

    /**
     * The final call you receive before your activity is destroyed.
     */
    @Override
    public void onDestroy() {
        mBroadcaster.onActivityDestroy();
    }

    /**
     * Called when the WebView does a top-level navigation or refreshes.
     *
     * Plugins should stop any long-running processes and clean up internal state.
     *
     * Does nothing by default.
     */
    @Override
    public void onReset() {
    }



    /**
     * Broadcaster.Observer protocol
     */

    @Override
    public void onConnectionStatusChange(final BroadcastStatus status) {
        if (status == BroadcastStatus.STARTING) {
            log("BroadcastStatus.STARTING");
            this.cordova.getActivity().getWindow().addFlags(FLAG_KEEP_SCREEN_ON);
        }
        if (status == BroadcastStatus.IDLE) {
            log("BroadcastStatus.IDLE");
            this.cordova.getActivity().getWindow().clearFlags(FLAG_KEEP_SCREEN_ON);
            // setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        }
        // mBroadcastButton.setText(status == BroadcastStatus.IDLE ? "Broadcast" : "Disconnect");
        // mSwitchButton.setEnabled(status == BroadcastStatus.IDLE);

        if (this.onConnectionStatusChangeCallbackContext != null) {
            PluginResult result = new PluginResult(PluginResult.Status.OK, status.name().toLowerCase());
            result.setKeepCallback(true);
            this.onConnectionStatusChangeCallbackContext.sendPluginResult(result);
        }
    }

    @Override
    public void onStreamHealthUpdate(final int health) {
    }

    @Override
    public void onConnectionError(final ConnectionError type, final String message) {
        String str = type.toString();
        if (message != null) {
            str += " " + message;
        }
        displayToast(str);
    }

    @Override
    public void onCameraError(final CameraError error) {
        displayToast(error.toString());
    }

    @Override
    public void onChatMessage(final String message) {
    }

    @Override
    public void onResolutionsScanned() {
    }

    @Override
    public void onCameraPreviewStateChanged() {
    }

    @Override
    public void onBroadcastInfoAvailable(String videoId, String url) {
        log("Broadcast with id " + videoId + " published");
    }

    @Override
    public void onBroadcastIdAvailable(String broadcastId) {
        log("Broadcast with broadcastId " + broadcastId + " published");
    }

    /**
     * Private methods
     */
    private boolean hasPermission(String permission) {
        try {
            int result = (Integer) getClass().getMethod("checkSelfPermission", String.class).invoke(this, permission);
            return result == PackageManager.PERMISSION_GRANTED;
        } catch (Exception e) {}
        return true;
    }

    private void requestPermissions(List<String> missingPermissions, int code) {
        mInPermissionRequest = true;
        String[] permissions = missingPermissions.toArray(new String[missingPermissions.size()]);
        try {
            getClass().getMethod("requestPermissions", String[].class, Integer.TYPE).invoke(this, permissions, code);
        } catch (Exception e) {}
    }

    private void displayToast(final String text) {
        Toast.makeText(this.cordova.getActivity().getApplicationContext(), text, Toast.LENGTH_LONG).show();
    }

    private void log(final String text) {
        log(text, false);
    }

    private void log(final String text, boolean toast) {
        Log.v(LOG_PREFIX, text);
        if (toast) displayToast(text);
    }

    private boolean mInPermissionRequest = false;
    private Display mDefaultDisplay;
    // private OrientationEventListener mOrientationListener;
    private Broadcaster mBroadcaster;
}
