import pytest
from selector import select_next_concept

def test_selects_lowest_mastery():
    concepts = [
        {"id": "a", "label": "A"},
        {"id": "b", "label": "B"}
    ]
    edges = []
    mastery = {"a": 0.5, "b": 0.4}
    
    selected = select_next_concept(concepts, edges, mastery)
    assert selected == "b"

def test_respects_prerequisites():
    concepts = [
        {"id": "a", "label": "A"},
        {"id": "b", "label": "B"}
    ]
    edges = [{"source": "a", "target": "b"}]
    # 'a' is not mastered enough (< 0.6)
    mastery = {"a": 0.5, "b": 0.0}
    
    selected = select_next_concept(concepts, edges, mastery)
    assert selected == "a" # 'b' is locked, must do 'a'

def test_returns_none_when_all_mastered():
    concepts = [
        {"id": "a", "label": "A"},
        {"id": "b", "label": "B"}
    ]
    edges = [{"source": "a", "target": "b"}]
    mastery = {"a": 0.9, "b": 0.9}
    
    selected = select_next_concept(concepts, edges, mastery)
    assert selected is None

def test_linear_chain():
    concepts = [
        {"id": "a", "label": "A"},
        {"id": "b", "label": "B"},
        {"id": "c", "label": "C"}
    ]
    edges = [
        {"source": "a", "target": "b"},
        {"source": "b", "target": "c"}
    ]
    # A is mastered, B is not, C is not
    mastery = {"a": 0.9, "b": 0.3, "c": 0.1}
    
    selected = select_next_concept(concepts, edges, mastery)
    # A is mastered, so B is unlocked. C is locked because B is not mastered.
    assert selected == "b"
