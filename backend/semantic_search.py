import re
from typing import List, Dict, Optional

try:
    from sentence_transformers import SentenceTransformer
    import faiss
    import numpy as np
    _SEARCH_AVAILABLE = True
except ImportError:
    _SEARCH_AVAILABLE = False

BLOCKED_TERMS = [
    "torture", "mutilate", "dismember", "gore", "behead", "decapitate",
    "self-harm", "suicide methods", "cut myself", "kill myself",
    "explicit sex", "pornography", "nude", "naked", "sexual assault details",
    "rape scene", "erotic",
    "racial slur", "hate crime instructions", "terrorist", "bomb making",
    "genocide praise", "nazi praise", "extremist manifesto",
    "drug synthesis", "how to make drugs", "overdose instructions",
    "minor", "underage romance", "child",
    "jailbreak", "ignore previous instructions", "pretend you are",
    "bypass filter", "act as if", "dan mode",
]

SENSITIVE_CATEGORIES = {
    "violence": ["murder details", "stabbing", "shooting spree", "massacre how-to"],
    "mental_health": ["suicide note", "self harm", "depression spiral"],
    "explicit": ["sex scene", "nsfw", "adult content", "explicit"],
    "hate": ["slur", "racist", "sexist attack", "homophobic"],
}

REPLACEMENT_RESPONSES = {
    "violence":     "I can explore dark themes through story but won't generate harmful content.",
    "mental_health":"That topic is sensitive. Would you like a story about resilience instead?",
    "explicit":     "Story Forge keeps content appropriate for all audiences.",
    "hate":         "Stories here respect all people. Try a different theme.",
    "blocked":      "That query isn't something Story Forge can process. Try rephrasing.",
}


class SemanticSearchEngine:
    def __init__(self, stories: List[Dict]):
        self.stories = stories
        self.index = None
        self.embeddings = None
        self.available = _SEARCH_AVAILABLE
        if self.available:
            self._build_index()

    def _build_index(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        texts = [
            f"{s['title']} {s['category']} {s['description']}"
            for s in self.stories
        ]
        self.embeddings = self.model.encode(texts, normalize_embeddings=True)
        dim = self.embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dim)
        self.index.add(self.embeddings.astype("float32"))

    def _check_blocked(self, query: str) -> Optional[str]:
        q = query.lower()
        for term in BLOCKED_TERMS:
            if term in q:
                return "blocked"
        return None

    def _detect_category(self, query: str) -> Optional[str]:
        q = query.lower()
        for cat, keywords in SENSITIVE_CATEGORIES.items():
            if any(kw in q for kw in keywords):
                return cat
        return None

    def _sanitize(self, query: str) -> str:
        query = re.sub(r"[^\w\s\-',.]", "", query)
        query = query.strip()[:500]
        return query

    def search(
        self,
        query: str,
        category: Optional[str] = None,
        top_k: int = 5,
    ) -> Dict:
        if not self.available:
            return {"error": "Semantic search unavailable (missing dependencies).", "results": []}

        query = self._sanitize(query)
        if not query:
            return {"error": "Empty query.", "results": []}

        blocked = self._check_blocked(query)
        if blocked:
            return {"error": REPLACEMENT_RESPONSES["blocked"], "results": [], "flagged": True}

        sensitive = self._detect_category(query)
        if sensitive:
            return {"error": REPLACEMENT_RESPONSES[sensitive], "results": [], "flagged": True}

        q_emb = self.model.encode([query], normalize_embeddings=True)

        if category:
            cat_indices = [
                i for i, s in enumerate(self.stories)
                if s["category"].lower() == category.lower()
            ]
            if not cat_indices:
                return {"error": f"No stories in category: {category}", "results": []}
            cat_embs = self.embeddings[cat_indices].astype("float32")
            scores = (q_emb @ cat_embs.T)[0]
            top_local = np.argsort(scores)[::-1][:top_k]
            results = [
                {**self.stories[cat_indices[i]], "score": float(scores[i])}
                for i in top_local
            ]
        else:
            scores, indices = self.index.search(q_emb.astype("float32"), top_k)
            results = [
                {**self.stories[idx], "score": float(scores[0][rank])}
                for rank, idx in enumerate(indices[0])
                if idx < len(self.stories)
            ]

        results = [r for r in results if r["score"] > 0.25]
        return {"results": results, "flagged": False, "query": query}
