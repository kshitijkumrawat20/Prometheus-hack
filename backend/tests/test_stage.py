import pytest
from selector import next_action

def test_unseen_concept_triggers_teach():
    concepts = [{"id": "algebra.linear", "label": "Linear Equations"}]
    edges = []
    mastery_states = {
        "algebra.linear": {"p_mastery": 0.3, "stage": "UNSEEN"}
    }
    
    action = next_action(concepts, edges, mastery_states)
    assert action["action"] == "TEACH"
    assert action["concept_id"] == "algebra.linear"

def test_guided_practice_stage_triggers_guided_question():
    concepts = [{"id": "algebra.linear", "label": "Linear Equations"}]
    edges = []
    mastery_states = {
        "algebra.linear": {"p_mastery": 0.3, "stage": "GUIDED_PRACTICE"}
    }
    
    action = next_action(concepts, edges, mastery_states)
    assert action["action"] == "GUIDED_QUESTION"
    assert action["concept_id"] == "algebra.linear"

def test_independent_practice_stage_triggers_question():
    concepts = [{"id": "algebra.linear", "label": "Linear Equations"}]
    edges = []
    mastery_states = {
        "algebra.linear": {"p_mastery": 0.5, "stage": "INDEPENDENT_PRACTICE"}
    }
    
    action = next_action(concepts, edges, mastery_states)
    assert action["action"] == "QUESTION"

def test_mastered_concepts_are_skipped():
    concepts = [
        {"id": "algebra.linear", "label": "Linear Equations"},
        {"id": "algebra.quadratic", "label": "Quadratics"}
    ]
    edges = [{"source": "algebra.linear", "target": "algebra.quadratic"}]
    mastery_states = {
        "algebra.linear": {"p_mastery": 0.9, "stage": "MASTERED"},
        "algebra.quadratic": {"p_mastery": 0.3, "stage": "UNSEEN"}
    }
    
    action = next_action(concepts, edges, mastery_states)
    # Since linear is MASTERED, quadratic becomes unlocked and action is TEACH for quadratic
    assert action["action"] == "TEACH"
    assert action["concept_id"] == "algebra.quadratic"
