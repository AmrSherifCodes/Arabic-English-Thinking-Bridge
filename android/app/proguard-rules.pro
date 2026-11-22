# Capacitor Core & Plugin Annotations
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keep @com.getcapacitor.Plugin class * { *; }
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod <methods>;
}

# Official & Community Capacitor Plugins (StatusBar, TextToSpeech, SpeechRecognition, etc.)
-keep class com.capacitorjs.plugins.** { *; }
-keep class com.getcapacitor.community.tts.** { *; }
-keep class com.getcapacitor.community.speechrecognition.** { *; }
-keep class com.chefmate.plugins.gemma3n.** { *; }

# App Native Classes & Local Plugins
-keep class com.amrsherif.thinkingenglish.** { *; }

-dontwarn java.awt.**
-dontwarn com.google.errorprone.annotations.**
