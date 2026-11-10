
import asyncio

from app.services.rag.retrieval import retrieve_chunks
from app.services.llm.gemini import generate_rag_response


async def main():
    question = (
        "I bought a water bottle at a railway station. "
        "Its MRP is ₹20, but the shopkeeper charged ₹30. "
        "Is this legal and what can I do?"
    )

    # 1. Retrieve relevant knowledge
    print("\nSearching knowledge base...")

    chunks = retrieve_chunks(
        query=question,
        match_count=5,
        match_threshold=0.35
    )

    if not chunks:
        print("No relevant knowledge found.")
        return

    print(f"Retrieved {len(chunks)} chunks.")

    # 2. Prepare context with numbered source references
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

    # 3. Generate grounded answer
    print("\nGenerating answer...\n")

    answer = await generate_rag_response(
        question=question,
        context=context
    )

    # 4. Display answer
    print("=" * 50)
    print("NYAYAVOICE RESPONSE")
    print("=" * 50)
    print(answer)

    
    # 5. Display grouped source references
    print("\n" + "=" * 50)
    print("RETRIEVED SOURCES")
    print("=" * 50)

    grouped_sources = {}

    for index, chunk in enumerate(chunks, start=1):
        source = chunk.get("source") or {}
        metadata = chunk.get("metadata") or {}

        url = source.get("source_url")

        if not url:
            continue

        if url not in grouped_sources:
            grouped_sources[url] = {
                "source": source,
                "chunks": []
            }

        grouped_sources[url]["chunks"].append({
            "label": index,
            "section": metadata.get("section", "Unknown"),
            "verification": metadata.get(
                "verification_status", "Unknown"
            )
        })

    for url, item in grouped_sources.items():
        source = item["source"]
        labels = [
            f"[{chunk['label']}]"
            for chunk in item["chunks"]
        ]

        print(f"\nChunks: {', '.join(labels)}")
        print(f"Title: {source.get('title', 'Unknown')}")
        print(f"Authority: {source.get('authority', 'Unknown')}")
        print(f"URL: {url}")

        for chunk in item["chunks"]:
            print(
                f"  {chunk['label']}. {chunk['section']} "
                f"({chunk['verification']})"
            )



if __name__ == "__main__":
    asyncio.run(main())
