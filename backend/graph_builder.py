import json
import logging
import os
from google import genai

logger = logging.getLogger(__name__)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def topological_sort(concepts: list[dict], edges: list[dict]) -> bool:
    """Check if the graph is a Directed Acyclic Graph (DAG) and sortable."""
    in_degree = {c["id"]: 0 for c in concepts}
    adj_list = {c["id"]: [] for c in concepts}

    for edge in edges:
        source = edge["source"]
        target = edge["target"]
        if source in in_degree and target in in_degree:
            adj_list[source].append(target)
            in_degree[target] += 1
    
    queue = [node for node in in_degree if in_degree[node] == 0]
    visited_count = 0

    while queue:
        node = queue.pop(0)
        visited_count += 1
        for neighbor in adj_list[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
                
    return visited_count == len(concepts)

def remove_weakest_cycle_edge(concepts: list[dict], edges: list[dict]) -> list[dict]:
    """Naive approach: remove the last edge causing the cycle by iteratively checking."""
    valid_edges = []
    for edge in edges:
        test_edges = valid_edges + [edge]
        if topological_sort(concepts, test_edges):
            valid_edges.append(edge)
    return valid_edges

def build_concept_graph(syllabus_text: str, graph_id: str) -> dict:
    """Uses Gemini to parse syllabus text into a concept graph."""
    prompt = f"""
    Analyze the following educational syllabus and extract a knowledge graph of 10-20 concepts.
    Output JSON format only. Do not include any markdown formatting or code fences.
    Format:
    {{
      "concepts": [
        {{"id": "dot_separated_snake_case", "label": "Human Readable Label", "description": "Brief explanation"}}
      ],
      "edges": [
        {{"source": "prerequisite_concept_id", "target": "dependent_concept_id"}}
      ]
    }}
    Make sure edges flow from prerequisites to advanced concepts.

    Syllabus text:
    {syllabus_text}
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
    
    content = response.text
    try:
        start_idx = content.find('{')
        end_idx = content.rfind('}') + 1
        json_str = content[start_idx:end_idx]
        graph_data = json.loads(json_str)
    except Exception as e:
        logger.error(f"Failed to parse Gemini output: {content}")
        raise ValueError("Invalid JSON response from Gemini")

    concepts = graph_data.get("concepts", [])
    edges = graph_data.get("edges", [])

    if not topological_sort(concepts, edges):
        logger.warning("Cycle detected in generated graph. Attempting to resolve...")
        edges = remove_weakest_cycle_edge(concepts, edges)

    # Attach graph_id
    for c in concepts:
        c["graph_id"] = graph_id
    for e in edges:
        e["graph_id"] = graph_id

    return {"concepts": concepts, "edges": edges}
