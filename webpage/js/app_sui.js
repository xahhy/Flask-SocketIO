var socket;
var URL = 'http://127.0.0.1:5000';
var $inputMessage = $('#id_message_input').find('input');
var $inputMessageBtn = $('#id_message_input').find('.button');
var $html = $("html");
var $connectSwitch = $('.label-switch').find('input');
var $connectSwitchTitle = $('.m-connect-switch > .item-title');
var $content = $('.content');

function set_socket() {
    var userId = Cookies.get('user_id');
    if (userId) {
        socket = io(URL + '/user', {
            timeout: 1000,
            query: {
                user_id: userId
            }
        });
        $('#user_id').html(userId)
    } else {
        socket = io(URL + '/user', {
            timeout: 1000
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
        console.log('收到消息:' + msg);
        var $msg = '<div class="card">' +
            '                <div class="card-content">' +
            '                    <div class="card-content-inner">' +
            msg +
            '</div>' +
            '                </div>' +
            '            </div>';
        $content.append($msg);
        $content.scroller('refresh');
        $content.scrollTop($content[0].scrollHeight);
        // $html.animate({scrollTop: $html.height()},200);
    });
}

function set_admin_socket() {
    var adminSocket = io(URL + '/admin', {forceNew: true});
    adminSocket.on('users', function (data) {
        // console.log(data);
        $('#id_user_number').html(data);
    })
}

function set_connection_signal() {
    $connectSwitch[0].checked = !!socket.connected;
    if (socket.connected) {
        $connectSwitchTitle.text('已连接');
        $connectSwitchTitle.removeClass('color-danger');
        $connectSwitchTitle.addClass('color-success');
    } else {
        $connectSwitchTitle.text('已断开');
        $connectSwitchTitle.removeClass('color-success');
        $connectSwitchTitle.addClass('color-danger');
    }
    setTimeout("set_connection_signal()", 1000);
}

set_socket();
set_admin_socket();

//socket.connect();
function sendMessage() {
    var message = $inputMessage.val();
    $inputMessage.val('');
    socket.emit('message', {data: message});
    console.log(message);
}

$inputMessageBtn.click(sendMessage);
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
$connectSwitch.click(function (event) {
    var state = $connectSwitch[0].checked;
    if (socket === undefined) {
        set_socket();
    }
    if (state) {
        set_socket();
        console.log('connected');
    } else {
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