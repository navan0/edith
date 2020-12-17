"""EDITH."""


from edith import app
from edith.secret import WITTOKEN
from fastapi import Request
import requests
import json
import wikipedia
from bs4 import BeautifulSoup
from fastapi import FastAPI
from pydantic import BaseModel, Json
from gtts import gTTS
from fastapi.responses import FileResponse
import base64


API_ENDPOINT = 'https://api.wit.ai/message'

wit_access_token = WITTOKEN

# r = sr.Recognizer()


class DynamicSchema(BaseModel):
    item: Json


def speach_to_text(mytext):
    mytext = mytext.split(".")[0]
    language = 'en'
    myobj = gTTS(text=mytext, lang=language, slow=False)
    myobj.save("/tmp/welcome.mp3")
    path = "/tmp/welcome.mp3"
    f = open(path, 'rb')
    b = base64.encodestring(f.read())
    f.close()
    return b, mytext


def get_logic(data):
    intents = data.get("intents")[0]
    entities = data.get("entities")
    if intents["name"] == "search":
        question = entities.get("question:question")
        res = default_search(question)
    elif intents["name"] == "search_with_target":
        question = entities.get("question:question")
        target = entities.get("target:target")
        res = target_search(question, target)

    return res


def google_search(query):
    query = query.replace(' ', '+')
    URL = f"https://google.com/search?q={query}"
    USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:65.0) Gecko/20100101 Firefox/65.0"

    headers = {
        "user-agent": USER_AGENT
    }

    resp = requests.get(URL, headers=headers)

    if resp.status_code == 200:
        soup = BeautifulSoup(resp.content, "html.parser")
        results = []
        for g in soup.find_all('div', class_='r'):
            anchors = g.find_all('a')
            if anchors:
                link = anchors[0]['href']
                title = g.find('h3').text
                item = {
                    "title": title,
                    "link": link
                }
                results.append(item)

    return results[0]


def default_search(question):
    try:
        response = wikipedia.summary(question[0].get("body"))
    except wikipedia.DisambiguationError:
        response = "Sorry edith can't process that query"

    return response


def target_search(question, target):
    try:
        response = google_search(
            question[0].get("body")+str("+")+target[0].get("body"))

    except:
        response = "Sorry Edith can't process that"

    return response


@app.get("/")
async def index(request: Request):
    return {
        "statusCode": 200,
        'response':  "server OK"


    }


@app.get("/query/{full_query}")
async def get_query(full_query: str):
    headers = {
        'Authorization': 'Bearer ' + wit_access_token,
    }
    params = (('v', '20200905'), ('q', full_query),)
    response = requests.get(API_ENDPOINT, headers=headers, params=params)
    data = json.loads(response.content)

    response = get_logic(data)

    return {
        'statusCode': 200,
        'response':  response
    }


@app.post("/voice-query")
async def from_server(item: dict):
    response = get_logic(item)
    speech, res = speach_to_text(response)

    return {
        'statusCode': 200,
        # 'response':  res,
        'response':  response,
        'speech_string': speech

    }
