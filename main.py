from flask import Flask
from flask import request

app = Flask(__name__)

@app.route("/", methods=['GET'])
def hello_world():
    src = request.args.get('src')
    dst = request.args.get('dst')
    print(src)
    print(dst)
    print("!!")
    return "<p>" + src + dst + "</p>"