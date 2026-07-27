import pytest
from bkt import update_mastery, BKTParams, get_mastery_level, predict_correct_probability

def test_correct_answers_increase_mastery():
    params = BKTParams()
    p_mastery = 0.3
    
    # First correct answer
    p1 = update_mastery(p_mastery, True, params)
    assert p1 > p_mastery
    
    # Second correct answer
    p2 = update_mastery(p1, True, params)
    assert p2 > p1
    
    # Third correct answer
    p3 = update_mastery(p2, True, params)
    assert p3 > p2
    assert p3 > 0.8 # Should be significantly higher

def test_incorrect_answers_decrease_mastery():
    params = BKTParams()
    p_mastery = 0.8
    
    # First incorrect
    p1 = update_mastery(p_mastery, False, params)
    assert p1 < p_mastery
    
    # Second incorrect
    p2 = update_mastery(p1, False, params)
    assert p2 < p1
    assert p2 < 0.5 # Should drop significantly

def test_mastery_bounds():
    p = update_mastery(0.99, True)
    assert p <= 1.0
    
    p = update_mastery(0.01, False)
    assert p >= 0.0

def test_slip_and_guess_effects():
    # If slip is high, correct answers don't prove much
    params_high_slip = BKTParams(p_slip=0.4, p_guess=0.1)
    p_mastery = 0.5
    p_post_slip = update_mastery(p_mastery, True, params_high_slip)
    
    # Normal slip
    params_normal = BKTParams(p_slip=0.1, p_guess=0.1)
    p_post_normal = update_mastery(p_mastery, True, params_normal)
    
    assert p_post_slip < p_post_normal # High slip means less confidence gain

def test_mastery_level_labels():
    assert get_mastery_level(0.2) == "novice"
    assert get_mastery_level(0.5) == "developing"
    assert get_mastery_level(0.8) == "proficient"
    assert get_mastery_level(0.95) == "mastered"

def test_default_params():
    params = BKTParams()
    assert params.p_init == 0.3
    assert params.p_transit == 0.15
    assert params.p_slip == 0.1
    assert params.p_guess == 0.2
    
    p = update_mastery(0.3, True)
    p_explicit = update_mastery(0.3, True, params)
    assert p == p_explicit
