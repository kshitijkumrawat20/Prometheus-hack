import hashlib
import secrets

def hash_password(password: str) -> str:
    """Hashes a password using PBKDF2-HMAC-SHA256 with a random salt."""
    salt = secrets.token_hex(16)
    pw_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return f"{salt}${pw_hash}"

def verify_password(stored_password: str, provided_password: str) -> bool:
    """Verifies a stored salted password against a provided candidate password."""
    try:
        salt, stored_hash = stored_password.split('$')
        candidate_hash = hashlib.pbkdf2_hmac(
            'sha256',
            provided_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return secrets.compare_digest(stored_hash, candidate_hash)
    except Exception:
        return False

def generate_session_token() -> str:
    """Generates a secure 32-byte session token."""
    return secrets.token_urlsafe(32)
