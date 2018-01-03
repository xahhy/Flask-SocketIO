var socket;
var URL = 'http://127.0.0.1:5000';
var $inputMessage = $('.m-input-area>input');
var $html = $("html");

function set_socket() {
    var userId = Cookies.get('user_id');
    if (userId) {
        socket = io(URL + '/user', {
            timeout:1000,
            query: {
                user_id: userId
            }
        });
        $('#user_id').html(userId)
    } else {
        socket = io(URL + '/user', {
            timeout:1000
        });
    }
    socket.on('user_id', function (data) {
        console.log(data['user_id']);
        if (data['user_id']) {
            Cookies.set('user_id', data['user_id']);
            $('#user_id').html(data['user_id']);
        }
    });
    socket.on('message', function (data) {
        var msg = data['data'];
        console.log('收到消息:'+ msg);
        var $msg = $('<div class="alert alert-success" role="alert">'+msg+'</div>');
        $('.m-message-area > .container').append($msg);
        $html.animate({scrollTop: $html.height()},200);
    });
}
function set_admin_socket() {
    var adminSocket = io(URL+'/admin', { forceNew: true });
    adminSocket.on('users', function (data) {
        // console.log(data);
        $('.m-user-number').html(data);
    })
}
function set_connection_signal() {
    if (socket.connected) {
        $('#id_connect_switch').bootstrapSwitch('state', true);
    } else {
        $('#id_connect_switch').bootstrapSwitch('state', false);
    }
    setTimeout("set_connection_signal()", 1000);
}

set_socket();
set_admin_socket();
//socket.connect();

$('#btn_connect').click(function () {
    set_socket();
    socket.connect();
    console.log('connect!')
});
$('#btn_disconnect').click(function () {
    socket.disconnect();
    console.log('disconnect!')
});
$('#btn_clear_cookie').click(function () {
    Cookies.remove('user_id')
});
function sendMessage() {
    var message= $('#id_message').find('input').val();
    socket.emit('message',{data:message});
    console.log(message);
}
$('#id_message').find('button').click(sendMessage);
$(window).keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $inputMessage.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
        sendMessage();
    }
  });
$('#id_connect_switch').on('switchChange.bootstrapSwitch', function(event, state) {
    if(socket === undefined){
        set_socket();
    }
    if(state){
        set_socket();
        console.log('connected');
    }else {
        socket.disconnect();
        console.log('disconnected');
    }
});

setTimeout("set_connection_signal()", 2000);
var areYouReallySure = false;
function areYouSure() {
    socket.disconnect();
}

var allowPrompt = true;
window.onbeforeunload = areYouSure;
// window.onbeforeunload = function (e) {
//     e = e || window.event;
//
//     // For IE and Firefox prior to version 4
//     if (e) {
//         e.returnValue = 'Any string';
//     }
//
//     // For Safari
//     return 'Any string';
// };