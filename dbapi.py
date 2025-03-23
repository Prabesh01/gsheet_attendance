## flask app to listen to POST and GET request on "/<int:row>/<int:col>". save the post request data to db. return the data for get request.
from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'db.sqlite')
db = SQLAlchemy(app)

class Data(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    row = db.Column(db.Integer)
    col = db.Column(db.Integer)
    data = db.Column(db.String(100))

    def __init__(self, row, col, data):
        self.row = row
        self.col = col
        self.data = data

with app.app_context():
    db.create_all()

@app.route('/<int:row>/<int:col>', methods=['POST'])
def add_data(row, col):
    data = request.json['data']
    new_data = Data(row, col, data)

    db.session.add(new_data)
    db.session.commit()

    return ""

@app.route('/<int:row>/<int:col>', methods=['GET'])
def get_data(row, col):
    data = Data.query.filter_by(row=row, col=col).first()
    if not data: data=" "
    else: data=data.data
    return data

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3205, debug=True)
