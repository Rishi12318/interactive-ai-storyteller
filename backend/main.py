from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from models import StartStoryRequest, ChoiceRequest
import story_engine
import state_manager
from semantic_search import SemanticSearchEngine
from story_data import STORIES

app = FastAPI(title="Interactive Story AI")
engine = SemanticSearchEngine(STORIES)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

@app.post("/start-story")
async def start_story(req: StartStoryRequest):
    try:
        opening = story_engine.generate_opening(req.prompt, req.player_name)
        char_profile = req.character_profile.model_dump() if req.character_profile else None
        image_url = story_engine.get_scene_image_url(
            opening["opening_scene"], opening["setting"], opening["characters"],
            character_profile=char_profile,
        )
        session_id = state_manager.create_session(opening, req.player_name, image_url)
        return {
            "session_id": session_id,
            "scene_text": opening["opening_scene"],
            "choices": opening["choices"],
            "characters": opening["characters"],
            "scene_number": 1,
            "is_ending": False,
            "image_url": image_url,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/next-scene")
async def next_scene(req: ChoiceRequest):
    state = state_manager.get_session(req.session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")

    player_choice = state["current_choices"][req.choice_index]
    try:
        next_data = story_engine.generate_next_scene(state, player_choice)
        image_url = story_engine.get_scene_image_url(
            next_data["scene_text"], state["setting"], state["characters"]
        )
        updated = state_manager.update_session(req.session_id, player_choice, next_data, image_url)
        return {
            "session_id": req.session_id,
            "scene_text": next_data["scene_text"],
            "choices": next_data.get("choices", []),
            "characters": updated["characters"],
            "scene_number": updated["scene_number"],
            "is_ending": next_data.get("is_ending", False),
            "image_url": image_url,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/story-state/{session_id}")
async def get_state(session_id: str):
    state = state_manager.get_session(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")
    return state

@app.get("/api/search")
def search_stories(
    q: str = Query(..., min_length=2, max_length=500),
    category: str = Query(None),
    top_k: int = Query(5, ge=1, le=20),
):
    result = engine.search(q, category=category, top_k=top_k)
    if result.get("flagged"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.get("/api/categories")
def get_categories():
    cats = list(set(s["category"] for s in STORIES))
    return {"categories": sorted(cats)}

@app.get("/")
def root():
    return {"status": "Story AI backend running"}