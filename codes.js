//Firebase config for this app

var config = {
    apiKey: "API-KEY HERE",
    authDomain: "vanhackathon2019.firebaseapp.com",
    databaseURL: "https://vanhackathon2019.firebaseio.com",
    projectId: "vanhackathon2019",
    storageBucket: "vanhackathon2019.appspot.com",
    messagingSenderId: "Semiu"
  };
  firebase.initializeApp(config);

  //create a global variable to store picture 
  var globalPic="";

  //Global variable to store document from the firbase collection
  var fbDoc = null;
  var premUser = null;
  var applyUsers = null;

  //show User page on Admin Only
function addUser(){
    pgUser.style.display = "block";
    pgEvent.style.display = "none";
}

//Show Event Page on Admin Only
function addEvent(){
    pgUser.style.display = "none";
    pgEvent.style.display = "block";
}

//Create new user (on Admin Only)
function createUser(){
    msg1.innerHTML ="";
    var eml = userEmail1.value;
    var pswd = "vanhackathon2019";
    if (eml != ""){
        var aut = firebase.auth();
        var db = firebase.firestore();
        

        //calling the firebase athentication to create user with email and default password
        firebase.auth().createUserWithEmailAndPassword(eml, pswd).then(function(user1){

            //check if this is a premium user
            if (premium.checked == true){
              var user = firebase.auth().currentUser;
              db.collection("PremiumUsers").add({
                SPECIALS10: user.email
              }).then(function(){
                alert("Make Premium Successfully!");
              }).catch(function(error){
                alert ("There is issue "+ error);
              });
              /*
              user.updateProfile({
                Interests: "Premium"
              }).then(function(){
                alert("Make Premium Successfully!");
              }).catch(function(error){
                alert ("There is issue "+ error);
              });
              */
            }
        
            aut.sendPasswordResetEmail(eml).then(function(){
            
            msg1.innerHTML = "User Created Successfully. An Email has been sent to the user " + eml +" for confirmation!";
            userEmail1.value = "";
            
        
              }).catch(function(error){
                //alert (error.message);
            msg1.innerHTML = error.message;
            
            });
        
          }).catch(function(error){
                alert(error.message);
        });

    }
    else{
        alert("Enter the Email address!");
    }

}

//Reset password (on Admin Only)
function resetPassword(){
    eml = userEmail1.value;
    var aut = firebase.auth();
    msg1.innerHTML = "";
    aut.sendPasswordResetEmail(eml).then(function(){
        
        msg1.innerHTML = "Check Your Email for Password reset";
        
    }).catch(function(error){
        alert (error.message);

    });
}

//Image submission for event (on Admin Only)
function showImg(foto){
    globalPic = foto.files[0];
	//alert(pic.name);
    myPic.src =window.URL.createObjectURL(globalPic);
    
    //for testing
    //storePic();
}

//this function stores the image first before the data (on Admin Only)
function storePic(){
    if (globalPic !=""){
        //alert("storeRef");
        var stor = firebase.storage();
        var storeRef = stor.ref();

        
		var storeImage = storeRef.child('VanHack/' + globalPic.name).put(globalPic);
        
		storeImage.on('state_changed', function(snapshot){
			clr.style.display="block";
		},
		function(error){
			clr.innerHTML = error.code;
			clr.style.display="block";
		},
		function(){
			storeImage.snapshot.ref.getDownloadURL().then(function(downloadURL){
				myPic.src = downloadURL;
				//var picPath = downloadURL;
				var s = '\u2713';
				clr.innerHTML=s + " Submitted. Thanks";

				//store other data
				submitEvent(downloadURL);
			})

		});
        //alert("stor");
    }
}

