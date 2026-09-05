import json
import os
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
PROMPT = """You are a senior QA engineer reviewing the Quantovest Capital web application.
Create a concise exploratory test plan focused on authentication, 2FA, admin authorization,
email confirmation, daily ROI workflows, and mobile usability. Use the supplied API contract
and source hints. Do not invent credentials, do not perform destructive actions, and label any
workflow that requires a real authenticated account as manual-only. Return Markdown with:
1. high-risk scenarios, 2. happy-path scenarios, 3. edge cases, 4. evidence to collect, and
5. release-blocking findings to watch for.

API contract:
"""


def main() -> None:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("OPENAI_API_KEY is not configured; exploratory planning is skipped.")
        return
    spec = (ROOT / "tests" / "openapi.yaml").read_text()
    payload = {
        "model": os.getenv("OPENAI_MODEL", "gpt-5-mini"),
        "messages": [
            {"role": "system", "content": "You produce practical, security-conscious QA plans."},
            {"role": "user", "content": PROMPT + spec},
        ],
        "max_completion_tokens": 1800,
    }
    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    response = requests.post(
        f"{base_url}/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json=payload,
        timeout=60,
    )
    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]
    output = ROOT / "artifacts" / "exploratory-test-plan.md"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(content.strip() + "\n")
    print(json.dumps({"output": str(output), "model": payload["model"]}))


if __name__ == "__main__":
    main()
