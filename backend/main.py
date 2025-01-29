from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from algorithms.linked_list import (
    SinglyLinkedList,
    DoublyLinkedList,
    CircularLinkedList
)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ListRequest(BaseModel):
    array: List[int]
    type: str

@app.get("/")
async def root():
    return {"message": "Linked List Visualizer API"}

@app.post("/api/create-list")
async def create_list(request: ListRequest):
    try:
        if request.type == "singly":
            linked_list = SinglyLinkedList()
        elif request.type == "doubly":
            linked_list = DoublyLinkedList()
        else:
            linked_list = CircularLinkedList()
        
        for value in request.array:
            linked_list.append(value)
        
        return {"nodes": linked_list.get_nodes()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 