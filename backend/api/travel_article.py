import json
from fastapi import FastAPI, HTTPException, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from openai import OpenAI
import base64
import requests
from dotenv import load_dotenv
import os
load_dotenv()
client = OpenAI()

router = APIRouter()
app = FastAPI()

# OpenAI API Key
api_key = os.getenv("OPENAI_API_KEY")


class ArticleResponse(BaseModel):
    article: str

def process_article(data) -> str:
    base64_image: str = data['photo']
    hotel_name = data['hotel_name']
    descript = data['description']
    reviews = data['reviews'] 
    formatted_reviews = "\n".join(reviews)
    print(formatted_reviews)
    rating = data['rating']
    headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
    }
    payload = {
    "model": "gpt-4o",
    "messages": [
        {
        "role": "user",
        "content": [
            {
            "type": "text",
            "text": f"Here is the information and the image of the hotel, please generate an article promoting this hotel. Hotel Name {hotel_name}, Description: {descript}, Reviews: ${formatted_reviews}, Rating: {rating}",
            },
            {
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{base64_image}"
            }
            }
        ]
        }
    ]
    }
    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    result = response.json()
    return result['choices'][0]['message']['content']

def generate_article(data) -> str:
    # Process the image
    article = process_article(data)
    
    return article

@router.post("/api/generate-travel-article")
async def generate_travel_article(request: Request):

    try:
        data = await request.json()
        # print(data['description'])
        article = generate_article(data)

        return {"article": article}
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)