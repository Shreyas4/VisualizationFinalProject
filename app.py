from flask import Flask, render_template, jsonify, request
import pandas as pd
import time
import utils

app = Flask(__name__)

club_agg_df = pd.read_csv('static/Club_AggData.csv')
league_tables_df = pd.read_csv('static/league_tables.csv')


@app.route('/', methods=['POST', 'GET'])
def index():
    if request.method == 'POST':
        data_type = request.form['data_type']
        if data_type == 'club_agg':
            return jsonify(club_agg_df.to_json(orient='records'))
        elif data_type == 'league_tables':
            return jsonify(league_tables_df.to_json(orient='records'))
    return render_template('index.html')


if __name__ == '__main__':
    app.run()
