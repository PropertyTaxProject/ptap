import os
from flask_mail import Message

def detroit_submission_email(mail, data):
    #email to ptap account with info
    name = data['name']
    addr = data['target_pin']['Address']
    submit_email = [data['email']]
    ptap = [os.environ.get('MAIL_DEFAULT_SENDER')]
    uofm = [os.environ.get('UOFM_MAIL')]

    subj = 'Property Tax Appeal Project Submission: ' + name + ' (' + addr + ')'
    body = "<b>A submission has been received. </b><br>" + \
        "Name: " +  name + "<br>" + \
        "Address: " + addr + "<br>" + \
        "Submission Info: <a href='" + \
        data['log_url'] + "'>Link</a>"

    msg = Message(subj, recipients=uofm, cc=ptap)
    msg.html = body
    with open(data['output_name'], 'rb') as f:
        msg.attach(data['output_name'][13:],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        f.read())
    mail.send(msg)

    #receipt to user
    body = "Dear " + name + ',<br><br>' + \
        "The Property Tax Appeal Project has received a submission for " + addr + "." + \
        " An advocate will reach out to you to finalize your application. If you have any questions until then, " + \
        "please contact us via phone at 313-438-8698 or via email at law-propertytax@umich.edu. <br><br> Thank you, <br><br>The Property Tax Appeal Project Automated System"
    msg2 = Message(subj, recipients=submit_email, reply_to=uofm[0], bcc=ptap)
    msg2.html = body
    mail.send(msg2)
