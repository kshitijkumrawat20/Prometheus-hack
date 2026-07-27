import pytest
from auth import hash_password, verify_password, generate_session_token

def test_password_hashing_and_verification():
    raw_pw = "SecretStudentPass123!"
    hashed = hash_password(raw_pw)
    
    assert hashed != raw_pw
    assert verify_password(hashed, raw_pw) is True
    assert verify_password(hashed, "WrongPassword") is False

def test_session_token_generation():
    token1 = generate_session_token()
    token2 = generate_session_token()
    
    assert len(token1) >= 32
    assert token1 != token2
