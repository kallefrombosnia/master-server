$(document).ready(function(){
    $('select').chosen({ width:'200px' });
});


$('select').on('change', function(event, params) {
    // can now use params.selected and params.deselected
    $('input[name="ownerId"]').val(params.selected);
});


$('select').on('change', function(event, params) {
    // can now use params.selected and params.deselected
    $('input[name="authLevel"]').val(params.selected);
});

$('.count').each(function () {
    $(this).prop('Counter',0).animate({
        Counter: $(this).text()
    }, {
        duration: 2500,
        easing: 'swing',
        step: function (now) {
            $(this).text(Math.ceil(now));
        }
    });
});



const socket = io('http://localhost:8080');

socket.once('newClient', (msg) =>{
    return $('.live li:last-child').remove();
});

socket.on('userCount', (msg) =>{
    $('.countNumber').text(`Live user connections: ${msg}`);
});

socket.on('newClient', (info) =>{  
  
    if(info.result != undefined){

        if ( $('.live li').length < 5) {
            return $('.live').prepend($(`<li class="list-group-item d-flex justify-content-between align-items-center"><a href="tools/user/${info.result.query}">${info.result.query}</a> <span class="float-right">${(info.result.country)} <img src="https://www.countryflags.io/${(info.result.countryCode).toString().toLowerCase()}/flat/24.png" /></span></li>`));
        }else{
            $('.live li:last-child').remove();
            $('.live').prepend($(`<li class="list-group-item d-flex justify-content-between align-items-center"><a href="tools/user/${info.result.query}">${info.result.query}</a> <span class="float-right">${(info.result.country)} <img src="https://www.countryflags.io/${(info.result.countryCode).toString().toLowerCase()}/flat/24.png" /></span></li>`));
            return true
        }
    } 
});

socket.once('pingInfo', (msg) =>{
    return $('.ping li:last-child').remove();
});


socket.on('pingInfo', (info) =>{  

    if(info.ping != undefined){

        const time = new Date();
        const stringTime = time.toLocaleTimeString('en-US', { hour12: false });

        if ( $('.ping li').length < 5) {
            return $('.ping').prepend($(`<li class="list-group-item d-flex justify-content-between align-items-center">Time: <b>${stringTime}</b>   Ping:  <b>${info.ping}</b></li>`));
        }else{
            $('.ping li:last-child').remove();
            $('.ping').prepend($(`<li class="list-group-item d-flex justify-content-between align-items-center">Time: <b>${stringTime}</b>   Ping:  <b>${info.ping}</b></li>`));
            return true
        }
    } 
});


socket.on('newMasterRequest', (info) =>{  

    console.log('called')
    const time = new Date();
    const stringTime = time.toLocaleTimeString('en-US', { hour12: false });

    if ( $('.master-events li').length < 5) {
        return $('.master-events').prepend($(`<li class="list-group-item d-flex justify-content-between align-items-center">New request: ${info.ip}</li>`));
    }else{s
        $('.master-events').prepend($(`<li class="list-group-item d-flex justify-content-between align-items-center">New request: ${info.ip}</li>`));
        return true
    }
    
});



