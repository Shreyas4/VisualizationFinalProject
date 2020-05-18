from flask import Flask, render_template, jsonify, request
import pandas as pd
import time
import utils

app = Flask(__name__)

@app.route('/', methods=['POST', 'GET'])
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run()
