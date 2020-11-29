import os
from flask_mail import Message

def detroit_submission_email(mail, data):
    name = data['name']
    addr = data['target_pin']['Address']
    recip_ls = [os.environ.get('MAIL_DEFAULT_RECEIVER')]

    subj = 'Submission: ' + name + ' (' + addr + ')'
    body = "<b>A submission has been received. </b><br>" + \
        "Name: " +  name + "<br>" + \
        "Address: " + addr + "<br>" + \
        "Submission Info: <a href='" + \
        data['log_url'] + "'>Link</a>"

    msg = Message(subj, recipients=recip_ls)
    msg.html = body
    with open(data['output_name'], 'rb') as f:
        msg.attach(data['output_name'][13:],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        f.read())

    mail.send(msg)
