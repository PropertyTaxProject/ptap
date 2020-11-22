import time
import uuid
import pandas as pd
import gspread
from google.oauth2 import service_account

#open connection with google sheets
credentials = service_account.Credentials.from_service_account_file(
    './.env/ptap-904555bfffb0.json',
    scopes = ["https://spreadsheets.google.com/feeds",
          "https://www.googleapis.com/auth/spreadsheets",
          "https://www.googleapis.com/auth/drive.file",
          "https://www.googleapis.com/auth/drive"])

client = gspread.authorize(credentials)
gsheet = client.open("ptap-log").sheet1

def record_log(uuid_val, process_step_id, exception, form_data):
    new = {}
    new['uuid'] = uuid_val
    new['process_step_id'] = process_step_id
    new['exception'] = repr(exception)
    new['time'] = time.time()

    #google sheets log
    for i, j in form_data.items():
        if i == 'target_pin':
            new[i] = j['PIN']
        elif i == 'comparables':
            cnt = 1
            for comp in j:
                new['comp_' + str(cnt)] = comp['PIN']
                cnt += 1
        else:
            new[i] = j

    test = [list(new.keys())] + [list(new.values())]
    gsheet.append_rows(test)

    #csv log, depreciate soon
    tmp = pd.DataFrame(new, index=[0])
    tmp = pd.concat(
        [tmp, pd.json_normalize(form_data).drop('uuid', axis=1, errors='ignore')], axis=1)
    p = 'tmp_log.csv'

    tmp.to_csv(p, index=False, mode='a')


    if exception:
        print(tmp.T)

def logger(form_data, process_step_id, exception=''):
    if process_step_id == 'address_finder': #give uuid
        uuid_val = uuid.uuid4().urn[9:]
        record_log(uuid_val, process_step_id, exception, form_data)
        return uuid_val
    elif 'uuid' in form_data: #if uuid given
        record_log(form_data['uuid'], process_step_id, exception, form_data)
    else: #missing
        record_log('missing', process_step_id, exception, form_data)
    return
