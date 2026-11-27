package com.amrsherif.thinkingenglish;

import android.os.SystemClock;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.mlkit.common.model.DownloadConditions;
import com.google.mlkit.common.model.RemoteModelManager;
import com.google.mlkit.nl.translate.TranslateLanguage;
import com.google.mlkit.nl.translate.TranslateRemoteModel;
import com.google.mlkit.nl.translate.Translation;
import com.google.mlkit.nl.translate.Translator;
import com.google.mlkit.nl.translate.TranslatorOptions;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * LocalTranslatorPlugin
 *
 * 100% On-Device Real-Time Translation powered by Google ML Kit Translate.
 * Each language model (~30 MB) downloads on-demand once to device storage,
 * then translates locally in Airplane Mode with $0 server cost.
 */
@CapacitorPlugin(name = "LocalTranslator")
public class LocalTranslatorPlugin extends Plugin {

    private final Map<String, Translator> translatorCache = new ConcurrentHashMap<>();

    @Nullable
    private String mapToMlKitLanguage(@Nullable String rawCode) {
        if (rawCode == null) return null;
        String code = rawCode.trim().toLowerCase();
        if (code.contains("-") || code.contains("_")) {
            code = code.split("[-_]")[0];
        }
        switch (code) {
            case "ar":
            case "arz":
            case "apc":
            case "afb":
            case "ary":
                return TranslateLanguage.ARABIC;
            case "en":
                return TranslateLanguage.ENGLISH;
            case "de":
                return TranslateLanguage.GERMAN;
            case "es":
                return TranslateLanguage.SPANISH;
            case "it":
                return TranslateLanguage.ITALIAN;
            case "fr":
                return TranslateLanguage.FRENCH;
            default:
                return null;
        }
    }

    private Translator getOrCreateTranslator(@NonNull String sourceLang, @NonNull String targetLang) {
        String key = sourceLang + "->" + targetLang;
        Translator existing = translatorCache.get(key);
        if (existing != null) {
            return existing;
        }
        TranslatorOptions options = new TranslatorOptions.Builder()
            .setSourceLanguage(sourceLang)
            .setTargetLanguage(targetLang)
            .build();
        Translator created = Translation.getClient(options);
        translatorCache.put(key, created);
        return created;
    }

    @PluginMethod
    public void getModelStatus(PluginCall call) {
        String sourceCode = mapToMlKitLanguage(call.getString("sourceLang", "ar"));
        String targetCode = mapToMlKitLanguage(call.getString("targetLang", "en"));

        if (sourceCode == null || targetCode == null) {
            call.reject("Unsupported language pair.");
            return;
        }

        RemoteModelManager modelManager = RemoteModelManager.getInstance();
        TranslateRemoteModel sourceModel = new TranslateRemoteModel.Builder(sourceCode).build();
        TranslateRemoteModel targetModel = new TranslateRemoteModel.Builder(targetCode).build();

        modelManager.isModelDownloaded(sourceModel)
            .addOnSuccessListener(sourceDownloaded ->
                modelManager.isModelDownloaded(targetModel)
                    .addOnSuccessListener(targetDownloaded -> {
                        boolean srcOk = Boolean.TRUE.equals(sourceDownloaded) || TranslateLanguage.ENGLISH.equals(sourceCode);
                        boolean tgtOk = Boolean.TRUE.equals(targetDownloaded) || TranslateLanguage.ENGLISH.equals(targetCode);
                        int missingCount = (srcOk ? 0 : 1) + (tgtOk ? 0 : 1);

                        JSObject ret = new JSObject();
                        ret.put("downloaded", srcOk && tgtOk);
                        ret.put("sourceDownloaded", srcOk);
                        ret.put("targetDownloaded", tgtOk);
                        ret.put("estimatedSizeMb", missingCount * 30);
                        ret.put("sourceLang", sourceCode);
                        ret.put("targetLang", targetCode);
                        call.resolve(ret);
                    })
                    .addOnFailureListener(e -> call.reject("Failed to check target model status: " + e.getMessage()))
            )
            .addOnFailureListener(e -> call.reject("Failed to check source model status: " + e.getMessage()));
    }

