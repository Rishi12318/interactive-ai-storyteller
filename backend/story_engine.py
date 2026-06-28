import os
import json
import time
import httpx
from groq import Groq
from prompts import STORY_INIT_PROMPT, NEXT_SCENE_PROMPT, ENDING_INSTRUCTION
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Chroma HF Space base URL (Gradio queue API)
CHROMA_BASE = "https://gokaygokay-chroma.hf.space"

def call_groq(prompt: str, retries=3) -> dict:
    for attempt in range(retries):
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.8,
                max_tokens=1500,
            )
            raw = (response.choices[0].message.content or "").strip()
            raw = raw.removeprefix("```json").removesuffix("```").strip()
            return json.loads(raw)
        except json.JSONDecodeError:
            if attempt == retries - 1:
                raise
            time.sleep(1)

def generate_opening(user_prompt: str, player_name: str) -> dict:
    prompt = STORY_INIT_PROMPT.format(user_prompt=user_prompt, player_name=player_name)
    return call_groq(prompt)

def generate_next_scene(state: dict, player_choice: str) -> dict:
    scene_number = state["scene_number"]
    ending_instruction = ENDING_INSTRUCTION if scene_number >= 7 else ""
    history_text = "\n".join([f"Scene {i+1}: Player chose '{c}'" for i, c in enumerate(state["choice_history"])])
    prompt = NEXT_SCENE_PROMPT.format(
        story_summary=history_text or "This is the first choice.",
        characters=json.dumps(state["characters"], indent=2),
        player_choice=player_choice,
        scene_number=scene_number,
        ending_instruction=ending_instruction
    )
    return call_groq(prompt)

# ── Style-specific quality tags ──────────────────────────────────────────────
_STYLE_TAGS = {
    "anime":          "premium anime artwork, Japanese animation movie style, detailed expressive eyes, beautiful character design, cel shading",
    "semi-realistic": "anime realism, realistic lighting, detailed textures, natural proportions, semi-realistic rendering",
    "realistic":      "cinematic photography, real human proportions, movie scene, realistic environment, photorealistic",
    "cartoon":        "stylized animation, soft shapes, colorful design, cartoon rendering, vibrant palette",
}
_QUALITY_TAGS = "masterpiece, ultra detailed, high quality, cinematic composition, sharp focus, professional artwork, beautiful lighting"


def _build_visual_description(scene_text: str, setting: str, characters: dict,
                               character_profile: dict | None = None) -> str:
    """
    Build a structured anime/cinematic image prompt from the scene context
    and the optional player character profile collected by the wizard.
    """
    char_names = ", ".join([c["name"] for c in characters.values() if isinstance(c, dict) and "name" in c])

    # ── 1. Ask Groq for the core scene action (subject + environment) ─────────
    summary_prompt = (
        "You are an anime movie art director. Write ONE short sentence (max 15 words) "
        "describing the single key VISUAL MOMENT in this scene — what would fill the frame. "
        "Include: who is there, what they are doing, and the environment. "
        "No dialogue. No internal thoughts. No quotes. Output ONLY the sentence.\n\n"
        f"Scene: {scene_text[:400]}\n"
        f"Setting: {setting}\n"
        f"Characters: {char_names}"
    )
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": summary_prompt}],
        temperature=0.6,
        max_tokens=50,
    )
    visual_desc = (response.choices[0].message.content or "").strip()
    visual_desc = visual_desc.strip('"').strip("'").strip()
    visual_desc = visual_desc.split(".")[0].strip()

    # ── 2. Inject player character identity (locked traits) ───────────────────
    char_identity = ""
    if character_profile:
        p = character_profile
        gender_str   = p.get("gender", "")
        parts = []
        if p.get("name"):       parts.append(p["name"])
        if gender_str:          parts.append(gender_str + " character")
        if p.get("age"):        parts.append(p["age"] + " years old")
        if p.get("build"):      parts.append(p["build"])
        if p.get("faceShape"):  parts.append(p["faceShape"] + " face")
        if p.get("skinTone"):   parts.append(p["skinTone"] + " skin")
        if p.get("eyeColor"):   parts.append(p["eyeColor"] + " eyes")
        if p.get("hairColor"):  parts.append(p["hairColor"])
        if p.get("hairStyle"):  parts.append(p["hairStyle"] + " hair")
        if p.get("uniqueFeatures"): parts.append(p["uniqueFeatures"])
        if p.get("outfit"):     parts.append("wearing " + p["outfit"])
        if p.get("accessories"): parts.append("with " + p["accessories"])
        if parts:
            char_identity = ", ".join(parts)

    # ── 3. Resolve art style tags ─────────────────────────────────────────────
    art_style = (character_profile or {}).get("artStyle", "anime")
    style_tags = _STYLE_TAGS.get(art_style, _STYLE_TAGS["anime"])

    # ── 4. Assemble full positive prompt ─────────────────────────────────────
    parts_prompt = [visual_desc]
    if char_identity:
        parts_prompt.append(char_identity)
    parts_prompt += [
        "cinematic lighting", "volumetric light", "dramatic atmosphere",
        style_tags, _QUALITY_TAGS,
    ]
    return ", ".join(filter(None, parts_prompt))


def _build_negative_prompt(character_profile: dict | None = None) -> str:
    return (
        "bad anatomy, extra fingers, missing fingers, deformed face, wrong proportions, "
        "low quality, blurry, duplicate body, bad eyes, watermark, text, logo, "
        "ugly, out of focus, deformed, disfigured, flat colors, signature"
    )


def get_scene_image_url(scene_text: str, setting: str, characters: dict,
                        character_profile: dict | None = None) -> str:
    """
    Generate a scene image using the Chroma HF Space (Gradio queue API).
    Falls back to an empty string on any error so the UI degrades gracefully.
    """
    prompt = _build_visual_description(scene_text, setting, characters, character_profile)
    negative_prompt = _build_negative_prompt(character_profile)
    try:
        with httpx.Client(timeout=90, follow_redirects=True) as http:
            # Step 1 — submit the job to the Gradio queue
            submit_resp = http.post(
                f"{CHROMA_BASE}/gradio_api/call/generate_image",
                json={
                    "data": [
                        prompt,          # prompt
                        negative_prompt, # negative_prompt
                        832,             # width
                        448,             # height  (16:9 ≈ 832×448)
                        26,              # steps
                        4,               # cfg
                        -1,              # seed (-1 = random)
                    ]
                },
                headers={"Content-Type": "application/json"},
            )
            submit_resp.raise_for_status()
            event_id = submit_resp.json().get("event_id")
            if not event_id:
                return ""

            # Step 2 — poll the SSE result stream until we get the image
            result_url = f"{CHROMA_BASE}/gradio_api/call/generate_image/{event_id}"
            with http.stream("GET", result_url) as stream:
                for line in stream.iter_lines():
                    if not line:
                        continue
                    if line.startswith("data:"):
                        payload = line[len("data:"):].strip()
                        if not payload or payload == "null":
                            continue
                        try:
                            data = json.loads(payload)
                        except json.JSONDecodeError:
                            continue
                        # data is a list; first element is the image FileData dict
                        if isinstance(data, list) and len(data) > 0:
                            img_obj = data[0]
                            if isinstance(img_obj, dict):
                                # Use 'path' key with the correct Gradio file-serving URL
                                # (the 'url' field from the Space has a malformed prefix)
                                img_path = img_obj.get("path")
                                if img_path:
                                    return f"{CHROMA_BASE}/gradio_api/file={img_path}"
            return ""
    except Exception:
        return ""