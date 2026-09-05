import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_auth_pact_contract_shape():
    pact = json.loads((ROOT / "tests" / "pact" / "auth-me.json").read_text())
    assert pact["consumer"]["name"] == "QuantovestAdmin"
    assert pact["provider"]["name"] == "QuantovestAuth"
    assert len(pact["interactions"]) == 1
    interaction = pact["interactions"][0]
    assert interaction["request"] == {
        "method": "GET",
        "path": "/api/auth/me",
        "headers": {"Accept": "application/json"},
    }
    assert interaction["response"]["status"] == 401