    @PluginMethod
    public void downloadModel(PluginCall call) {
        String sourceCode = mapToMlKitLanguage(call.getString("sourceLang", "ar"));
        String targetCode = mapToMlKitLanguage(call.getString("targetLang", "en"));

        if (sourceCode == null || targetCode == null) {
            call.reject("Unsupported language pair.");
            return;
        }

        long startedAt = SystemClock.elapsedRealtime();
        Translator translator = getOrCreateTranslator(sourceCode, targetCode);

        // Allow both Wi-Fi and cellular so travelers can download models anywhere
        DownloadConditions conditions = new DownloadConditions.Builder().build();

        JSObject progressStart = new JSObject();
        progressStart.put("status", "downloading");
        progressStart.put("sourceLang", sourceCode);
        progressStart.put("targetLang", targetCode);
        notifyListeners("downloadProgress", progressStart);

        translator.downloadModelIfNeeded(conditions)
            .addOnSuccessListener(unused -> {
                long durationMs = SystemClock.elapsedRealtime() - startedAt;
                JSObject progressDone = new JSObject();
                progressDone.put("status", "ready");
                progressDone.put("sourceLang", sourceCode);
                progressDone.put("targetLang", targetCode);
                notifyListeners("downloadProgress", progressDone);

                JSObject ret = new JSObject();
                ret.put("downloaded", true);
                ret.put("sourceLang", sourceCode);
                ret.put("targetLang", targetCode);
                ret.put("durationMs", durationMs);
                call.resolve(ret);
            })
            .addOnFailureListener(e -> call.reject("Failed to download offline model: " + e.getMessage()));
    }

    @PluginMethod
    public void translate(PluginCall call) {
        String text = call.getString("text", "");
        String sourceCode = mapToMlKitLanguage(call.getString("sourceLang", "ar"));
        String targetCode = mapToMlKitLanguage(call.getString("targetLang", "en"));

        if (text == null || text.trim().isEmpty()) {
            JSObject empty = new JSObject();
            empty.put("translatedText", "");
            empty.put("latencyMs", 0);
            empty.put("engine", "mlkit-offline");
            call.resolve(empty);
            return;
        }

        if (sourceCode == null || targetCode == null) {
            call.reject("Unsupported language pair.");
            return;
        }

        if (sourceCode.equals(targetCode)) {
            JSObject same = new JSObject();
            same.put("translatedText", text.trim());
            same.put("latencyMs", 0);
            same.put("engine", "mlkit-offline");
            call.resolve(same);
            return;
        }

        long startedAt = SystemClock.elapsedRealtime();
        Translator translator = getOrCreateTranslator(sourceCode, targetCode);

        translator.translate(text.trim())
            .addOnSuccessListener(translatedText -> {
                long latencyMs = SystemClock.elapsedRealtime() - startedAt;
                JSObject ret = new JSObject();
                ret.put("translatedText", translatedText);
                ret.put("latencyMs", latencyMs);
                ret.put("engine", "mlkit-offline");
                call.resolve(ret);
            })
            .addOnFailureListener(e -> call.reject("On-device translation failed (download model first): " + e.getMessage()));
    }

    @PluginMethod
    public void deleteModel(PluginCall call) {
        String langCode = mapToMlKitLanguage(call.getString("lang", ""));
        if (langCode == null) {
            call.reject("Unsupported language code.");
            return;
        }

        // Close any cached translators involving this language
        for (Map.Entry<String, Translator> entry : translatorCache.entrySet()) {
            if (entry.getKey().contains(langCode)) {
                try {
                    entry.getValue().close();
                } catch (Exception ignored) {
                }
                translatorCache.remove(entry.getKey());
            }
        }

        TranslateRemoteModel model = new TranslateRemoteModel.Builder(langCode).build();
        RemoteModelManager.getInstance()
            .deleteDownloadedModel(model)
            .addOnSuccessListener(unused -> {
                JSObject ret = new JSObject();
                ret.put("deleted", true);
                ret.put("lang", langCode);
                call.resolve(ret);
            })
            .addOnFailureListener(e -> call.reject("Failed to delete model: " + e.getMessage()));
    }

    @Override
    protected void handleOnDestroy() {
        for (Translator translator : translatorCache.values()) {
            try {
                translator.close();
            } catch (Exception ignored) {
            }
        }
        translatorCache.clear();
        super.handleOnDestroy();
    }
}
