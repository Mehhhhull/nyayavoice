
from starlette.concurrency import run_in_threadpool

from app.services.llm.gemini import (
    generate_speech_response,
    generate_rag_response,
)
from app.services.rag.retrieval import retrieve_chunks
from app.services.conversations import (
    create_conversation,
    get_conversation,
    save_message,
    get_conversation_history,
)


async def process_chat(
    message: str,
    generate_speech: bool = False,
    language_code: str = "auto",
    conversation_id: str | None = None,
) -> dict:
    """
    Shared pipeline:
    Conversation history → RAG → Gemini → Answer + Sources
    """

    # 1. Create or validate conversation
    if conversation_id:
        conversation = await run_in_threadpool(
            get_conversation, conversation_id
        )

        if not conversation:
            raise ValueError("Invalid conversation ID")
    else:
        conversation_id = await run_in_threadpool(
            create_conversation
        )

    # 2. Load previous conversation history
    history = await run_in_threadpool(
        get_conversation_history,
        conversation_id,
        limit=10,
    )

    # 3. Save current user message
    await run_in_threadpool(
        save_message,
        conversation_id,
        "user",
        message,
    )

    # 4. Retrieve knowledge using only the latest message
    chunks = await run_in_threadpool(
        retrieve_chunks,
        message,
        match_count=5,
        match_threshold=0.35,
    )

    # 5. Handle missing knowledge
    if not chunks:
        answer = (
            "I couldn't find sufficiently relevant information "
            "in my current knowledge base. Could you provide "
            "more details about your issue?"
        )

        await run_in_threadpool(
            save_message, conversation_id, "assistant", answer
        )

        return {
            "conversation_id": conversation_id,
            "response": answer,
            "speech_response": answer if generate_speech else None,
            "sources": [],
        }

    # 6. Prepare retrieved context
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
Verification status: {metadata.get('verification_status', 'Unknown')}
Section: {metadata.get('section', 'Unknown')}

Content:
{chunk['content']}
"""
        )

    context = "\n\n".join(context_parts)

    # 7. Build conversation context for Gemini
    history_text = "\n".join(
        f"{item['role'].upper()}: {item['content']}"
        for item in history
    )

    conversation_question = f"""
PREVIOUS CONVERSATION:
{history_text if history_text else "No previous messages."}

LATEST USER MESSAGE:
{message}
"""

    # 8. Generate grounded answer
    answer = await generate_rag_response(
        question=conversation_question,
        context=context,
        language_code=language_code,
    )

    # 9. Generate optional speech response
    speech_response = None

    if generate_speech:
        speech_response = await generate_speech_response(answer)

    # 10. Save assistant response
    await run_in_threadpool(
        save_message,
        conversation_id,
        "assistant",
        answer,
    )

    # 11. Prepare unique source references
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
                "chunk_refs": [],
            }

        sources_by_url[url]["chunk_refs"].append(index)

    # 12. Return everything
    return {
        "conversation_id": conversation_id,
        "response": answer,
        "speech_response": speech_response,
        "sources": list(sources_by_url.values()),
    }