//Store subitted data (on Admin only)
function submitEvent(dr){
    //get contents from form
    
    var eID = eventId.value;
    
    var eType = eventType.value;
    var ePrem = false;
    
    if (premEvent.checked == true){
        ePrem = true;
    }
    
    var eDate = eventDate.value;
    var eLoc = eventLocation.value;
    
    var eLastDate = eventLastDate.value;
    //eLastDate = eLastDate.toString();
    
    var eDetail = eventDetail.value;
    
    var myDB = firebase.firestore();

    
    
    alert("Done!");
    myDB.collection("CalendarPage").add({
        //Name1: word,
        //ThisDay: dt
        EvID: eID,
        EvTYPE : eType,
        PREMIUM: ePrem,
        EvDATE : eDate,
        EvLOCATION : eLoc,
        EvDEADLINE : eLastDate,
        EvDETAIL : eDetail,
        EvLOGO: dr 

    });
    
}

//connect to database when page is loading (Users interface)
function loadData(){
    
    var myDB = firebase.firestore();
    
    //alert("coming..");
    var tod = new Date();
    //alert(tod);

    
    myDB.collection("CalendarPage").where("EvDEADLINE", ">", tod.toISOString()).orderBy("EvDEADLINE").get().then((qs) => {
        //myDB.collection("CalendarPage").where("EvTYPE", "==", "Leaps").get().then((qs) => {
        fbDoc = qs;
        
        qs.forEach((doc) => {
            //console.log(`${doc.id} => ${doc.data()}`);
            //fbDoc[n] = doc;
            
            showthem(doc);
            
            //n++;
        });
    });

    myDB.collection("PremiumUsers").get().then((rs)=>{
        premUser = rs;
    });

    loadDataHot()
}

//loading the first page with Either Vanhackathon, Leap or Mission whichever comes first
function loadDataHot(){

    var myDB = firebase.firestore();
    var tod = new Date();
   
    myDB.collection("CalendarPage").where("EvDEADLINE", ">", tod.toISOString()).orderBy("EvDEADLINE").get().then((qs) => {
        var test = true;
        qs.forEach((doc) => {
            if((doc.data().EvTYPE =="Leaps")|| (doc.data().EvTYPE =="Vanhackathon")||(doc.data().EvTYPE =="Missions")){
                if (test){    
                    var ab = "<img width='100%' height='200px' src='" +doc.data().EvLOGO +"'/>";
                    ab += "<p style='background-color:white;'>"+doc.data().EvID + "<span style='color:white;'>....</span>";
                    ab += doc.data().EvLOCATION + "<span style='color:white;'>....</span>";
                    ab += doc.data().EvDATE + "<span style='color:white;'>....</span>";
                    ab += doc.EvDEADLINE + "<span style='color:white;'>....</span>";
                    ab += "<button  class='b2' onclick=\"shDet('" + doc.data().EvID +"')\">Detials..</button>";
                    ab += "<textarea style='display:none;' id='"+ doc.data().EvID +"' readonly>" + doc.data().EvDETAIL +"</textarea>";
                    ab += "</p><hr/>";
                    page1.innerHTML = ab;
                    
                    test = false;
                }
            }
        });
    });

   

    
}

//draw event boxes of events on the screen
function showthem(doc){
    var bx = "<section class='mysection'>";
    bx += "<img width='100%' height='80px' src='" +doc.data().EvLOGO +"'/>";
    bx += "<h1>" + doc.data().EvTYPE + " - " + doc.data().EvID + "</h1>";
    bx += "<button id ='"+ doc.id +"' onclick=\"applyEvent('" + doc.id +"', '"+doc.data().PREMIUM +"')\" style='float: right; padding: 5px;'>Apply</button>";
    bx += "<p>Date: " + doc.data().EvDATE + "</p>";
    bx += "<p>Location: " + doc.data().EvLOCATION + "</p>";
    bx += "<p>Deadline: " + doc.data().EvDEADLINE + "</p>";
    bx += "<button onclick=\"shDet('" + doc.data().EvID +"')\">Detials..</button>";
    bx += "<textarea style='display:none;' id='"+ doc.data().EvID +"' readonly>" + doc.data().EvDETAIL +"</textarea>";
    
    bx += "</section>.."

    hotspot.innerHTML += bx;
    checker(doc.id);

}

