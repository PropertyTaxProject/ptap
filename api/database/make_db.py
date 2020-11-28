import sqlite3
import pandas as pd

data_dict = {}
data_dict['cook_sf'] =  pd.concat([pd.read_csv('./../cooksf1.csv', dtype={'PIN':str, 'st_num':str}), 
                                   pd.read_csv('./../cooksf2.csv', dtype={'PIN':str, 'st_num':str})])
data_dict['detroit_sf'] = pd.read_csv('./../detroit_sf.csv', dtype={'st_num':str})

con = sqlite3.connect('data.sqlite')

data_dict['cook_sf'].to_sql('cook', con, index=False, if_exists='replace')
data_dict['detroit_sf'].to_sql('detroit', con, index=False, if_exists='replace')

con.execute('VACUUM')

#debug
pd.read_sql('SELECT count(*) FROM cook', con)
pd.read_sql('SELECT count(*) FROM detroit', con)
pd.read_sql('pragma table_info("detroit")', con)
