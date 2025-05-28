import os
import json
from flask import Flask, request, render_template, jsonify
from openai import OpenAI  # ✅ use this instead of `import openai`
from dotenv import load_dotenv
import re

load_dotenv()  # loads OPENAI_API_KEY from .env
client = OpenAI()  # uses OPENAI_API_KEY from env

app = Flask(__name__, static_folder="static", template_folder="templates")

def generate_pros_cons(decision: str, context: str, risk: str):
    system_msg = (
        "You are a concise decision strategist. "
        "Generate a bullet-point pros/cons list, then choose a single "
        f"clear recommendation given a {risk} risk tolerance. "
        "Justify in ≤150 words. "
        "Respond in JSON with keys: pros (array), cons (array), verdict (string), rationale (string)."
    )
    user_msg = f"DECISION: {decision}\n\nCONTEXT:\n{context}"

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_msg},
        ],
        temperature=0.3,
    )

    raw = response.choices[0].message.content.strip()

    # ✅ Strip out ```json and ``` if present
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "pros": [],
            "cons": [],
            "verdict": "Unable to parse result",
            "rationale": raw
        }

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/decide", methods=["POST"])
def decide():
    data = request.get_json()
    decision = data.get("decision", "").strip()
    context  = data.get("context", "").strip()
    risk     = data.get("risk", "Medium")

    if not decision:
        return jsonify(error="`decision` is required"), 400

    ai = generate_pros_cons(decision, context, risk)
    return jsonify(ai)

if __name__ == "__main__":
    app.run(debug=True)
