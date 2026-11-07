package com.amrsherif.thinkingenglish;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;

@CapacitorPlugin(name = "OfflineSTT")
public class OfflineSTTPlugin extends Plugin {

    @PluginMethod
    public void init(PluginCall call) {
        // Mock init to prevent crashes since we don't have the actual Vosk model ZIP downloaded
        call.resolve();
    }

    @PluginMethod
    public void startListening(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("status", "started");
        call.resolve(ret);
    }

    @PluginMethod
    public void stopListening(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("status", "stopped");
        call.resolve(ret);
    }
}
