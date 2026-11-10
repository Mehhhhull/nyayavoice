from starlette.concurrency import run_in_threadpool
from app.services.llm.gemini import generate_speech_response
from app.services.rag.retrieval import retrieve_chunks
from app.services.llm.gemini import generate_rag_response


async def process_chat(message: str) -> dict:
    """
    Shared chat pipeline:
    User message → RAG retrieval → Gemini → Answer + Sources
    """

    # 1. Retrieve relevant knowledge
    chunks = await run_in_threadpool(
        retrieve_chunks,
        message,
        match_count=5,
        match_threshold=0.35
    )

    # 2. Handle missing knowledge
    if not chunks:
        fallback_message = (
            "I couldn't find sufficiently relevant information "
            "in my current knowledge base. Could you provide "
            "more details about your issue?"
        )

        return {
            "response": fallback_message,
            "speech_response": fallback_message,
            "sources": []
        }

    # 3. Prepare context for Gemini
    context_parts = []

    for index, chunk in enumerate(chunks, start=1):
        metadata = chunk.get("metadata") or {}
        source = chunk.get("source") or {}

        context_parts.append(
            f"""
SOURCE CHUNK [{index}]

Source title: {source.get('title', 'Unknown')}
Source URL: {source.get('source_url', 'Unknown')}
Authority: {source.get('authority', 'Unknown')}
Source type: {source.get('source_type', 'Unknown')}

Verification status: {
    metadata.get('verification_status', 'Unknown')
}

Section: {metadata.get('section', 'Unknown')}

Content:
{chunk['content']}
"""
        )

    context = "\n\n".join(context_parts)

    # 4. Generate grounded answer
    answer = await generate_rag_response(
        question=message,
        context=context
    )

    speech_response = await generate_speech_response(answer)

    # 5. Prepare unique source references
    sources_by_url = {}

    for index, chunk in enumerate(chunks, start=1):
        source = chunk.get("source") or {}
        metadata = chunk.get("metadata") or {}

        url = source.get("source_url")

        if not url:
            continue

        if url not in sources_by_url:
            sources_by_url[url] = {
                "title": source.get("title"),
                "url": url,
                "authority": source.get("authority"),
                "verification_status": metadata.get(
                    "verification_status", "unknown"
                ),
                "chunk_refs": []
            }

        sources_by_url[url]["chunk_refs"].append(index)

    # 6. Return answer and sources
    return {
    "response": answer,
    "speech_response": speech_response,
    "sources": list(sources_by_url.values())
}