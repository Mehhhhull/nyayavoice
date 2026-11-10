
from app.services.rag.retrieval import retrieve_chunks

query = "Can a railway station shop sell a packaged product above its printed MRP?"

results = retrieve_chunks(query)

print(f"\nRetrieved {len(results)} chunks\n")

for index, chunk in enumerate(results, start=1):
    print(f"--- Result {index} ---")
    print("Similarity:", chunk["similarity"])
    print("Section:", chunk["metadata"].get("section"))
    print("Content:", chunk["content"])
    print()