from pydantic import BaseModel
from typing import List, Optional

class CharacterProfile(BaseModel):
    name: Optional[str] = ""
    gender: Optional[str] = ""
    age: Optional[str] = ""
    build: Optional[str] = ""
    faceShape: Optional[str] = ""
    skinTone: Optional[str] = ""
    eyeColor: Optional[str] = ""
    hairColor: Optional[str] = ""
    hairStyle: Optional[str] = ""
    uniqueFeatures: Optional[str] = ""
    outfit: Optional[str] = ""
    accessories: Optional[str] = ""
    artStyle: Optional[str] = "anime"

class StartStoryRequest(BaseModel):
    prompt: str
    player_name: str
    character_profile: Optional[CharacterProfile] = None

class ChoiceRequest(BaseModel):
    session_id: str
    choice_index: int

class StoryResponse(BaseModel):
    session_id: str
    scene_text: str
    choices: List[str]
    characters: dict
    scene_number: int
    is_ending: bool
    image_url: str
