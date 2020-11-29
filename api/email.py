import os
from flask_mail import Message

def detroit_submission_email(mail, data):
    name = data['name']
    addr = data['target_pin']['Address']

    subj = 'Submission: ' + name + ' (' + addr + ')'
    body = "<b>A submission has been received. </b><br>" + \
        "Name: " +  name + "<br>" + \
        "Address: " + addr + "<br>" + \
        "Submission Info: <a href='" + \
        "https://docs.google.com/spreadsheets/d/1f5B35iEi01m5V_vSebejxGoRXTZPbuAUhIj8ZWflUE0/edit#gid=0&range=A17:J17" + \
        "'>Link</a>"

    msg = Message(subj,
                recipients=[os.environ.get('MAIL_DEFAULT_RECEIVER')])
    msg.html = body
    with open(data['output_name'], 'rb') as f:
        msg.attach(data['output_name'][13:], 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        f.read())
    mail.send(msg)

    