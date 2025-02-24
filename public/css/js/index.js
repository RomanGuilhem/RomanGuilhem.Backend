const socket = io();

Swal.fire({
    title: "Nombre de Usuario",
    input: Text,
    Text: "ingrese el nombre de usuario para ser identificado en el chat por otros usuarios",
    icon: warning,
    allowOutsideClick: false,
    inputValidator: (value) =>{
        return !value && 'El nombre de usuario es obligatorio para continuar en la pagina.'
    }
}).then (result =>{
    user=result.value;
    document.getElementById('username-display').textContent = user;
})

chatBox.addEventListener ('keyup', (evt) =>{
    if(evt.key === 'Enter'){
        if(chatBox.value,trin().length){
            socket.emit('message', {user: user, message: chatBox.value});
            chatBox.value = '';
        }
    }
})

socket.on('messageLogs', data => {
    let log = document.getElementById('messagesLogs');
    let messagesHtml = "";
    data.forEach(message => {
        messagesHtml += `${message.user} dice: ${message.message}<br>`;
    })
    log.innerHTML = messagesHtml;
})

socket.on('newUserConnected', newUser => {
    Swal.fire({
        text:"Nuevo usuario conectado",
        toast: true,
        position: 'bottom-right',
        showConfirmButton: false,
        icon: 'info',
        title: `${newUser.user} esta ahora en el chat`,
        timer: 5000
    })
})