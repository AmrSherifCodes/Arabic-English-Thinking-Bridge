# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

-keep class com.getcapacitor.** { *; }
-keep class com.google.ai.** { *; }
-keep class capacitor.gemma3n.** { *; }
-keep class com.google.mediapipe.** { *; }
-keepclassmembers class * { @com.getcapacitor.PluginMethod *; }
