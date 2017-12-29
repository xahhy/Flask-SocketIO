import time
from flask import Flask, render_template, make_response
from flask_socketio import SocketIO, emit
import threading
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app)
socketio = SocketIO(app)
ClientNumber = 0


@socketio.on('connect', namespace='/user')
def test_connect():
    global ClientNumber
    ClientNumber += 1
    # emit('my response', {'data': 'Connected'})
    print('connected')

@socketio.on('disconnect', namespace='/user')
def test_disconnect():
    global ClientNumber
    ClientNumber -= 1
    if ClientNumber < 0: ClientNumber = 0
    print('Client disconnected')

@socketio.on_error_default  # handles all namespaces without an explicit error handler
def default_error_handler(e):
    print('Found A Error',str(e))

def loop():
    time.sleep(1)
    loop()


@app.route('/clients')
def get_client_number():
    global ClientNumber
    return make_response(str(ClientNumber))

if __name__ == '__main__':
    t = threading.Thread(target=loop)
    t.setDaemon(True)
    t.start()
    socketio.run(app,debug=True)
