#!/usr/bin/env python3
"""
Automated script to upload Malayalam Speech Studio models to Hugging Face Hub.
Requires: pip install huggingface_hub
Usage:
    python3 scripts/upload_to_hf.py [--include-llm] [--include-llm-1-5b]
"""

import argparse
import os
import sys
import tarfile
from pathlib import Path

try:
    from huggingface_hub import HfApi, create_repo, hf_hub_download
except ImportError:
    print("Error: huggingface_hub is not installed.")
    print("Run: pip install huggingface_hub")
    sys.exit(1)

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent


def prepare_espeak_archive(tts_dir: Path) -> Path:
    archive_path = tts_dir / "espeak-ng-data.tar.bz2"
    espeak_dir = tts_dir / "espeak-ng-data"

    if archive_path.exists():
        print(f"Using existing archive: {archive_path.name}")
        return archive_path

    if not espeak_dir.exists():
        return archive_path

    print("Compressing espeak-ng-data into espeak-ng-data.tar.bz2...")
    with tarfile.open(archive_path, "w:bz2") as tar:
        tar.add(espeak_dir, arcname="espeak-ng-data")
    print(f"Created {archive_path.name} ({archive_path.stat().st_size / 1024 / 1024:.1f} MB)")
    return archive_path


def upload_models(repo_id: str, token: str, models_dir: Path, include_llm: bool = False, include_llm_1_5b: bool = False):
    api = HfApi(token=token)

    print(f"Ensuring repository exists: {repo_id}")
    create_repo(repo_id=repo_id, token=token, repo_type="model", exist_ok=True)

    tts_dir = models_dir / "vits-piper-ml_IN-meera-medium"
    prepare_espeak_archive(tts_dir)

    files_to_upload = [
        # STT Files
        (
            models_dir / "model.int8.onnx",
            "stt/sherpa-onnx-indic-conformer-ml/model.int8.onnx",
        ),
        (
            models_dir / "tokens.txt",
            "stt/sherpa-onnx-indic-conformer-ml/tokens.txt",
        ),
        # TTS Files
        (
            tts_dir / "ml_IN-meera-medium.onnx",
            "tts/vits-piper-ml_IN-meera-medium/ml_IN-meera-medium.onnx",
        ),
        (
            tts_dir / "ml_IN-meera-medium.onnx.json",
            "tts/vits-piper-ml_IN-meera-medium/ml_IN-meera-medium.onnx.json",
        ),
        (
            tts_dir / "tokens.txt",
            "tts/vits-piper-ml_IN-meera-medium/tokens.txt",
        ),
        (
            tts_dir / "espeak-ng-data.tar.bz2",
            "tts/vits-piper-ml_IN-meera-medium/espeak-ng-data.tar.bz2",
        ),
    ]

    for local_path, path_in_repo in files_to_upload:
        if not local_path.exists():
            print(f"Skipping missing file: {local_path}")
            continue

        size_mb = local_path.stat().st_size / 1024 / 1024
        print(f"Uploading {local_path.name} ({size_mb:.1f} MB) -> {path_in_repo} ...")
        api.upload_file(
            path_or_fileobj=str(local_path),
            path_in_repo=path_in_repo,
            repo_id=repo_id,
            repo_type="model",
        )
        print(f"Successfully uploaded: {path_in_repo}")

    # Optional LLM Mirroring into user's own repository
    if include_llm:
        print("\nFetching Qwen 2.5 0.5B Instruct GGUF from upstream repo...")
        llm_05b_path = hf_hub_download(
            repo_id="Qwen/Qwen2.5-0.5B-Instruct-GGUF",
            filename="qwen2.5-0.5b-instruct-q4_k_m.gguf",
        )
        print(f"Uploading Qwen 0.5B GGUF (~468 MB) -> llm/qwen2.5-0.5b-instruct-q4_k_m.gguf ...")
        api.upload_file(
            path_or_fileobj=llm_05b_path,
            path_in_repo="llm/qwen2.5-0.5b-instruct-q4_k_m.gguf",
            repo_id=repo_id,
            repo_type="model",
        )
        print("Successfully uploaded: llm/qwen2.5-0.5b-instruct-q4_k_m.gguf")

    if include_llm_1_5b:
        print("\nFetching Qwen 2.5 1.5B Instruct GGUF from upstream repo...")
        llm_15b_path = hf_hub_download(
            repo_id="Qwen/Qwen2.5-1.5B-Instruct-GGUF",
            filename="qwen2.5-1.5b-instruct-q4_k_m.gguf",
        )
        print(f"Uploading Qwen 1.5B GGUF (~1.04 GB) -> llm/qwen2.5-1.5b-instruct-q4_k_m.gguf ...")
        api.upload_file(
            path_or_fileobj=llm_15b_path,
            path_in_repo="llm/qwen2.5-1.5b-instruct-q4_k_m.gguf",
            repo_id=repo_id,
            repo_type="model",
        )
        print("Successfully uploaded: llm/qwen2.5-1.5b-instruct-q4_k_m.gguf")

    print("\nAll models uploaded successfully!")
    print(f"Repository URL: https://huggingface.co/{repo_id}")


def load_env_file():
    env_file = WORKSPACE_ROOT / ".env"
    if not env_file.exists():
        return
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            if k not in os.environ:
                os.environ[k] = v


def main():
    load_env_file()

    parser = argparse.ArgumentParser(description="Upload models to Hugging Face")
    parser.add_argument(
        "--repo-id",
        default=os.environ.get("HF_REPO_ID", ""),
        help="Target Hugging Face repository ID (default: read from HF_REPO_ID in .env)",
    )
    parser.add_argument(
        "--token",
        default=os.environ.get("HF_TOKEN", ""),
        help="Hugging Face Access Token (default: read from HF_TOKEN in .env)",
    )
    parser.add_argument(
        "--models-dir",
        default=str(WORKSPACE_ROOT / "src" / "models"),
        help="Path to local models directory if uploading from local disk",
    )
    parser.add_argument(
        "--include-llm",
        action="store_true",
        help="Download and upload Qwen 2.5 0.5B GGUF model (~468 MB) to your repo",
    )
    parser.add_argument(
        "--include-llm-1-5b",
        action="store_true",
        help="Download and upload Qwen 2.5 1.5B GGUF model (~1.04 GB) to your repo",
    )

    args = parser.parse_args()

    if not args.token:
        print("Error: Hugging Face token is required.")
        print("Generate a token at: https://huggingface.co/settings/tokens (Role: Write)")
        print("Place it in .env (HF_TOKEN='...') or pass via --token")
        sys.exit(1)

    models_path = Path(args.models_dir)
    upload_models(args.repo_id, args.token, models_path, args.include_llm, args.include_llm_1_5b)


if __name__ == "__main__":
    main()
