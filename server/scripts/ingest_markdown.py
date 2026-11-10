
import re
from pathlib import Path

from google import genai
from google.genai import types

from app.core.config import settings
from app.core.supabase import supabase


# Configuration
SOURCE_ID = 7
EMBEDDING_MODEL = "gemini-embedding-2"
EMBEDDING_DIMENSIONS = 768
MAX_CHUNK_CHARS = 3500

BASE_DIR = Path(__file__).resolve().parents[1]
FILE_PATH = BASE_DIR / "data" / "knowledge" / "offline_pricing_mrp.md"

# Clients
gemini = genai.Client(api_key=settings.GEMINI_API_KEY)


def split_markdown(text: str) -> list[dict]:
    """Split Markdown into heading-aware, paragraph-based chunks."""

    sections = []
    current_heading = "Introduction"
    current_content = []

    for line in text.splitlines():
        heading_match = re.match(r"^#{1,3}\s+(.+)", line)

        if heading_match:
            if current_content:
                sections.append({
                    "heading": current_heading,
                    "content": "\n".join(current_content).strip()
                })

            current_heading = heading_match.group(1).strip()
            current_content = []
        else:
            current_content.append(line)

    if current_content:
        sections.append({
            "heading": current_heading,
            "content": "\n".join(current_content).strip()
        })

    chunks = []

    for section in sections:
        paragraphs = re.split(r"\n\s*\n", section["content"])
        current_text = ""

        for paragraph in paragraphs:
            paragraph = paragraph.strip()

            if not paragraph:
                continue

            candidate = (
                current_text + "\n\n" + paragraph
                if current_text else paragraph
            )

            if len(candidate) > MAX_CHUNK_CHARS and current_text:
                chunks.append({
                    "heading": section["heading"],
                    "content": current_text
                })
                current_text = paragraph
            else:
                current_text = candidate

        if current_text:
            chunks.append({
                "heading": section["heading"],
                "content": current_text
            })

    return chunks


def generate_embedding(content: str) -> list[float]:
    """Generate a 768-dimensional embedding using Gemini."""

    response = gemini.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=content,
        config=types.EmbedContentConfig(
            output_dimensionality=EMBEDDING_DIMENSIONS
        )
    )

    embedding = response.embeddings[0].values

    if len(embedding) != EMBEDDING_DIMENSIONS:
        raise ValueError(
            f"Expected {EMBEDDING_DIMENSIONS} dimensions, "
            f"got {len(embedding)}"
        )

    return embedding


def ingest_document():
    if not FILE_PATH.exists():
        raise FileNotFoundError(f"File not found: {FILE_PATH}")

    text = FILE_PATH.read_text(encoding="utf-8")

    chunks = split_markdown(text)

    if not chunks:
        raise ValueError("No chunks were generated. Check your Markdown file.")

    print(f"Generated {len(chunks)} chunks.")

    rows = []

    for index, chunk in enumerate(chunks):
        content = f"# {chunk['heading']}\n\n{chunk['content']}"

        print(f"Embedding chunk {index + 1}/{len(chunks)}...")

        embedding = generate_embedding(content)

        rows.append({
            "source_id": SOURCE_ID,
            "chunk_index": index,
            "content": content,
            "embedding": embedding,
            "metadata": {
                "section": chunk["heading"],
                "language": "en",
                "verification_status": "research_draft",
                "document": FILE_PATH.name
            }
        })

    # Insert in batches of 10
    for start in range(0, len(rows), 10):
        batch = rows[start:start + 10]

        supabase.table("document_chunks").upsert(
            batch,
            on_conflict="source_id,chunk_index"
        ).execute()

        print(f"Inserted chunks {start + 1} to {start + len(batch)}")

    print("\nIngestion completed successfully!")
    print(f"Source ID: {SOURCE_ID}")
    print(f"Total chunks: {len(rows)}")


if __name__ == "__main__":
    ingest_document()
