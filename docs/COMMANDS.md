# Developer Commands

## 1. Device Management & ADB

### Wipe App Data

```bash
adb shell pm clear com.anonymous.aicallerapp
```

### Uninstall App

```bash
adb uninstall com.anonymous.aicallerapp
```

### Inspect On-Device Models

```bash
# List all models
adb shell "run-as com.anonymous.aicallerapp ls -la files/models"

# TTS (Piper Meera)
adb shell "run-as com.anonymous.aicallerapp ls -la files/models/vits-piper-ml_IN-meera-medium"

# STT (Conformer)
adb shell "run-as com.anonymous.aicallerapp ls -la files/models/sherpa-onnx-indic-conformer-ml"

# LLM
adb shell "run-as com.anonymous.aicallerapp ls -la files/models/llm"
```

### Stream Runtime Logs

```bash
adb logcat -s ReactNativeJS SherpaOnnx SherpaOnnxTts LlamaRn
```

---

## 2. Build & Run

### Clean Prebuild

```bash
npx expo prebuild --clean
```

### Run Debug (Device / Emulator)

```bash
npx expo run:android
```

### Build Release APK (`assembleRelease`)

```bash
# Via Gradle
./android/gradlew -p android assembleRelease

# Via Expo
npx expo run:android --variant release
```

- Output: `android/app/build/outputs/apk/release/app-release.apk`

### Install Release APK

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### Build App Bundle (`bundleRelease`)

```bash
./android/gradlew -p android bundleRelease
```

- Output: `android/app/build/outputs/bundle/release/app-release.aab`

### Start Metro (Clean Cache)

```bash
npx expo start -c
```

---

## 3. Code Quality & Tests

```bash
# Typecheck
npx tsc --noEmit

# Lint
npm run lint

# Format
npm run format

# Tests
npm test
```

---

## 4. Hugging Face Model Upload

```bash
# STT & TTS
python3 scripts/upload_to_hf.py

# Include LLM (Qwen 2.5 0.5B)
python3 scripts/upload_to_hf.py --include-llm

# Include LLM (Qwen 2.5 1.5B)
python3 scripts/upload_to_hf.py --include-llm-1-5b
```

---

## 5. Troubleshooting

| Issue                                      | Cause                                          | Solution                                                |
| :----------------------------------------- | :--------------------------------------------- | :------------------------------------------------------ |
| **"Incomplete (1 missing)" after rebuild** | `adb install -r` keeps existing device storage | `adb shell pm clear com.anonymous.aicallerapp`          |
| **C++ build is slow (10+ min)**            | Compiling `llama.cpp` & `sherpa-onnx`          | Cached after first build; avoid `--clean` unless needed |
| **`TurboModuleRegistry` missing**          | Running in Expo Go                             | Use `npx expo run:android` (requires native dev build)  |
