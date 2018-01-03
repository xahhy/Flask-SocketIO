import time
from flask import Flask, render_template, make_response, request
from flask_socketio import SocketIO, emit
import threading
from flask_cors import CORS
import uuid
import logging

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app)
socketio = SocketIO(app)
ClientNumber = 0
Users = {}
Sid_User_Map = {}
logging.basicConfig(level=logging.INFO)

@socketio.on('connect', namespace='/user')
def test_connect():
    global ClientNumber
    user_id = request.args.get('user_id')
    sid = request.sid
    logging.debug('Connected. user_id=%s sid=%s' % (user_id, sid))
    if user_id:
        sessions = Users.get(user_id)
        if not sessions:
            sessions = Users[user_id] = {sid}
            ClientNumber += 1
            logging.debug('Old User. New Connection! Online %s' % ClientNumber)
        else:
            logging.debug('Old User. Connect Again!')
        sessions.add(sid)
    else:
        user_id = str(uuid.uuid1())
        emit('user_id', {'user_id': user_id})
        Users[user_id] = {sid}
        ClientNumber += 1
        logging.debug('New User! user_id=%s Online %s' % (user_id, ClientNumber))
    Sid_User_Map[sid] = user_id
    emit('system',{'data':'叮咚- ( ゜- ゜)つロ'},broadcast=True)
    print('connected', user_id)


@socketio.on('disconnect', namespace='/user')
def test_disconnect():
    global ClientNumber
    sid = request.sid
    user_id = Sid_User_Map[sid]
    sessions = Users[user_id]
    sessions.remove(sid)
    if not sessions:
        Users.pop(user_id)
        ClientNumber -= 1
        if ClientNumber < 0: ClientNumber = 0
        logging.debug('user_id=%s disconnected. Online %s' % (user_id, ClientNumber))
    emit('system',{'data':'有人走了( ´╥ω╥`)'},broadcast=True)
    print('Client disconnected')


@socketio.on('users', namespace='/admin')
def test_users():
    global ClientNumber
    emit('users', ClientNumber, broadcast=True)


# @socketio.on_error_default  # handles all namespaces without an explicit error handler
# def default_error_handler(e):
#     print('Found A Error', str(e))
@socketio.on('message', namespace='/user')
def receive_message(json:dict):
    message = json.get('data')
    if message:
        emit('message',json,broadcast=True)


def loop():
    global ClientNumber
    while True:
        socketio.emit('users', ClientNumber, namespace='/admin')
        time.sleep(1)


@app.route('/clients')
def get_client_number():
    global ClientNumber
    return make_response(str(ClientNumber))


if __name__ == '__main__':
    t = threading.Thread(target=loop)
    t.setDaemon(True)
    t.start()
    socketio.run(app,host='0.0.0.0', debug=False)
