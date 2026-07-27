"""Weakest-Node Selector & Learning Stage State Machine.

Manages the 5-stage concept learning loop:
UNSEEN -> LEARNING -> GUIDED_PRACTICE -> INDEPENDENT_PRACTICE -> MASTERED

Transitions:
- UNSEEN -> LEARNING: Triggered when student first arrives at an unlocked node.
- LEARNING -> GUIDED_PRACTICE: Triggered after viewing micro-lesson.
- GUIDED_PRACTICE -> INDEPENDENT_PRACTICE: Triggered after 1-2 guided practice attempts.
- INDEPENDENT_PRACTICE -> LEARNING: Triggered if student makes 2 consecutive errors with 'conceptual_gap'.
- INDEPENDENT_PRACTICE -> MASTERED: Triggered when BKT p_mastery >= 0.85.
"""

MASTERY_THRESHOLD = 0.6
MASTERED_THRESHOLD = 0.85

def _extract_mastery_and_stage(state_info) -> tuple[float, str]:
    """Helper to handle both float values and dict state objects gracefully."""
    if isinstance(state_info, dict):
        p_mastery = state_info.get("p_mastery", 0.3)
        stage = state_info.get("stage", "UNSEEN")
    elif isinstance(state_info, (float, int)):
        p_mastery = float(state_info)
        stage = "MASTERED" if p_mastery >= MASTERED_THRESHOLD else "INDEPENDENT_PRACTICE"
    else:
        p_mastery = 0.3
        stage = "UNSEEN"
    return p_mastery, stage

def get_unlocked_concepts(concepts: list[dict], edges: list[dict], mastery_states: dict) -> list[str]:
    """Finds concept IDs where all prerequisites have mastery >= MASTERY_THRESHOLD."""
    prereqs = {c["id"]: [] for c in concepts}
    for edge in edges:
        source = edge["source"]
        target = edge["target"]
        if target in prereqs:
            prereqs[target].append(source)
            
    unlocked = []
    for concept in concepts:
        cid = concept["id"]
        state_info = mastery_states.get(cid)
        p_mastery, stage = _extract_mastery_and_stage(state_info)
        
        # Skip if already fully mastered
        if stage == "MASTERED" or p_mastery >= MASTERED_THRESHOLD:
            continue
            
        # Check prerequisites
        can_unlock = True
        for p in prereqs[cid]:
            p_state = mastery_states.get(p)
            p_val, _ = _extract_mastery_and_stage(p_state)
            if p_val < MASTERY_THRESHOLD:
                can_unlock = False
                break
                
        if can_unlock:
            unlocked.append(cid)
            
    return unlocked

def select_next_concept(
    concepts: list[dict],
    edges: list[dict], 
    mastery_states: dict
) -> str | None:
    """Selects the weakest unlocked concept ID."""
    unlocked = get_unlocked_concepts(concepts, edges, mastery_states)
    if not unlocked:
        return None
        
    def _get_p(cid):
        p, _ = _extract_mastery_and_stage(mastery_states.get(cid))
        return p

    return min(unlocked, key=_get_p)

def next_action(
    concepts: list[dict],
    edges: list[dict],
    mastery_states: dict
) -> dict:
    """Determines the appropriate action for the student:
    
    Returns:
    - {"action": "TEACH", "concept_id": cid, "stage": "UNSEEN"}
    - {"action": "GUIDED_QUESTION", "concept_id": cid, "stage": "GUIDED_PRACTICE"}
    - {"action": "QUESTION", "concept_id": cid, "stage": "INDEPENDENT_PRACTICE"}
    - {"complete": True, "message": "..."}
    """
    target_id = select_next_concept(concepts, edges, mastery_states)
    if not target_id:
        return {"complete": True, "message": "All concepts in this knowledge map have been mastered!"}

    state_info = mastery_states.get(target_id)
    _, stage = _extract_mastery_and_stage(state_info)

    last_error = state_info.get("last_error_type") if isinstance(state_info, dict) else None

    if stage in ("UNSEEN", "LEARNING"):
        return {
            "action": "TEACH",
            "concept_id": target_id,
            "stage": stage,
            "last_error_type": last_error
        }
    elif stage == "GUIDED_PRACTICE":
        return {
            "action": "GUIDED_QUESTION",
            "concept_id": target_id,
            "stage": stage
        }
    else:
        # INDEPENDENT_PRACTICE
        return {
            "action": "QUESTION",
            "concept_id": target_id,
            "stage": stage
        }
