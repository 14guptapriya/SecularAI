from langchain_mistralai import MistralAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone
from dotenv import load_dotenv
from groq import Groq
import os

load_dotenv()

# ------------------------
# Pinecone + Embeddings
# ------------------------
pc = None
embeddings = None

try:
    pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
    embeddings = MistralAIEmbeddings(model="mistral-embed")
    print("[OK] Pinecone + Mistral embeddings connected.")
except Exception as e:
    print(f"[WARNING] Pinecone init failed: {e}")

# ------------------------
# Vector store selector
# ------------------------
def get_vector_store_for_scripture(scripture: str):
    if not pc or not embeddings:
        raise RuntimeError("Vector store not initialized")

    scripture = scripture.lower()

    index_map = {
        "bhagavad gita": "bhagavad-gita",
        "gita": "bhagavad-gita",
        "quran": "quran-english",
    }

    index_name = index_map.get(scripture)
    if not index_name:
        raise ValueError(f"No index configured for scripture: {scripture}")

    index = pc.Index(index_name)
    return PineconeVectorStore(index=index, embedding=embeddings)

# ------------------------
# LLM
# ------------------------
chat = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# ------------------------
# Safety filter
# ------------------------
def is_harmful_query(q: str):
    bad = [
        "kill", "murder", "attack", "self harm", "suicide",
        "end my life", "rape", "abuse", "bomb", "terror"
    ]
    q = q.lower()
    return any(b in q for b in bad)

# ------------------------
# Search
# ------------------------
def similarity_search(query: str, scripture: str, k: int = 3):
    vs = get_vector_store_for_scripture(scripture)
    return vs.similarity_search(query, k=k)

# ------------------------
# Main RAG function
# ------------------------
def get_ai_reply(
    query: str,
    history_text: str = "",
    religion: str = "hinduism",
    scripture: str = "Bhagavad Gita",
):
    if is_harmful_query(query):
        return "I cannot guide you toward harm. But I can help you calm your mind."

    docs = similarity_search(query, scripture, k=3)
    context = "\n\n".join(d.page_content for d in docs)

    system_prompt = f"""
You are a spiritual guide who can ONLY answer using the Context provided
from {scripture} ({religion}).

STRICT RULES (MUST FOLLOW EXACTLY):
1. Use ONLY the Context text.
2. FIRST output the verses.
3. AFTER verses, write a short explanation.
4. Verses MUST be written ONLY inside the tags below and NEVER repeated elsewhere:

[VERSE title="<Chapter, Verse>"]
<exact verse text>
[/VERSE]

5. DO NOT repeat verse text in the explanation.
6. DO NOT paraphrase, summarize, or re-quote verses.
7. Explanation must be your own words, based on the verses.
8. If Context is insufficient, say exactly:
   "I could not find a relevant verse for this question."
9. Use very simple English.
"""

    user_prompt = f"""
Context:
{context}

Conversation:
{history_text}

User: {query}
"""
    response = chat.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0.6,
        top_p=0.95,
        max_tokens=1024,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )

    return response.choices[0].message.content