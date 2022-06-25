
$(document).ready(function () {
    $("#logout").click(()=>{
        user = {}
        document.getElementById("logoutForm").submit();
    })
    check_valid_wallet();
})
function check_valid_wallet(){
    connet_MM().then(data=>{
        if(data[0] !== user.id.toLowerCase()){
            user = {}
            document.getElementById("logoutForm").submit();
        }
    })
    setTimeout(check_valid_wallet,2000 /* 2 seconds */)
}
async function connet_MM(){
    let accounts
    try {
        accounts = ethereum.request({ method: 'eth_requestAccounts' });
    }
    catch(err) {
        alert("Etherum is missing plz install")
    }

    return accounts
}