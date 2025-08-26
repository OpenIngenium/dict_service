import requests
import os
import config
import getpass
import json
import jwt
import time

ing_address = config.ING_ADDRESS
auth_endpoint = config.AUTH_ENDPOINT
header = config.HEADER

def setup_login():
    test_user = config.TEST_USER
    test_pass = config.TEST_PASS

    if not (test_user and test_pass):
        test_user = input("Username: ")
        test_pass = getpass.getpass()

    return test_user, test_pass

def login():
    user, password = setup_login()

    login_path = os.path.join(ing_address, auth_endpoint)
    response = requests.get(login_path, auth=requests.auth.HTTPBasicAuth(user, password), verify=False)
    token = json.loads(response.text)['access_token']

    header['Authorization'] = 'Bearer {}'.format(token)

def generate_token():
    iat = int(time.time())
    exp = iat + (30*60)

    private_pem = os.environ.get('PRIVATE_PEM')
    encoded = jwt.encode({'scopes': ['config_mgmt', 'admin'],
                        'exp':exp,
                        'iat':iat,
                        'username':'nicholat'},
                         private_pem,
                         algorithm='RS256')

    return encoded

def set_header():
    token = generate_token().decode('utf-8')
    header['Authorization'] = 'Bearer {}'.format(token)