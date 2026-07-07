import jwt
import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

from app.config import settings
from app.integrations.activepieces import ActivepiecesAdapter


@pytest.fixture
def rsa_keypair():
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    priv = key.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.PKCS8,
        serialization.NoEncryption(),
    ).decode()
    pub = key.public_key().public_bytes(
        serialization.Encoding.PEM,
        serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode()
    return priv, pub


def test_mints_valid_rs256_jwt(monkeypatch, rsa_keypair):
    priv, pub = rsa_keypair
    monkeypatch.setattr(settings, "activepieces_url", "http://localhost:8080")
    monkeypatch.setattr(settings, "activepieces_embed_mode", "sdk")
    monkeypatch.setattr(settings, "activepieces_signing_key_id", "kid-123")
    monkeypatch.setattr(settings, "activepieces_private_key", priv)
    monkeypatch.setattr(settings, "activepieces_project_id", "agentegration")

    adapter = ActivepiecesAdapter()
    assert adapter.enabled

    session = adapter.get_embed_session("user-42")
    assert session.kind == "sdk"
    token = session.sdk["jwtToken"]

    header = jwt.get_unverified_header(token)
    assert header["alg"] == "RS256"
    assert header["kid"] == "kid-123"

    claims = jwt.decode(token, pub, algorithms=["RS256"])
    assert claims["version"] == "v3"
    assert claims["externalUserId"] == "user-42"
    assert claims["externalProjectId"] == "agentegration"
    assert claims["role"] == "EDITOR"
