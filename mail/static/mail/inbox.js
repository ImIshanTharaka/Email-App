document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});



function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';    //hide the emails-view div
  document.querySelector('#email_element').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';    //show the compose-view div

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // send emails
  document.querySelector('#compose-form').onsubmit = function () {
    fetch('/emails', {          //sending a web request to the url and gets a http response back
      method: 'POST',
      body: JSON.stringify({      //convert a JavaScript object into a string
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    setTimeout(function(){ load_mailbox('sent'); }, 100)    //100ms delay to update the data base for new entry
    return false;
  }
}



function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email_element').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `
  <div class="mt-4">
    <h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>
  </div>
  `;

  // displaying the emails of mailbox
  fetch(`/emails/${mailbox}`)     // fetch GET method
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {           // for each email in emails
      var element = document.createElement('div');
      if (email.read === false){
        element.classList.add('card', 'border-dark', 'text-white', 'bg-secondary', 'mb-2');
      } 
      else{
        element.classList.add('card', 'border-dark', 'text-dark', 'bg-light', 'mb-2');
      }
      element.innerHTML = `
        <div class="card-body">
          <a class="stretched-link" id="card" data-id=${email.id}></a>
          <div class="row mt-3">
            <div class="col-4">
            <p> ${email.sender} </p>
            </div>
            <div class="col-5">
            <p class="font-weight-bold"> ${email.subject} </p>
            </div>
            <div class="col-3">
            <p class="font-italic"> ${email.timestamp}</p>
            </div>
          </div>
        </div>
        `;
      document.querySelector("#emails-view").append(element)
    });
  }
  );
}


// display each email in the mailbox
document.addEventListener('click', event => {      //event argument contains information about the event
  var clicked_email = event.target;             //get the targted element of the event
  if (clicked_email.id == "card") { 
    
    // changing the read status of the mail
    fetch(`/emails/${clicked_email.dataset.id}`, {        // PUT request
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })

    // display the mail
    fetch(`/emails/${clicked_email.dataset.id}`)      // GET request
    .then(response => response.json())
    .then(email => {
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#email_element').style.display = 'block';
      document.querySelector('#compose-view').style.display = 'none';
      var archive_button = "Archive";
      if (email.archived === true) {
        archive_button = "Unarchive";
      }
      email_element.innerHTML = `
      <span class="font-weight-bold"> From: </span> <span> ${email.sender} </span><br>
      <span class="font-weight-bold"> To: </span> <span> ${email.recipients} </span><br>
      <span class="font-weight-bold"> Subject: </span> <span> ${email.subject} </span><br>
      <span class="font-weight-bold"> Timestamp: </span> <span> ${email.timestamp} </span><br>
      <div class="mt-3">
        <button class="btn btn-sm btn-outline-dark" id="reply"> Reply </button>
        <button class="btn btn-sm btn-outline-dark" id="archive"> ${archive_button} </button><br>
      </div> 
      <hr style="height:1px; border:none; color:#333; background-color:#333;">
      ${email.body}
      `;

      // archive button
      document.querySelector('#archive').addEventListener('click', function(){
        var archive_status = !email.archived;       //toggle between true and false
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: archive_status
          })
        })
        location.reload();     // reload-goes to indox page
      })

      // reply button
      document.querySelector('#reply').addEventListener('click', function(){
        compose_email()
        document.querySelector('#compose-recipients').value = email.sender;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: \n\n${email.body}`;
        if (email.subject.slice(0,3) === "Re:"){
          document.querySelector('#compose-subject').value = `${email.subject}`;
        } else {
          document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
        } 
      })
    });
  }
})