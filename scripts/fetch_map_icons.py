from pathlib import Path
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[1] / "images" / "icons"
ROOT.mkdir(parents=True, exist_ok=True)
HEADERS = {"User-Agent": "Mozilla/5.0"}

APPS = {
    "navermap.png": "com.nhn.android.nmap",
    "kakaomap.png": "net.daum.android.map",
}


def download(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        dest.write_bytes(resp.read())


def fetch_play_icon(package: str, dest: Path) -> None:
    url = f"https://play.google.com/store/apps/details?id={package}&hl=ko"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        html = resp.read().decode("utf-8", "ignore")
    match = re.search(r"https://play-lh\.googleusercontent\.com/[^\"']+", html)
    if not match:
        raise RuntimeError(f"Play Store icon not found for {package}")
    download(match.group(0), dest)


if __name__ == "__main__":
    for filename, package in APPS.items():
        fetch_play_icon(package, ROOT / filename)
        print(filename, (ROOT / filename).stat().st_size // 1024, "KB")
