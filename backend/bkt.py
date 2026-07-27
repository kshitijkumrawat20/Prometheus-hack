"""Bayesian Knowledge Tracing (BKT) Engine.

Implements the standard 4-parameter BKT model for tracking student mastery
of individual concepts. This is the algorithmic heart of MasteryMap — real
statistical inference, not just prompting an LLM.

The four parameters per concept:
- p_init: Prior probability the student already knows the concept
- p_transit: Probability of learning after one practice opportunity  
- p_slip: Probability a knowledgeable student answers incorrectly
- p_guess: Probability an unknowing student answers correctly
"""
import numpy as np
from pydantic import BaseModel

class BKTParams(BaseModel):
    p_init: float = 0.3
    p_transit: float = 0.15
    p_slip: float = 0.1
    p_guess: float = 0.2

def update_mastery(p_mastery: float, correct: bool, params: BKTParams = None) -> float:
    """Update mastery probability after observing an answer.
    
    Uses Bayes' theorem to compute posterior probability of mastery given
    the observed response (correct/incorrect), then applies the learning
    transition to account for the possibility that the student learned
    from the attempt itself.
    
    Args:
        p_mastery: Current probability of mastery (0-1)
        correct: Whether the student answered correctly
        params: BKT parameters (uses defaults if not provided)
    
    Returns:
        Updated probability of mastery (0-1)
    """
    if params is None:
        params = BKTParams()
    
    p_correct_given_know = 1.0 - params.p_slip
    p_correct_given_not = params.p_guess
    
    # Bayesian update
    if correct:
        p_know_post = (p_mastery * p_correct_given_know) / \
                      (p_mastery * p_correct_given_know + (1.0 - p_mastery) * p_correct_given_not)
    else:
        p_know_post = (p_mastery * params.p_slip) / \
                      (p_mastery * params.p_slip + (1.0 - p_mastery) * (1.0 - params.p_guess))
    
    # Learning transition
    p_mastery_new = p_know_post + (1.0 - p_know_post) * params.p_transit
    
    return float(np.clip(p_mastery_new, 0.0, 1.0))


def get_mastery_level(p_mastery: float) -> str:
    """Returns a categorical mastery level based on probability thresholds."""
    if p_mastery < 0.4:
        return "novice"
    elif p_mastery < 0.7:
        return "developing"
    elif p_mastery < 0.9:
        return "proficient"
    else:
        return "mastered"

def predict_correct_probability(p_mastery: float, params: BKTParams = None) -> float:
    """Returns the probability that the student will answer correctly."""
    if params is None:
        params = BKTParams()
    
    p_correct = p_mastery * (1.0 - params.p_slip) + (1.0 - p_mastery) * params.p_guess
    return float(np.clip(p_correct, 0.0, 1.0))
