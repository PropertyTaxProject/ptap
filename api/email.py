import os
from flask_mail import Message

def detroit_submission_email(mail, data):
    #email to ptap account with info
    name = data['name']
    addr = data['target_pin']['Address']
    submit_email = [data['email']]
    ptap = [os.environ.get('PTAP_MAIL')]
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
        "The Property Tax Appeal Project has received a submission for " + addr + ". " + \
        "An advocate will reach out to you to finalize your application. If you have any questions until then, " + \
        "please contact us via phone at 313-438-8698 or via email at law-propertytax@umich.edu. <br><br> " + \
        """Steps in Appeals Process:<ul>
        <li><b>Step 1</b>: Complete this online application by <b>February 15, 2020</b>.</li>
        <li><b>Step 2</b>: An advocate will call you to review your Application and will let you know whether we can help you.</li>
        <li><b>Step 3</b>: If your Application is accepted, an advocate will work with you to complete your appeal documents.</li>
        <li><b>Step 4</b>: Your advocate will submit your documents to the Assessor’s Review by <b>February 22, 2021</b></li>
        <li><b>Step 5</b>: Your advocate will submit your documents to the March Board of Review by <b>March 8, 2021</b></li>
        <li><b>Step 6</b>: Before <b>June of 2021</b>, the Board of Review will send you a letter notifying you whether your home's assessed value is reduced because of your appeal.</li>
        </ul>""" + \
        "<br><br> Thank you, <br><br>The Property Tax Appeal Project Automated System<br><br>" + \
        "Replies to this email address are not monitored."
    msg2 = Message(subj, recipients=submit_email, reply_to=uofm[0])
    msg2.html = body
    mail.send(msg2)
    print('emailed')


def cook_submission_email(mail, data):
    #email to ptap account with info
    name = data['name']
    addr = data['target_pin']['Address']
    submit_email = [data['email']]
    ptap = [os.environ.get('PTAP_MAIL')]

    subj = 'Property Tax Appeal Project Submission: ' + name + ' (' + addr + ')'
    body = "<b>A submission has been received. </b><br>" + \
        "Name: " +  name + "<br>" + \
        "Address: " + addr + "<br>" + \
        "Submission Info: <a href='" + \
        data['log_url'] + "'>Link</a>"

    msg = Message(subj, recipients=submit_email, cc=ptap)
    msg.html = body
    with open(data['output_name'], 'rb') as f:
        msg.attach(data['output_name'][13:],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        f.read())
    mail.send(msg)
'''


    #receipt to user
    body = "Dear " + name + ',<br><br>' + \
        "The Property Tax Appeal Project has received a submission for " + addr + ". " + \
        "An advocate will reach out to you to finalize your application. If you have any questions until then, " + \
        "please contact us via phone at 313-438-8698 or via email at law-propertytax@umich.edu. <br><br> " + \
        """Steps in Appeals Process:<ul>
        <li><b>Step 1</b>: Complete this online application by <b>February 15, 2020</b>.</li>
        <li><b>Step 2</b>: An advocate will call you to review your Application and will let you know whether we can help you.</li>
        <li><b>Step 3</b>: If your Application is accepted, an advocate will work with you to complete your appeal documents.</li>
        <li><b>Step 4</b>: Your advocate will submit your documents to the Assessor’s Review by <b>February 22, 2021</b></li>
        <li><b>Step 5</b>: Your advocate will submit your documents to the March Board of Review by <b>March 8, 2021</b></li>
        <li><b>Step 6</b>: Before <b>June of 2021</b>, the Board of Review will send you a letter notifying you whether your home's assessed value is reduced because of your appeal.</li>
        </ul>""" + \
        "<br><br> Thank you, <br><br>The Property Tax Appeal Project Automated System<br><br>" + \
        "Replies to this email address are not monitored."
    msg2 = Message(subj, recipients=submit_email, reply_to=uofm[0])
    msg2.html = body
    mail.send(msg2)
    print('emailed')
'''