//When User try to apply, check if event is premium and User is premium
function applyEvent(d, pm){
   //load Premium user db
   var db = firebase.firestore();

   
    //check if the current user is login

   firebase.auth().onAuthStateChanged(function(user){
            
        if (user){
            var seen = false;
            premUser.forEach((doc)=>{
                if (doc.data().SPECIALS10 == user.email){
                    seen = true;
                }
            });
            
            //check if it is premium event
            if(pm=="true"){
                if(seen){
                    //This User is a premium user
                    
                        applyPage.style.display = "block";
                    
                        alert("Premium User and Premium Event!");
                    
                    
                }else{
                    alert("Your email " + user.email + " is not Premium. This Event is a premium!");
                }
            }
            else{
                //open apply page. The event is not a premium event
                //applyPage.style.display = "block";
                applyers(d,user.email);

            }
        }
        else{
            alert("You are Not Login!");
        }
       
});


    //alert(d +" : " + pm);
    
}

//Show Event Details
function shDet(info){
    var v = document.getElementById(info);
    detailBody.innerHTML = v.value;
    detailHead.innerHTML = info;
    detail.style.display = "block";
}

//Hide Event Details
function hideDetail(){
    detail.style.display ="none";
}

//show login page
function openLogin(){
    login.style.display = "block";
}

//login to the app
function checkLogin(){
    eml = loginEmail.value;
	pswd = loginPswd.value;
	
    
	firebase.auth().signInWithEmailAndPassword(eml,pswd).then(function(user){
        login.style.display = "none";
        btn1.style.display = "none";
        btn2.style.display = "none";
    }).catch(function(error){
		alert (error.message);
		//msgl.style.display ="none";

	});
}

//When User Apply store it in the database
function applyers(doc, em){
    
    var myDB = firebase.firestore();
    myDB.collection("CalendarPage").doc(doc).collection("APPLIED").add({
        PERSON: em
    });
}

//check for users that have applied from the database
function checker(doc){
    var myDB = firebase.firestore();
    //check if user login
    //alert("I'm checking");
    firebase.auth().onAuthStateChanged(function(user){
        if(user){
            var em = user.email;
            btn1.style.display = "none";
            btn2.style.display = "none";


            myDB.collection("CalendarPage").doc(doc).collection("APPLIED").get().then((res)=>{
                res.forEach((doc2)=>{
                    if (doc2.data().PERSON == em){
                        //the email has applied
                        var bt = document.getElementById(doc);
                        bt.innerHTML ="You Applied!";
                        bt.disabled = true;
        
                    }
                });
            });
        }
    });
    
}


//sorting the events on the page

function sortEvents(){
    var ans = sortChoice.value;
    var sCode = "EvDEADLINE";
    hotspot.innerHTML ="";

    var myDB = firebase.firestore();
    
    //alert("coming..");
    var tod = new Date();
    //alert(tod);
    
    switch(ans){
        case "leap":
                
                myDB.collection("CalendarPage").where("EvTYPE", "==", "Leaps").get().then((qs) => {
                    
                    qs.forEach((doc) => {
                        showthem(doc);
                    });
                });
                break;
        case "vanhackathon":
                myDB.collection("CalendarPage").where("EvTYPE", "==", "Vanhackathon").get().then((qs) => {
        
                    qs.forEach((doc) => {
                        showthem(doc);
                    });
                });
                break;
        case "mission":
                myDB.collection("CalendarPage").where("EvTYPE", "==", "Missions").get().then((qs) => {
        
                    qs.forEach((doc) => {
                        showthem(doc);
                    });
                });
                break;
        case "date":
                myDB.collection("CalendarPage").where("EvDEADLINE", ">", tod.toISOString()).orderBy(sCode).get().then((qs) => {
        
                    qs.forEach((doc) => {
                        showthem(doc);
                    });
                });
                break;
        case "type":
                myDB.collection("CalendarPage").orderBy("EvTYPE").get().then((qs) => {
        
                    qs.forEach((doc) => {
                        showthem(doc);
                    });
                });
                break;
        case "all":
            myDB.collection("CalendarPage").orderBy("EvDEADLINE").get().then((qs)=>{
                qs.forEach((doc) => {
                    showthem(doc);
                });
            });
            break;
        default:
            break;
    


    }

    

    
   
    
}
