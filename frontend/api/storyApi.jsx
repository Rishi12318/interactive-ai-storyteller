import axios from "axios";
import { API_BASE_URL } from "../src/config";

const BASE_URL = API_BASE_URL;

export async function startStory(prompt, playerName, characterProfile = null) {
  const response = await axios.post(`${BASE_URL}/start-story`, {
    prompt,
    player_name: playerName,
    character_profile: characterProfile || null,
  });
  return response.data;
}

export async function nextScene(sessionId, choiceIndex) {
  const response = await axios.post(`${BASE_URL}/next-scene`, {
    session_id: sessionId,
    choice_index: choiceIndex,
  });
  return response.data;
}

export async function getStoryState(sessionId) {
  const response = await axios.get(`${BASE_URL}/story-state/${sessionId}`);
  return response.data;
}
