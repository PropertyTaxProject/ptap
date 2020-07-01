#!/usr/bin/env python
# coding: utf-8

# In[1]:


import selenium
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
import time

from selenium.webdriver import Chrome
ACCOUNT_EMAIL = 'austinzhang1018@gmail.com'
ACCOUNT_PASSWORD = '6hf3JAbYphXbgsD'
FILER_NAME = 'Johnny Appleseed'
FILER_PHONE = '0123456789'
ATTORNEY_AUTH_FORM = '/home/austin/Documents/test.pdf'
COMP_PROPS_FORM = '/home/austin/Documents/test1.pdf'
APPEAL_NARRATIVE = '/home/austin/Documents/test2.pdf'
APPEAL_ADDRESS = 'https://propertytaxfilings.cookcountyil.gov/Filing/Search/Form/CCAO_APPEAL_RES_012920'


# In[2]:


def login():
    driver.get("https://propertytaxfilings.cookcountyil.gov/")
    driver.find_element_by_id('Email').send_keys(ACCOUNT_EMAIL)
    driver.find_element_by_id('Password').send_keys(ACCOUNT_PASSWORD)
    driver.find_element_by_id('login').click()


# In[3]:


# navigates to residential appeal page and inputs pin
def begin_appeal(pin):
    driver.get(APPEAL_ADDRESS)
    pin_entry = driver.find_element_by_name('PARID')
    pin_entry.send_keys(pin)
    driver.find_element_by_id('SearchButton').click()
    try:
        WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.LINK_TEXT, "Start Filing")))
    except:
        # failed to find pin
        raise Exception('Could not find property for pin ' + str(pin))

    driver.find_element_by_link_text('Start Filing').click()

    WebDriverWait(driver, 5).until(EC.alert_is_present())
    clickthrough_alert()


# In[4]:


# auto clickthrough alerts
def clickthrough_alert(): 
    try:
        driver.switch_to.alert.accept()
        return True
    except:
        return False

def activity_window():
    driver.find_element_by_name('ACKN').click()
    driver.find_element_by_name('RULESACKN').click()
    click_next()


# In[5]:


def click_next():
    try:
        WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.XPATH, '//*[@title="Next"]')))
        driver.find_element_by_xpath('//*[@title="Next"]').click()
    except:
        # failed to find pin
        raise Exception('Could not find next button')
    time.sleep(3)


def verify_parcel():
    click_next()


# In[6]:


def primary_pin():
    click_next()
    
def additional_pins():
    click_next()


# In[7]:


def filer():
    driver.find_element_by_xpath("//select[@name='IS_AGENT_YN']/option[text()='ATTORNEY/TAX REPRESENTATIVE']").click()
    # TODO: needs tax rep code to write this part
    click_next()
    # HERE FOR NOW BECAUSE WE CAN'T FILL THIS OUT
    input('please manually click through and press enter when complete')
    # NOT WORKING NEED TO MANUALLY CLICK FOR TESTING NOW
#     driver.find_element_by_xpath('/html/body/div[11]/div[2]/div/button[2]')
def property_chars():
    click_next()
    


# In[8]:


def appeal_application():
    driver.find_element_by_name('CHKBX_LACKOFUNIFORM').click()
    driver.find_element_by_name('CHKBX_SINGLEFAM').click()
    driver.find_element_by_name('LACKOFUNIFORM_EXPL').send_keys('See attachment')
    click_next()


# In[9]:


def attachments(): # TODO: Make this more robust/less prone to error if the webpage changes
    file_uploads = driver.find_elements_by_name('files')
    # must do in this order as it spawns new elements that change length of array
    file_uploads[6].send_keys(COMP_PROPS_FORM)
    # currently need the sleeps or else system glitches and adds multiple of same file
    # TODO: Make this more robust and not time dependent
    time.sleep(2)
    file_uploads[3].send_keys(ATTORNEY_AUTH_FORM)
    time.sleep(2)
    file_uploads[1].send_keys(APPEAL_NARRATIVE)
    time.sleep(5)
    click_next()


# In[10]:


def finish_submission():
    driver.find_element_by_name('F_NAME').send_keys(FILER_NAME)
    driver.find_element_by_name('F_PHONE').send_keys(FILER_PHONE)
    # NEED TO ADD SUBMIT BUT NOT DOING YET - don't want accidental submissions


# In[11]:


driver = Chrome()
driver.set_window_size(400, 800)
driver.set_window_position(0, 0)

login()
begin_appeal('24013010650000')
clickthrough_alert()


# In[12]:


activity_window()


# In[13]:


verify_parcel()


# In[14]:


primary_pin()
# add better delay method later
time.sleep(2)
additional_pins()


# In[15]:


filer()
property_chars()


# In[16]:


appeal_application()


# In[17]:


attachments()


# In[18]:


file_uploads = driver.find_elements_by_name('files')
print(len(file_uploads))


# In[19]:


finish_submission()

