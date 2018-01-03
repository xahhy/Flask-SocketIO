var socket;
var URL = 'http://192.168.0.145:5000';
var $inputMessage = $('#id_message_input').find('input');
var $inputMessageBtn = $('#id_message_input').find('.button');
var $html = $("html");
var $connectSwitch = $('.label-switch');
var $connectSwitchTitle = $('.m-connect-switch > .item-title');
var $content = $('.content');
var lastStatus = false;

function addMessage($msg) {
    $content.append($msg);
    $content.scroller('refresh');
    $content.scrollTop($content[0].scrollHeight);
}

function set_socket() {
    var userId = Cookies.get('user_id');
    if(socket){
        socket.disconnect();
    }
    if (userId) {
        socket = io(URL + '/user', {
            query: {
                user_id: userId
            }
        });
        $('#user_id').html(userId)
    } else {
        socket = io(URL + '/user');
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
        addMessage($msg);
        // $html.animate({scrollTop: $html.height()},200);
    });
    socket.on('system', function (data){
        var $msg = '<p class="text-center color-gray m-system-msg">'+data['data']+'</p>';
        addMessage($msg);
    })
}

function set_admin_socket() {
    var adminSocket = io(URL + '/admin', {forceNew: true});
    adminSocket.on('users', function (data) {
        // console.log(data);
        $('#id_user_number').html(data);
    })
}

function set_connection_signal() {
    $connectSwitch.find('input')[0].checked = socket.connected;
    if (socket.connected) {
        $connectSwitchTitle.text('已连接');
        $connectSwitchTitle.removeClass('color-danger');
        $connectSwitchTitle.addClass('color-success');
    } else {
        $connectSwitchTitle.text('已断开');
        $connectSwitchTitle.removeClass('color-success');
        $connectSwitchTitle.addClass('color-danger');
    }
    if(lastStatus!==socket.connected){
        connectToast();
    }
    lastStatus = socket.connected;
    setTimeout("set_connection_signal()", 2000);
}

set_socket();
set_admin_socket();

//socket.connect();
function sendMessage() {
    var message = $inputMessage.val();
    if(message===''){
        $content.html('<div class="card">\n' +
            '                <div class="card-content color-success">\n' +
            '                    <div class="card-content-inner text-center">欢迎来到闪聊 ( ゜- ゜)つロ<br/>思沃大讲堂专用</div>\n' +
            '                </div>\n' +
            '            </div>');
    }
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
function connectToast() {
    if(socket.connected){
        $.toast('连接成功')
    }else {
        $.toast('连接断开')
    }
}
$connectSwitch.find('.checkbox').on('click',function () {
    var state = $connectSwitch.find('input')[0].checked;
    if (!state) {
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