package com.primi.tirereceiving;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import org.json.JSONObject;

public class MainActivity extends Activity {
    private static final String APP_HOST = "app.tirereceiving.local";
    private static final String APP_URL = "https://" + APP_HOST + "/index.html";
    private static final int EXPORT = 10;
    private static final int IMPORT = 11;
    private static final int MAX_BYTES = 20 * 1024 * 1024;
    private static final String TEMP_EXPORT = "pending-export.json";

    private WebView web;
    private String pendingExport;

    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(243, 241, 235));

        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

        web.addJavascriptInterface(new Bridge(), "TireNative");
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return true;
            }

            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (!"https".equals(uri.getScheme()) || !APP_HOST.equals(uri.getHost())) return blocked();
                String path = uri.getPath();
                path = path == null || path.equals("/") ? "index.html" : path.substring(1);
                if (path.contains("..") || !path.matches("[a-zA-Z0-9._/-]+")) return blocked();
                try {
                    return new WebResourceResponse(mimeType(path), "UTF-8", getAssets().open(path));
                } catch (IOException error) {
                    return blocked();
                }
            }
        });

        setContentView(web);
        web.setOnApplyWindowInsetsListener((view, insets) -> {
            view.setPadding(
                insets.getSystemWindowInsetLeft(),
                insets.getSystemWindowInsetTop(),
                insets.getSystemWindowInsetRight(),
                insets.getSystemWindowInsetBottom()
            );
            return insets.consumeSystemWindowInsets();
        });
        web.loadUrl(APP_URL);
    }

    private WebResourceResponse blocked() {
        return new WebResourceResponse("text/plain", "UTF-8", new ByteArrayInputStream(new byte[0]));
    }

    private String mimeType(String path) {
        String lower = path.toLowerCase(Locale.US);
        if (lower.endsWith(".js")) return "application/javascript";
        if (lower.endsWith(".css")) return "text/css";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".webmanifest")) return "application/manifest+json";
        if (lower.endsWith(".json")) return "application/json";
        return "text/html";
    }

    private String read(InputStream stream) throws IOException {
        if (stream == null) throw new FileNotFoundException();
        try (InputStream input = stream; ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192];
            int count;
            while ((count = input.read(buffer)) != -1) {
                if (output.size() + count > MAX_BYTES) throw new IOException("File too large");
                output.write(buffer, 0, count);
            }
            return output.toString("UTF-8");
        }
    }

    private void message(String text) {
        runOnUiThread(() -> Toast.makeText(this, text, Toast.LENGTH_LONG).show());
    }

    public class Bridge {
        @JavascriptInterface public void copy(String text) {
            runOnUiThread(() -> {
                ClipboardManager clipboard = (ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
                clipboard.setPrimaryClip(ClipData.newPlainText("Tire receiving check", text));
                message("검수 기록을 복사했습니다.");
            });
        }

        @JavascriptInterface public void exportFile(String name, String mime, String text) {
            runOnUiThread(() -> {
                try {
                    byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
                    if (bytes.length > MAX_BYTES) throw new IOException("File too large");
                    new JSONObject(text);
                    try (FileOutputStream output = openFileOutput(TEMP_EXPORT, MODE_PRIVATE)) {
                        output.write(bytes);
                    }
                    pendingExport = text;
                    Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT)
                        .addCategory(Intent.CATEGORY_OPENABLE)
                        .setType(mime)
                        .putExtra(Intent.EXTRA_TITLE, name);
                    startActivityForResult(intent, EXPORT);
                } catch (Exception error) {
                    message("백업 파일을 만들지 못했습니다.");
                }
            });
        }

        @JavascriptInterface public void importFile() {
            runOnUiThread(() -> {
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT)
                    .addCategory(Intent.CATEGORY_OPENABLE)
                    .setType("application/json");
                startActivityForResult(intent, IMPORT);
            });
        }
    }

    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (result != RESULT_OK || data == null || data.getData() == null) {
            if (request == EXPORT) clearPendingExport();
            return;
        }
        try {
            if (request == EXPORT) {
                if (pendingExport == null) pendingExport = read(openFileInput(TEMP_EXPORT));
                try (OutputStream output = getContentResolver().openOutputStream(data.getData())) {
                    if (output == null) throw new IOException("Missing output");
                    output.write(pendingExport.getBytes(StandardCharsets.UTF_8));
                }
                clearPendingExport();
                message("백업 파일을 저장했습니다.");
            } else if (request == IMPORT) {
                String json = read(getContentResolver().openInputStream(data.getData()));
                web.evaluateJavascript("window.receiveBackup(" + JSONObject.quote(json) + ")", null);
            }
        } catch (Exception error) {
            Log.w("TireReceiving", "Could not process selected file", error);
            if (request == EXPORT) clearPendingExport();
            message("파일을 처리하지 못했습니다. 파일과 저장 공간을 확인해주세요.");
        }
    }

    private void clearPendingExport() {
        pendingExport = null;
        deleteFile(TEMP_EXPORT);
    }

    @Override public void onBackPressed() {
        web.evaluateJavascript("window.handleAndroidBack ? window.handleAndroidBack() : 'exit'", result -> {
            if ("\"exit\"".equals(result)) finish();
        });
    }

    @Override protected void onDestroy() {
        web.removeJavascriptInterface("TireNative");
        web.destroy();
        super.onDestroy();
    }
}
