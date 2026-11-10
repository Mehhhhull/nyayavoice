
from google import genai
from google.genai import types

from app.core.config import settings
from app.core.supabase import supabase


# Configuration
EMBEDDING_MODEL = "gemini-embedding-2"
EMBEDDING_DIMENSIONS = 768

# Gemini client
gemini = genai.Client(api_key=settings.GEMINI_API_KEY)


def generate_query_embedding(query: str) -> list[float]:
    """Convert the user's question into a vector."""

    response = gemini.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=query,
        config=types.EmbedContentConfig(
            output_dimensionality=EMBEDDING_DIMENSIONS
        )
    )

    embedding = response.embeddings[0].values

    if len(embedding) != EMBEDDING_DIMENSIONS:
        raise ValueError("Invalid embedding dimensions")

    return embedding


def retrieve_chunks(
    query: str,
    match_count: int = 5,
    match_threshold: float = 0.35
) -> list[dict]:
    """Retrieve relevant chunks with their source information."""

    if not query.strip():
        return []

    # 1. Generate query embedding
    query_embedding = generate_query_embedding(query)

    # 2. Search document chunks
    response = supabase.rpc(
        "match_document_chunks",
        {
            "query_embedding": query_embedding,
            "match_threshold": match_threshold,
            "match_count": match_count
        }
    ).execute()

    chunks = response.data

    if not chunks:
        return []

    # 3. Collect unique source IDs
    source_ids = list({
        chunk["source_id"] for chunk in chunks
    })

    # 4. Fetch source information
    sources_response = (
        supabase.table("sources")
        .select(
            "id, title, source_url, source_type, "
            "authority, jurisdiction, published_at, last_verified_at"
        )
        .in_("id", source_ids)
        .execute()
    )

    # 5. Map sources by ID
    source_map = {
        source["id"]: source
        for source in sources_response.data
    }

    # 6. Attach source information to chunks
    for chunk in chunks:
        chunk["source"] = source_map.get(chunk["source_id"])

    return chunks
