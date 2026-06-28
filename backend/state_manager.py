import uuid
from typing import Optional

_sessions: dict = {}

def create_session(opening_data: dict, player_name: str, image_url: str) -> str:
    session_id = str(uuid.uuid4())
    _sessions[session_id] = {
        "session_id": session_id,
        "player_name": player_name,
        "setting": opening_data["setting"],
        "characters": opening_data["characters"],
        "current_scene": opening_data["opening_scene"],
        "current_choices": opening_data["choices"],
        "choice_history": [],
        "scene_number": 1,
        "is_ending": False,
        "relationship_scores": {},
        "image_url": image_url,
    }
    return session_id

def get_session(session_id: str) -> Optional[dict]:
    return _sessions.get(session_id)

def update_session(session_id: str, player_choice: str, next_scene_data: dict, image_url: str) -> dict:
    state = _sessions[session_id]
    state["choice_history"].append(player_choice)
    state["current_scene"] = next_scene_data["scene_text"]
    state["current_choices"] = next_scene_data.get("choices", [])
    state["scene_number"] += 1
    state["is_ending"] = next_scene_data.get("is_ending", False)
    state["image_url"] = image_url
    for char, delta in next_scene_data.get("relationship_updates", {}).items():
        state["relationship_scores"][char] = state["relationship_scores"].get(char, 0) + delta
    return state