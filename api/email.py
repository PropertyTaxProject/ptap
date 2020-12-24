import os
from flask_mail import Message

def detroit_submission_email(mail, data):
    #email to ptap account with info
    name = data['name']
    addr = data['target_pin']['Address']
    recip_ls = [os.environ.get('MAIL_DEFAULT_RECEIVER')]

    subj = 'Property Tax Appeal Project Submission: ' + name + ' (' + addr + ')'
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

    #receipt to user
    recip_ls.append(data['email'])

    body = "Dear " + name + ',<br><br>' + \
        "The Property Tax Appeal Project has received a submission for " + addr + "." + \
        "An advocate will reach out to you to finalize your application. If you have any questions until then, " + \
        "please contact us @. <br><br> Thank you, <br><br>The Property Tax Appeal Project Automated System"
    
    msg2 = Message(subj, recipients=recip_ls)
    msg2.html = body

    mail.send(msg2)